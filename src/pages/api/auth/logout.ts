import type { APIRoute } from "astro";
import prisma from "../../../lib/prisma";
import { CookiesKeys } from "../../../lib/constants";
import { getSessionCookieValue } from "../../../utils/cookies-handler";

export const POST: APIRoute = async ({ cookies, redirect }) => {
  const sessionId = getSessionCookieValue(CookiesKeys.SESSION, cookies);

  // Remove session cookie
  cookies.delete("session", {
    path: "/",
  });

  // Remove session from the database
  try {
    await prisma.session.delete({
      where: {
        id: sessionId,
      },
    });

    return redirect("/login");
  } catch (error) {
    return new Response(JSON.stringify(error), {
      status: 500,
    });
  }
};
