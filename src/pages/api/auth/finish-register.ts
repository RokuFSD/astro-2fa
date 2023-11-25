import { z } from "astro/zod";
import type { APIRoute } from "astro";
import prisma from "../../../lib/prisma";
import { CookiesKeys, ErrorMessages } from "../../../lib/constants";
import { getSessionCookieValue } from "../../../utils/cookies-handler";
import { ZodCustomError } from "../../../utils/zod-error";
import { getPasswordManager } from "../../../lib/password-handler";

let formErrors: FinishRegisterFlattenedErrors | undefined;

const formSchema = z
  .object({
    name: z.string(),
    username: z.string().min(5, ErrorMessages.INVALID_USERNAME),
    password: z
      .string()
      .min(8, ErrorMessages.INVALID_PASSWORD_LENGTH)
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
        ErrorMessages.INVALID_PASSWORD,
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: ErrorMessages.INVALID_CONFIRM_PASSWORD,
    path: ["confirmPassword"],
  });

const passwordMananger = getPasswordManager();

export type FinishRegisterFlattenedErrors = z.inferFlattenedErrors<
  typeof formSchema
>;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const data = await request.formData();
    const validated = formSchema.parse(Object.fromEntries(data.entries()));
    const { name, username, password } = validated;
    const email = getSessionCookieValue(
      CookiesKeys.CONTINUE_REGISTRATION,
      cookies,
    );

    if (!email) {
      throw ZodCustomError({ message: ErrorMessages.REGISTATION_EXPIRED });
    }

    // check if user exists
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (user) {
      throw ZodCustomError({ message: ErrorMessages.USER_ALREADY_EXISTS });
    }

    // hash password
    const hashedPassword = await passwordMananger.hashPassword(password);

    // create user
    await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
      },
    });

    // delete cookie
    cookies.delete(CookiesKeys.CONTINUE_REGISTRATION);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      formErrors = error.flatten();
      return new Response(JSON.stringify(formErrors), {
        status: 400,
      });
    }
    if (error instanceof Error) {
      return new Response(JSON.stringify(error.message), {
        status: 400,
      });
    }
    return new Response(ErrorMessages.DEFAULT, { status: 500 });
  }
};
