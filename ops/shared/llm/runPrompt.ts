import fs from "node:fs/promises";
import path from "node:path";

interface RunPromptInput {
  systemPromptPath: string;
  input: unknown;
}

type LlmProvider = "openai" | "anthropic";

const runtimeEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env || {};
const readEnv = (key: string): string =>
  (typeof process !== "undefined" ? process.env[key] : "") || runtimeEnv[key] || "";

const resolveAbsolutePath = (filePath: string): string =>
  path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);

const THINKING_STANDARDS_PATH = path.resolve(process.cwd(), "knowledge/editorial/thinking-standards.md");
const THINKING_STANDARDS_TARGETS = new Set([
  path.resolve(process.cwd(), "ops/publishing/prompts/contentPlanner.system.md"),
  path.resolve(process.cwd(), "ops/publishing/prompts/writer.system.md"),
  path.resolve(process.cwd(), "ops/publishing/prompts/brandGuardian.system.md"),
]);

const shouldInjectThinkingStandards = (promptPath: string): boolean =>
  THINKING_STANDARDS_TARGETS.has(promptPath);

const readPromptFromDisk = async (filePath: string): Promise<string> => {
  const absolutePath = resolveAbsolutePath(filePath);
  const systemPrompt = await fs.readFile(absolutePath, "utf8");

  if (!shouldInjectThinkingStandards(absolutePath)) {
    return systemPrompt;
  }

  const thinkingStandards = await fs.readFile(THINKING_STANDARDS_PATH, "utf8");
  return `${systemPrompt.trim()}

-----------------------------------
THINKING STANDARDS (AUTO-INJECTED)
-----------------------------------
${thinkingStandards.trim()}
`;
};

const extractTextBlocks = (content: unknown): string => {
  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((block) => {
      if (!block || typeof block !== "object") return "";
      const directText = (block as { type?: string; text?: string }).text;
      if (typeof directText === "string") {
        return directText;
      }

      const nestedContent = (block as { content?: unknown }).content;
      if (!Array.isArray(nestedContent)) {
        return "";
      }

      return nestedContent
        .map((item) => {
          if (!item || typeof item !== "object") return "";
          const nestedText = (item as { text?: string }).text;
          return typeof nestedText === "string" ? nestedText : "";
        })
        .join("\n")
        .trim();
    })
    .join("\n")
    .trim();
};

interface ModelJsonParseErrorDetails {
  parserStage: string;
  rawPreview: string;
  originalParseMessage: string;
}

class ModelJsonParseError extends Error {
  readonly details: ModelJsonParseErrorDetails;

  constructor(details: ModelJsonParseErrorDetails) {
    super(
      `Invalid JSON from model [stage=${details.parserStage}] ` +
        `[preview=${details.rawPreview}] ` +
        `[parseMessage=${details.originalParseMessage}]`,
    );
    this.name = "ModelJsonParseError";
    this.details = details;
  }
}

type LlmExecutionErrorCode =
  | "missing_api_key"
  | "network_disabled"
  | "provider_timeout"
  | "provider_http_error"
  | "provider_connection_error"
  | "provider_request_failed"
  | "empty_model_output"
  | "invalid_model_json";

interface LlmExecutionContext {
  provider: LlmProvider;
  model: string;
  systemPromptPath: string;
  attempt: number;
  timeoutMs: number;
  durationMs?: number;
  status?: number;
}

class LlmExecutionError extends Error {
  readonly code: LlmExecutionErrorCode;
  readonly context: LlmExecutionContext;
  override readonly cause?: unknown;

  constructor(code: LlmExecutionErrorCode, context: LlmExecutionContext, detail: string, cause?: unknown) {
    const contextParts = [
      `code=${code}`,
      `provider=${context.provider}`,
      `model=${context.model}`,
      `prompt=${context.systemPromptPath}`,
      `attempt=${context.attempt}`,
      `timeoutMs=${context.timeoutMs}`,
      typeof context.durationMs === "number" ? `durationMs=${context.durationMs}` : "",
      typeof context.status === "number" ? `status=${context.status}` : "",
    ].filter(Boolean);

    super(`LLM prompt failed [${contextParts.join("] [")}]: ${detail}`);
    this.name = "LlmExecutionError";
    this.code = code;
    this.context = context;
    this.cause = cause;
  }
}

const previewRaw = (text: string): string => text.replace(/\s+/g, " ").slice(0, 220);

