import assert from "node:assert/strict";

import { runPrompt, runPromptWithDependencies } from "../ops/shared/llm/runPrompt";

const PROMPT_PATH = "ops/publishing/prompts/writer.system.md";

type EnvPatch = Record<string, string | undefined>;

const withEnv = async <T>(patch: EnvPatch, fn: () => Promise<T>): Promise<T> => {
  const previous = new Map<string, string | undefined>();

  for (const [key, value] of Object.entries(patch)) {
    previous.set(key, process.env[key]);
    if (typeof value === "undefined") {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  try {
    return await fn();
  } finally {
    for (const [key, value] of previous.entries()) {
      if (typeof value === "undefined") {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
};

const captureError = async (patch: EnvPatch): Promise<Error & { code?: string }> =>
  withEnv(patch, async () => {
    try {
      await runPrompt({
        systemPromptPath: PROMPT_PATH,
        input: { smoke: true, purpose: "runPrompt hardening smoke" },
      });
      throw new Error("Expected runPrompt to fail, but it succeeded.");
    } catch (error) {
      assert.ok(error instanceof Error, "Expected an Error instance.");
      return error as Error & { code?: string };
    }
  });

const main = async (): Promise<void> => {
  const invalidProviderError = await captureError({
    LLM_PROVIDER: "bogus",
    CODEX_SANDBOX_NETWORK_DISABLED: undefined,
    OPENAI_API_KEY: undefined,
    ANTHROPIC_API_KEY: undefined,
  });
  assert.match(invalidProviderError.message, /Unsupported LLM_PROVIDER "bogus"/);

  const networkDisabledError = await captureError({
    LLM_PROVIDER: "openai",
    OPENAI_API_KEY: "dummy",
    ANTHROPIC_API_KEY: undefined,
    CODEX_SANDBOX_NETWORK_DISABLED: "1",
  });
  assert.equal(networkDisabledError.code, "network_disabled");
  assert.match(networkDisabledError.message, /\[code=network_disabled\]/);
  assert.match(networkDisabledError.message, /\[attempt=1\]/);
  assert.match(networkDisabledError.message, /\[provider=openai\]/);

  const missingApiKeyError = await captureError({
    LLM_PROVIDER: "openai",
    OPENAI_API_KEY: undefined,
    ANTHROPIC_API_KEY: undefined,
    CODEX_SANDBOX_NETWORK_DISABLED: undefined,
  });
  assert.equal(missingApiKeyError.code, "missing_api_key");
  assert.match(missingApiKeyError.message, /\[code=missing_api_key\]/);
  assert.match(missingApiKeyError.message, /Missing OPENAI_API_KEY/);
  assert.match(missingApiKeyError.message, /\[provider=openai\]/);

  const providerTimeoutError = await withEnv(
    {
      LLM_PROVIDER: "openai",
      OPENAI_API_KEY: undefined,
      ANTHROPIC_API_KEY: undefined,
      CODEX_SANDBOX_NETWORK_DISABLED: undefined,
    },
    async () => {
      try {
        await runPromptWithDependencies(
          {
            systemPromptPath: PROMPT_PATH,
            input: { smoke: true, purpose: "runPrompt timeout smoke" },
          },
          {
            fetchModelTextImpl: async () => {
              throw new Error("Request timed out in smoke stub.");
            },
          },
        );
        throw new Error("Expected timeout stub to fail, but it succeeded.");
      } catch (error) {
        assert.ok(error instanceof Error, "Expected an Error instance.");
        return error as Error & { code?: string };
      }
    },
  );
  assert.equal(providerTimeoutError.code, "provider_timeout");
  assert.match(providerTimeoutError.message, /\[code=provider_timeout\]/);
  assert.match(providerTimeoutError.message, /\[provider=openai\]/);
  assert.match(providerTimeoutError.message, /\[attempt=1\]/);
  assert.match(providerTimeoutError.message, /Request timed out in smoke stub/);

  const providerHttpError = await withEnv(
    {
      LLM_PROVIDER: "openai",
      OPENAI_API_KEY: undefined,
      ANTHROPIC_API_KEY: undefined,
      CODEX_SANDBOX_NETWORK_DISABLED: undefined,
    },
    async () => {
      try {
        await runPromptWithDependencies(
          {
            systemPromptPath: PROMPT_PATH,
            input: { smoke: true, purpose: "runPrompt http error smoke" },
          },
          {
            fetchModelTextImpl: async () => {
              const error = new Error("Synthetic upstream HTTP failure.");
              Object.assign(error, { status: 429 });
              throw error;
            },
          },
        );
        throw new Error("Expected HTTP error stub to fail, but it succeeded.");
      } catch (error) {
        assert.ok(error instanceof Error, "Expected an Error instance.");
        return error as Error & { code?: string };
      }
    },
  );
  assert.equal(providerHttpError.code, "provider_http_error");
  assert.match(providerHttpError.message, /\[code=provider_http_error\]/);
  assert.match(providerHttpError.message, /\[status=429\]/);
  assert.match(providerHttpError.message, /\[provider=openai\]/);
  assert.match(providerHttpError.message, /Synthetic upstream HTTP failure/);

  const providerConnectionError = await withEnv(
    {
      LLM_PROVIDER: "openai",
      OPENAI_API_KEY: undefined,
      ANTHROPIC_API_KEY: undefined,
      CODEX_SANDBOX_NETWORK_DISABLED: undefined,
    },
    async () => {
      try {
        await runPromptWithDependencies(
          {
            systemPromptPath: PROMPT_PATH,
            input: { smoke: true, purpose: "runPrompt connection error smoke" },
          },
          {
            fetchModelTextImpl: async () => {
              throw new Error("fetch failed: socket hang up");
            },
          },
        );
        throw new Error("Expected connection error stub to fail, but it succeeded.");
      } catch (error) {
        assert.ok(error instanceof Error, "Expected an Error instance.");
        return error as Error & { code?: string };
      }
    },
  );
  assert.equal(providerConnectionError.code, "provider_connection_error");
  assert.match(providerConnectionError.message, /\[code=provider_connection_error\]/);
  assert.match(providerConnectionError.message, /\[provider=openai\]/);
  assert.match(providerConnectionError.message, /fetch failed: socket hang up/);

  console.log(
    JSON.stringify(
      {
        ok: true,
        checks: [
          "invalid_provider",
          "network_disabled",
          "missing_api_key",
          "provider_timeout",
          "provider_http_error",
          "provider_connection_error",
        ],
      },
      null,
      2,
    ),
  );
};

main().catch((error) => {
  console.error("[run-runprompt-hardening-smoke] Failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
