export const prerender = false;
export const config = {
  runtime: "edge",
};

import type { APIRoute } from "astro";
import { createElement } from "react";
import { IdentityOg } from "@/og-components/identity";
import { renderOgPng } from "@/og-components/render";
import { clampText, resolveIdentityPage } from "@/og-components/theme";

export const GET: APIRoute = async ({ params, url }) => {
  const page = resolveIdentityPage(params.page);
  if (!page) {
    return new Response("Unknown OG identity page.", { status: 404 });
  }

  const descriptorOverride = url.searchParams.get("descriptor");
  return renderOgPng(
    createElement(IdentityOg, {
      page,
      descriptor: descriptorOverride ? clampText(descriptorOverride, 96) : undefined,
    }),
  );
};
