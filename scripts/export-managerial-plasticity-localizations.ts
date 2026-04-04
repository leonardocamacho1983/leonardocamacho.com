import { readFileSync, writeFileSync } from "node:fs";

const source = readFileSync("scripts/create-managerial-plasticity-localizations.ts", "utf8");
const locales = ["en-gb", "pt-br", "pt-pt", "fr-fr"] as const;

type LocaleRecord = {
  locale: (typeof locales)[number];
  title: string;
  titleEmphasis: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  body: string;
};

const getField = (block: string, name: string): string => {
  const singleLine = block.match(new RegExp(`${name}: '([^']*)'`));
  if (singleLine) return singleLine[1];

  const multiLine = block.match(new RegExp(`${name}:\\s*\\n\\s*'([\\s\\S]*?)'`));
  return multiLine?.[1] ?? "";
};

const records: LocaleRecord[] = locales.map((locale) => {
  const blockPattern = new RegExp(`'${locale}': \\{([\\s\\S]*?)\\n  \\},`, "m");
  const match = source.match(blockPattern);

  if (!match) {
    throw new Error(`Missing locale block for ${locale}`);
  }

  const block = match[1];
  const bodyMatch = block.match(/bodyMarkdown: `([\s\S]*?)`/m);
  if (!bodyMatch) {
    throw new Error(`Missing bodyMarkdown for ${locale}`);
  }

  return {
    locale,
    title: getField(block, "title"),
    titleEmphasis: getField(block, "titleEmphasis"),
    excerpt: getField(block, "excerpt"),
    seoTitle: getField(block, "seoTitle"),
    seoDescription: getField(block, "seoDescription"),
    body: bodyMatch[1].trim(),
  };
});

const output: string[] = [
  "# On Managerial Plasticity Localizations",
  "",
  "Generated from the English source text for flagship review.",
  "",
];

for (const record of records) {
  output.push(`## ${record.locale}`);
  output.push("");
  output.push(`Title: ${record.title}${record.titleEmphasis ? ` ${record.titleEmphasis}` : ""}`);
  output.push("");
  output.push(`Excerpt: ${record.excerpt}`);
  output.push("");
  output.push(`SEO Title: ${record.seoTitle}`);
  output.push("");
  output.push(`SEO Description: ${record.seoDescription}`);
  output.push("");
  output.push(record.body);
  output.push("");
}

writeFileSync("knowledge/system/on-managerial-plasticity-localizations.md", output.join("\n"));
console.log("wrote knowledge/system/on-managerial-plasticity-localizations.md");
