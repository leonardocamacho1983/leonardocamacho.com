const BLOCK_STYLE_TO_MARKDOWN: Record<string, string> = {
  h1: "# ",
  h2: "## ",
  h3: "### ",
  h4: "#### ",
  normal: "",
  blockquote: "> ",
};

export const extractMarkdownFromPortableText = (body: unknown): string => {
  if (!Array.isArray(body)) return "";
  return body
    .map((block) => {
      if (!block || typeof block !== "object") return "";
      const b = block as Record<string, unknown>;
      if (b._type === "block") {
        const style = typeof b.style === "string" ? b.style : "normal";
        const prefix = BLOCK_STYLE_TO_MARKDOWN[style] ?? "";
        const children = Array.isArray(b.children) ? b.children : [];
        const text = children
          .map((c) =>
            c && typeof c === "object" && typeof (c as Record<string, unknown>).text === "string"
              ? (c as Record<string, unknown>).text as string
              : ""
          )
          .join("");
        return text ? prefix + text : "";
      }
      return "";
    })
    .filter(Boolean)
    .join("\n\n");
};
