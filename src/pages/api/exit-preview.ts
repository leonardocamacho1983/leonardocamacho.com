import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ cookies, redirect, url }) => {
  const redirectTo = url.searchParams.get("redirect") || "/en-us";

  cookies.delete("sanity-preview", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: import.meta.env.PROD,
  });

  return redirect(redirectTo);
};
