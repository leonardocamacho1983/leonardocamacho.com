import { toPlainText } from "astro-portabletext";

import { getLocalizedDiagramSvg, type DiagramKey } from "@/diagrams";
import { getFlagshipFigureByDiagramKey, getFlagshipFigureByNumber } from "@/lib/flagship-figures";
import type { LocaleKey } from "@/lib/locales";

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object";

const isFullyEmphasizedBlock = (node: Record<string, unknown>): boolean => {
  const children = Array.isArray(node.children) ? node.children : [];
  const nonWhitespace = children.filter(
    (child) => isRecord(child) && typeof child.text === "string" && child.text.trim().length > 0,
  );
  return (
    nonWhitespace.length > 0 &&
    nonWhitespace.every(
      (child) => Array.isArray(child.marks) && child.marks.includes("em"),
    )
  );
};

const createLocalizedDiagramBlock = (
  locale: LocaleKey,
  diagramKeyOrFigure: { diagramKey?: DiagramKey; figureNumber?: "1" | "2" | "3" | "4" },
  key: string,
) => {
  const figure =
    diagramKeyOrFigure.figureNumber
      ? getFlagshipFigureByNumber(locale, diagramKeyOrFigure.figureNumber)
      : diagramKeyOrFigure.diagramKey
        ? getFlagshipFigureByDiagramKey(locale, diagramKeyOrFigure.diagramKey as never)
        : null;

  if (!figure) {
    return null;
  }

  return {
    _type: "diagramEmbed",
    _key: key,
    diagramKey: figure.diagramKey,
    label: figure.label,
    caption: figure.caption,
    accessibleText: figure.accessibleText,
    svgCode: getLocalizedDiagramSvg(figure.diagramKey, locale),
  };
};

export const transformFlagshipBody = (body: unknown[], locale: LocaleKey): unknown[] => {
  const result: unknown[] = [];
  const blocks = Array.isArray(body) ? body : [];

  for (let index = 0; index < blocks.length; index += 1) {
    const node = blocks[index];
    if (!isRecord(node)) continue;

    if (node._type === "diagramEmbed") {
      const localizedDiagram = createLocalizedDiagramBlock(
        locale,
        { diagramKey: typeof node.diagramKey === "string" ? (node.diagramKey as DiagramKey) : undefined },
        typeof node._key === "string" ? node._key : `diagram-${index}`,
      );
      result.push(localizedDiagram || node);
      continue;
    }

    if (node._type === "pullQuote" || node._type === "epigraph") {
      result.push(node);
      continue;
    }

    if (node._type === "block") {
      const text = toPlainText(node as never).trim();
      const style = typeof node.style === "string" ? node.style : "normal";
      const placeholderMatch = /^Figure\s+(\d+)\s+Placeholder$/i.exec(text);
      const bracketTokenMatch = /^\[\[FIGURE_(\d+)]]$/i.exec(text);
      const bareTokenMatch = /^FIGURE_(\d+)$/i.exec(text);
      const figureNumber = (placeholderMatch?.[1] || bracketTokenMatch?.[1] || bareTokenMatch?.[1]) as
        | "1"
        | "2"
        | "3"
        | "4"
        | undefined;

      if (figureNumber && (style === "h2" || style === "normal")) {
        const localizedDiagram = createLocalizedDiagramBlock(
          locale,
          { figureNumber },
          typeof node._key === "string" ? node._key : `diagram-${figureNumber}`,
        );
        if (localizedDiagram) {
          result.push(localizedDiagram);
          const next = blocks[index + 1];
          if (isRecord(next) && next._type === "block") {
            const nextText = toPlainText(next as never).trim();
            if (/^Reserve this slot for SVG/i.test(nextText)) {
              index += 1;
            }
          }
          continue;
        }
      }

      if (style === "normal" && isFullyEmphasizedBlock(node) && index === blocks.length - 1) {
        result.push({
          _type: "epigraph",
          _key: typeof node._key === "string" ? node._key : `epigraph-${index}`,
          text,
        });
        continue;
      }
    }

    result.push(node);
  }

  return result;
};