const readPositiveIntEnv = (key: string, fallback: number): number => {
  const raw = readEnv(key).trim();
  if (!raw) {
    return fallback;
  }

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${key} value "${raw}". Expected a positive integer.`);
  }

  return parsed;
};

const isTruthyEnv = (key: string): boolean => {
  const normalized = readEnv(key).trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
};

const isNetworkDisabled = (): boolean =>
  isTruthyEnv("CODEX_SANDBOX_NETWORK_DISABLED") || isTruthyEnv("SANDBOX_NETWORK_DISABLED");

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  return "unknown_error";
};

const getErrorStatus = (error: unknown): number | undefined => {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const status = (error as { status?: unknown }).status;
  return typeof status === "number" ? status : undefined;
};

const classifyProviderError = (error: unknown): Exclude<LlmExecutionErrorCode, "missing_api_key" | "network_disabled" | "empty_model_output" | "invalid_model_json"> => {
  const message = getErrorMessage(error).toLowerCase();
  const status = getErrorStatus(error);

  if (message.includes("timeout") || message.includes("timed out")) {
    return "provider_timeout";
  }

  if (typeof status === "number") {
    return "provider_http_error";
  }

  if (
    message.includes("fetch failed") ||
    message.includes("network") ||
    message.includes("socket") ||
    message.includes("econn") ||
    message.includes("enotfound") ||
    message.includes("tls")
  ) {
    return "provider_connection_error";
  }

  return "provider_request_failed";
};

const buildAbortSignal = (timeoutMs: number): AbortSignal | undefined => {
  if (typeof AbortSignal === "undefined" || typeof AbortSignal.timeout !== "function") {
    return undefined;
  }

  return AbortSignal.timeout(timeoutMs);
};

// Some models (e.g. gpt-4.1-mini) occasionally emit spuriously escaped opening
// quotes on JSON string values, e.g.  "excerpt": \"value"  instead of  "excerpt": "value"
// This pass strips those stray leading backslashes before the parser runs.
const fixSpuriouslyEscapedStringValues = (text: string): string =>
  text.replace(/:\s*\\"(?=[^\\])/g, ': "');

const escapeControlCharactersInJsonStrings = (text: string): string => {
  let output = "";
  let inString = false;
  let escaped = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (inString) {
      if (escaped) {
        output += char;
        escaped = false;
        continue;
      }

      if (char === "\\") {
        output += char;
        escaped = true;
        continue;
      }

      if (char === "\"") {
        output += char;
        inString = false;
        continue;
      }

      const code = char.charCodeAt(0);
      if (code <= 0x1f) {
        if (char === "\n") {
          output += "\\n";
        } else if (char === "\r") {
          output += "\\r";
        } else if (char === "\t") {
          output += "\\t";
        } else {
          output += `\\u${code.toString(16).padStart(4, "0")}`;
        }
        continue;
      }
    } else if (char === "\"") {
      inString = true;
    }

    output += char;
  }

  return output;
};

// Some model outputs include unescaped double quotes inside JSON string values,
// especially in long prose fields like revisedText. Treat quotes as string
// terminators only when the following significant token is valid JSON syntax.
const escapeBareQuotesInsideJsonStrings = (text: string): string => {
  let output = "";
  let inString = false;
  let escaped = false;

  const nextNonWhitespaceChar = (start: number): string => {
    for (let index = start; index < text.length; index += 1) {
      const char = text[index];
      if (!/\s/.test(char)) {
        return char;
      }
    }

    return "";
  };

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (!inString) {
      output += char;
      if (char === "\"") {
        inString = true;
        escaped = false;
      }
      continue;
    }

    if (escaped) {
      output += char;
      escaped = false;
      continue;
    }

    if (char === "\\") {
      output += char;
      escaped = true;
      continue;
    }

    if (char === "\"") {
      const nextChar = nextNonWhitespaceChar(index + 1);
      const isStringTerminator =
        nextChar === ":" || nextChar === "," || nextChar === "}" || nextChar === "]" || nextChar === "";

      if (isStringTerminator) {
        output += char;
        inString = false;
      } else {
        output += "\\\"";
      }
      continue;
    }

    output += char;
  }

  return output;
};

export const stripCodeFences = (text: string): string => {
  const trimmed = text.trim();
  const fullFenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fullFenceMatch?.[1]) {
    return fullFenceMatch[1];
  }

  return trimmed
    .replace(/```(?:json)?/gi, "")
    .replace(/```/g, "")
    .trim();
};

const extractFirstTopLevelJsonObject = (text: string): string | null => {
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (start === -1) {
      if (char === "{") {
        start = index;
        depth = 1;
      }
      continue;
    }

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return text.slice(start, index + 1);
      }
    }
  }

  return null;
};

const parseWithOneExtraLevel = (candidate: string): unknown => {
  const parsed = JSON.parse(candidate);

  if (typeof parsed === "string") {
    const inner = parsed.trim();
    const looksLikeJson =
      (inner.startsWith("{") && inner.endsWith("}")) ||
      (inner.startsWith("[") && inner.endsWith("]"));
    if (looksLikeJson) {
      return JSON.parse(inner);
    }
  }

  return parsed;
};

export const parseModelJson = (rawText: string): any => {
  const source = rawText ?? "";
  const directInput = source.trim();

  if (!directInput) {
    throw new ModelJsonParseError({
      parserStage: "input_validation",
      rawPreview: "",
      originalParseMessage: "Model output is empty.",
    });
  }

  try {
    return parseWithOneExtraLevel(directInput);
  } catch {
    // Continue with extraction path.
  }

  const extracted = extractFirstTopLevelJsonObject(source);
  const extractedOrRaw = extracted ?? source;
  const normalized = escapeBareQuotesInsideJsonStrings(
    escapeControlCharactersInJsonStrings(
      fixSpuriouslyEscapedStringValues(stripCodeFences(extractedOrRaw).trim()),
    ),
  );

  try {
    return parseWithOneExtraLevel(normalized);
  } catch (error) {
    const parseMessage = error instanceof Error ? error.message : "unknown_parse_error";
    throw new ModelJsonParseError({
      parserStage: extracted ? "extract_object_strip_fences_parse" : "strip_fences_parse",
      rawPreview: previewRaw(source),
      originalParseMessage: parseMessage,
    });
  }
};

const getProvider = (): LlmProvider => {
  const provider = readEnv("LLM_PROVIDER").trim().toLowerCase();
  if (!provider || provider === "openai") {
    return "openai";
  }
  if (provider === "anthropic") {
    return "anthropic";
  }

  throw new Error(`Unsupported LLM_PROVIDER "${provider}". Expected "openai" or "anthropic".`);
};

const getModel = (provider: LlmProvider): string => {
  const configuredModel = readEnv("EDITORIAL_LLM_MODEL").trim();
  if (configuredModel) {
    return configuredModel;
  }

  if (provider === "anthropic") {
    return "claude-3-5-sonnet-20240620";
  }

  return "gpt-4.1-mini";
};

const MODEL_JSON_PARSE_RETRY_LIMIT = 2;
const MODEL_REQUEST_TIMEOUT_MS = readPositiveIntEnv("EDITORIAL_LLM_TIMEOUT_MS", 60_000);

interface FetchModelTextArgs {
  provider: LlmProvider;
  model: string;
  systemPrompt: string;
  input: unknown;
  systemPromptPath: string;
  attempt: number;
  timeoutMs: number;
}

interface FetchModelTextResult {
  text: string;
  durationMs: number;
}

type FetchModelTextImpl = (args: FetchModelTextArgs) => Promise<FetchModelTextResult>;

const fetchModelText = async ({
  provider,
  model,
  systemPrompt,
  input,
  systemPromptPath,
  attempt,
  timeoutMs,
}: {
  provider: LlmProvider;
  model: string;
  systemPrompt: string;
  input: unknown;
  systemPromptPath: string;
  attempt: number;
  timeoutMs: number;
}): Promise<FetchModelTextResult> => {
  const context: LlmExecutionContext = {
    provider,
    model,
    systemPromptPath,
    attempt,
    timeoutMs,
  };

  if (isNetworkDisabled()) {
    throw new LlmExecutionError(
      "network_disabled",
      context,
      "Network access is disabled for this execution environment.",
    );
  }

  const startedAt = Date.now();
  const signal = buildAbortSignal(timeoutMs);

  try {
    if (provider === "anthropic") {
      const apiKey = readEnv("ANTHROPIC_API_KEY");
      if (!apiKey) {
        throw new LlmExecutionError(
          "missing_api_key",
          context,
          "Missing ANTHROPIC_API_KEY for prompt execution.",
        );
      }

      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const client = new Anthropic({ apiKey, maxRetries: 0, timeout: timeoutMs });
      const response = await client.messages.create(
        {
          model,
          max_tokens: 3200,
          temperature: 0.4,
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: JSON.stringify(input),
            },
          ],
        },
        {
          maxRetries: 0,
          timeout: timeoutMs,
          signal,
        },
      );

      return {
        text: extractTextBlocks(response.content),
        durationMs: Date.now() - startedAt,
      };
    }

    const apiKey = readEnv("OPENAI_API_KEY");
    if (!apiKey) {
      throw new LlmExecutionError("missing_api_key", context, "Missing OPENAI_API_KEY for prompt execution.");
    }

    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey, maxRetries: 0, timeout: timeoutMs });
    const response = await client.responses.create(
      {
        model,
        max_output_tokens: 3200,
        temperature: 0.4,
        input: [
          {
            role: "system",
            content: [{ type: "input_text", text: systemPrompt }],
          },
          {
            role: "user",
            content: [{ type: "input_text", text: JSON.stringify(input) }],
          },
        ],
      },
      {
        maxRetries: 0,
        timeout: timeoutMs,
        signal,
      },
    );

    return {
      text:
        (typeof response.output_text === "string" ? response.output_text : "").trim() ||
        extractTextBlocks(response.output),
      durationMs: Date.now() - startedAt,
    };
  } catch (error) {
    if (error instanceof LlmExecutionError) {
      throw error;
    }

    throw new LlmExecutionError(
      classifyProviderError(error),
      {
        ...context,
        durationMs: Date.now() - startedAt,
        status: getErrorStatus(error),
      },
      getErrorMessage(error),
      error,
    );
  }
};

interface RunPromptDependencies {
  fetchModelTextImpl?: FetchModelTextImpl;
  readPromptFromDiskImpl?: typeof readPromptFromDisk;
}

export const runPromptWithDependencies = async (
  { systemPromptPath, input }: RunPromptInput,
  dependencies: RunPromptDependencies = {},
): Promise<any> => {
  const { fetchModelTextImpl = fetchModelText, readPromptFromDiskImpl = readPromptFromDisk } = dependencies;
  const provider = getProvider();
  const resolvedSystemPromptPath = resolveAbsolutePath(systemPromptPath);
  const systemPrompt = await readPromptFromDiskImpl(resolvedSystemPromptPath);
  const model = getModel(provider);
  let lastParseError: ModelJsonParseError | null = null;

  for (let attempt = 0; attempt <= MODEL_JSON_PARSE_RETRY_LIMIT; attempt += 1) {
    const currentAttempt = attempt + 1;
    const startedAt = Date.now();
    const { text, durationMs } = await (async () => {
      try {
        return await fetchModelTextImpl({
          provider,
          model,
          systemPrompt,
          input,
          systemPromptPath: resolvedSystemPromptPath,
          attempt: currentAttempt,
          timeoutMs: MODEL_REQUEST_TIMEOUT_MS,
        });
      } catch (error) {
        if (error instanceof LlmExecutionError) {
          throw error;
        }

        throw new LlmExecutionError(
          classifyProviderError(error),
          {
            provider,
            model,
            systemPromptPath: resolvedSystemPromptPath,
            attempt: currentAttempt,
            timeoutMs: MODEL_REQUEST_TIMEOUT_MS,
            durationMs: Date.now() - startedAt,
            status: getErrorStatus(error),
          },
          getErrorMessage(error),
          error,
        );
      }
    })();

    if (!text) {
      throw new LlmExecutionError(
        "empty_model_output",
        {
          provider,
          model,
          systemPromptPath: resolvedSystemPromptPath,
          attempt: currentAttempt,
          timeoutMs: MODEL_REQUEST_TIMEOUT_MS,
          durationMs,
        },
        "Model returned empty output.",
      );
    }

    try {
      return parseModelJson(text);
    } catch (error) {
      if (error instanceof ModelJsonParseError) {
        lastParseError = error;
        if (attempt < MODEL_JSON_PARSE_RETRY_LIMIT) {
          continue;
        }
        throw new LlmExecutionError(
          "invalid_model_json",
          {
            provider,
            model,
            systemPromptPath: resolvedSystemPromptPath,
            attempt: currentAttempt,
            timeoutMs: MODEL_REQUEST_TIMEOUT_MS,
            durationMs,
          },
          error.message,
          error,
        );
      }

      const message = error instanceof Error ? error.message : "unknown_json_parse_error";
      throw new LlmExecutionError(
        "invalid_model_json",
        {
          provider,
          model,
          systemPromptPath: resolvedSystemPromptPath,
          attempt: currentAttempt,
          timeoutMs: MODEL_REQUEST_TIMEOUT_MS,
          durationMs,
        },
        `Invalid JSON from model [stage=unexpected]: ${message}`,
        error,
      );
    }
  }

  throw new LlmExecutionError(
    "invalid_model_json",
    {
      provider,
      model,
      systemPromptPath: resolvedSystemPromptPath,
      attempt: MODEL_JSON_PARSE_RETRY_LIMIT + 1,
      timeoutMs: MODEL_REQUEST_TIMEOUT_MS,
    },
    lastParseError?.message ?? "Invalid JSON from model [stage=unexpected]: exhausted_retries",
    lastParseError ?? undefined,
  );
};

export const runPrompt = async ({ systemPromptPath, input }: RunPromptInput): Promise<any> =>
  runPromptWithDependencies({ systemPromptPath, input });
