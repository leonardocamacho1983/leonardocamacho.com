import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ cookies, redirect, url }) => {
  const secret = url.searchParams.get("secret");
  const redirectTo = url.searchParams.get("redirect") || "/en-us";

  if (!secret || secret !== import.meta.env.SANITY_PREVIEW_SECRET) {
    return new Response("Invalid preview token", { status: 401 });
  }

  cookies.set("sanity-preview", "true", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: import.meta.env.PROD,
    maxAge: 60 * 60,
  });

  return redirect(redirectTo);
};
