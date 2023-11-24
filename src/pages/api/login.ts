import type { APIRoute } from "astro";
import { z } from "astro/zod";
import prisma from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { getSessionExpires } from "../../utils/auth";

let loginErrors: LoginFlattenedErrors | undefined;

export type LoginFlattenedErrors = z.inferFlattenedErrors<typeof formSchema>;

const formSchema = z.object({
  username: z.string().min(5, "Username must be at least 5 characters long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, "Password is invalid"),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const data = await request.formData();
    const validated = formSchema.parse(Object.fromEntries(data.entries()));
    const { username, password } = validated;

    // Check if user exists

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: username }, { username }],
      },
    });

    if (!user) {
      const error = new z.ZodError([]);
      error.addIssue({
        code: "custom",
        message: "Invalid username or password",
        path: [],
      });
      throw error;
    }

    // Compare passwords with bcrypt

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      const error = new z.ZodError([]);
      error.addIssue({
        code: "custom",
        message: "Invalid username or password",
        path: [],
      });
      throw error;
    }

    const sessionExpires = getSessionExpires();

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        expiresAt: sessionExpires,
      },
      select: {
        id: true,
      },
    });

    // Set session cookie
    cookies.set("session", session.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      expires: sessionExpires,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      loginErrors = error.flatten();
      return new Response(JSON.stringify(loginErrors), { status: 400 });
    }
    if (error instanceof Error) {
      return new Response(error.message, { status: 400 });
    }
    return new Response("Something went wrong", { status: 500 });
  }
};
