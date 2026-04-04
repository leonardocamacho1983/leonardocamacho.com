import type { ReactNode } from "react";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { getOgFonts } from "@/og-components/fonts";
import { OG_HEIGHT, OG_WIDTH } from "@/og-components/theme";

export const renderOgPng = async (node: ReactNode) => {
  const svg = await satori(node, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: await getOgFonts(),
  });

  const png = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: OG_WIDTH,
    },
  }).render().asPng();
  const body = Uint8Array.from(png).buffer;

  return new Response(body, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
};
