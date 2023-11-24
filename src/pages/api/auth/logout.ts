import type { APIRoute } from "astro";
import prisma from "../../../lib/prisma";

export const POST: APIRoute = async ({ cookies, redirect }) => {
  const sessionId = cookies.get("session")?.value;

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
