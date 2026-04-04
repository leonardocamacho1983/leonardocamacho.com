import React from "react";
import { L_PATH, L_VIEWBOX, topoCurve, WM_PATH, WM_VIEWBOX } from "@/og-components/paths";
import { BRAND } from "@/og-components/theme";

const creamWithAlpha = (alpha: number) => `rgba(246, 243, 236, ${alpha})`;

export const TopBar = () => (
  <div
    style={{
      width: "100%",
      height: 8,
      display: "flex",
      background: BRAND.ox,
    }}
  />
);

export const WordmarkSvg = ({ color, width }: { color: string; width: number }) => {
  const height = (width * 186.15) / 303.74;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={WM_VIEWBOX}
      width={width}
      height={height}
      style={{ display: "flex" }}
    >
      <path d={WM_PATH} fill={color} />
    </svg>
  );
};

export const MonogramSvg = ({
  size,
  background,
  foreground,
}: {
  size: number;
  background: string;
  foreground: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox={L_VIEWBOX}
    width={size}
    height={size}
    style={{ display: "flex" }}
  >
    <rect width="64" height="64" fill={background} />
    <path d={L_PATH} fill={foreground} />
  </svg>
);

export const CurveField = ({
  width,
  height,
  lineCount = 7,
}: {
  width: number;
  height: number;
  lineCount?: number;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox={`0 0 ${width} ${height}`}
    width={width}
    height={height}
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
    }}
  >
    {Array.from({ length: lineCount }).map((_, index) => {
      const x = ((index + 1) / (lineCount + 1)) * width;
      return (
        <line
          key={`line-${index}`}
          x1={x}
          y1="0"
          x2={x}
          y2={height}
          stroke={creamWithAlpha(0.05)}
          strokeWidth="1"
        />
      );
    })}
    {Array.from({ length: 10 }).map((_, index) => (
      <path
        key={`curve-${index}`}
        d={topoCurve(width * 0.5, height * 0.52, 200 + index * 38, 130 + index * 25, index + 1)}
        fill="none"
        stroke={creamWithAlpha(0.04 + index * 0.008)}
        strokeWidth="1"
      />
    ))}
  </svg>
);
