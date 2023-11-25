import type { APIRoute } from "astro";
import { z } from "astro/zod";
import prisma from "../../../lib/prisma";
import { getSessionExpires } from "../../../utils/date-constants";
import { ErrorMessages } from "../../../lib/constants";
import { ZodCustomError } from "../../../utils/zod-error";
import { getPasswordManager } from "../../../lib/password-handler";

let loginErrors: LoginFlattenedErrors | undefined;

export type LoginFlattenedErrors = z.inferFlattenedErrors<typeof formSchema>;

const formSchema = z.object({
  username: z.string().min(5, ErrorMessages.INVALID_USERNAME),
  password: z
    .string()
    .min(8, ErrorMessages.INVALID_PASSWORD_LENGTH)
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
      ErrorMessages.INVALID_PASSWORD,
    ),
});

const passwordManager = getPasswordManager();

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
      throw ZodCustomError({ message: ErrorMessages.INVALID_LOGIN });
    }

    // Compare passwords with bcrypt

    const passwordMatches = await passwordManager.verifyPassword(
      password,
      user.password,
    );

    if (!passwordMatches) {
      throw ZodCustomError({ message: ErrorMessages.INVALID_LOGIN });
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
    return new Response(ErrorMessages.DEFAULT, { status: 500 });
  }
};
