import type { AstroCookies } from "astro";

export function getSessionCookieValue(key: string, cookies: AstroCookies) {
  return cookies.get(key)?.value;
}
