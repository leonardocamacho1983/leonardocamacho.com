import React from "react";
import { CurveField, TopBar } from "@/og-components/primitives";
import {
  BRAND,
  IDENTITY_PAGE_CONTENT,
  type IdentityPageKey,
  OG_MAIN_HEIGHT,
} from "@/og-components/theme";

interface IdentityOgProps {
  page: IdentityPageKey;
  descriptor?: string;
}

export const IdentityOg = ({ page, descriptor }: IdentityOgProps) => {
  const content = IDENTITY_PAGE_CONTENT[page];
  const resolvedSubhead = descriptor || content.subhead;

  return (
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        flexDirection: "column",
        background: BRAND.navy,
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
            width: 842,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "48px 58px 54px 56px",
            background: BRAND.navy,
            color: BRAND.cream,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 22,
              maxWidth: 620,
            }}
          >
            {content.label ? (
              <span
                style={{
                  display: "flex",
                  color: "rgba(246, 243, 236, 0.74)",
                  fontFamily: "DM Sans",
                  fontSize: 13,
                  fontWeight: 300,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                }}
              >
                {content.label}
              </span>
            ) : null}

            <span
              style={{
                width: 118,
                height: 2,
                display: "flex",
                background: BRAND.ox,
              }}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                marginTop: 16,
              }}
            >
              {content.headlineLines.map((line) => (
                <span
                  key={line}
                  style={{
                    display: "flex",
                    color: BRAND.cream,
                    fontFamily: "Playfair Display",
                    fontSize: 86,
                    fontWeight: 700,
                    lineHeight: 0.9,
                    letterSpacing: "-0.05em",
                  }}
                >
                  {line}
                </span>
              ))}
            </div>

            <span
              style={{
                display: "flex",
                maxWidth: 500,
                marginTop: 18,
                color: "rgba(246, 243, 236, 0.84)",
                fontFamily: "DM Sans",
                fontSize: 24,
                fontWeight: 300,
                lineHeight: 1.38,
              }}
            >
              {resolvedSubhead}
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
                background: "rgba(246, 243, 236, 0.44)",
              }}
            />
            <span
              style={{
                display: "flex",
                color: BRAND.cream,
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
            width: 357,
            height: "100%",
            display: "flex",
            position: "relative",
            overflow: "hidden",
            background: BRAND.navyPanel,
          }}
        >
          <CurveField width={357} height={OG_MAIN_HEIGHT} lineCount={4} />
        </div>
      </div>
    </div>
  );
};
