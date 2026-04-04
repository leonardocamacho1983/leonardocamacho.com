import React from "react";
import { CurveField, TopBar } from "@/og-components/primitives";
import { ARTICLE_THEMES, type ArticleTypeKey, BRAND, OG_MAIN_HEIGHT } from "@/og-components/theme";

interface ArticleOgProps {
  type: ArticleTypeKey;
  section: string;
  titleLine1: string;
  titleLine2?: string;
  excerpt: string;
}

const mutedText = (textColor: string) =>
  textColor === BRAND.cream ? "rgba(246, 243, 236, 0.78)" : "rgba(26, 23, 16, 0.72)";

export const ArticleOg = ({
  type,
  section,
  titleLine1,
  titleLine2,
  excerpt,
}: ArticleOgProps) => {
  const theme = ARTICLE_THEMES[type];
  const totalTitleLength = `${titleLine1} ${titleLine2 || ""}`.trim().length;
  const titleSize = totalTitleLength > 44 ? 72 : totalTitleLength > 28 ? 78 : 84;
  const secondLineSize = Math.max(titleSize - 4, 64);

  return (
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        flexDirection: "column",
        background: theme.background,
      }}
    >
      <TopBar />

      <div
        style={{
          width: "100%",
          height: OG_MAIN_HEIGHT,
          display: "flex",
        }}
      >
        <div
          style={{
            width: 848,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "46px 56px 50px 56px",
            background: theme.background,
            color: theme.text,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
              maxWidth: 700,
            }}
          >
            <span
              style={{
                display: "flex",
                color: theme.accent,
                fontFamily: "DM Sans",
                fontSize: 13,
                fontWeight: 300,
                letterSpacing: "0.26em",
                textTransform: "uppercase",
              }}
            >
              {section}
            </span>

            <span
              style={{
                width: 118,
                height: 2,
                display: "flex",
                background: theme.accent,
              }}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                marginTop: 18,
                maxWidth: 680,
              }}
            >
              <span
                style={{
                  display: "flex",
                  color: theme.text,
                  fontFamily: "Playfair Display",
                  fontSize: titleSize,
                  fontWeight: 700,
                  lineHeight: 0.92,
                  letterSpacing: "-0.05em",
                }}
              >
                {titleLine1}
              </span>
              {titleLine2 ? (
                <span
                  style={{
                    display: "flex",
                    color: theme.text,
                    fontFamily: "Playfair Display",
                    fontSize: secondLineSize,
                    fontWeight: 700,
                    lineHeight: 0.94,
                    letterSpacing: "-0.05em",
                  }}
                >
                  {titleLine2}
                </span>
              ) : null}
            </div>

            <span
              style={{
                display: "flex",
                maxWidth: 520,
                marginTop: 14,
                color: mutedText(theme.text),
                fontFamily: "DM Sans",
                fontSize: 24,
                fontWeight: 300,
                lineHeight: 1.38,
              }}
            >
              {excerpt}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 18,
            }}
          >
            <span
              style={{
                width: 96,
                height: 1,
                display: "flex",
                background: theme.accent,
              }}
            />
            <span
              style={{
                display: "flex",
                color: theme.text,
                fontFamily: "DM Sans",
                fontSize: 26,
                fontWeight: 300,
                letterSpacing: "0.02em",
              }}
            >
              leonardocamacho.com
            </span>
          </div>
        </div>

        <div
          style={{
            width: 1,
            height: "100%",
            display: "flex",
            background: BRAND.ox,
          }}
        />

        <div
          style={{
            width: 351,
            height: "100%",
            display: "flex",
            position: "relative",
            overflow: "hidden",
            background: theme.railBackground,
          }}
        >
          <CurveField width={351} height={OG_MAIN_HEIGHT} lineCount={4} />
        </div>
      </div>
    </div>
  );
};
