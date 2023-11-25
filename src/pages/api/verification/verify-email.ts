import type { APIRoute } from "astro";
import { z } from "astro/zod";
import prisma from "../../../lib/prisma";
import { ZodCustomError } from "../../../utils/zod-error";
import { getSessionCookieValue } from "../../../utils/cookies-handler";
import { CookiesKeys, ErrorMessages } from "../../../lib/constants";

let verificationError: VerificationFlattenedErros | undefined;

export type VerificationFlattenedErros = z.inferFlattenedErrors<
  typeof formSchema
>;

const formSchema = z.object({
  otpCode: z.string().min(6, ErrorMessages.INVALID_OTP),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const data = await request.formData();
    const validated = formSchema.parse(Object.fromEntries(data.entries()));
    const email = getSessionCookieValue(
      CookiesKeys.EMAIL_VERIFICATION,
      cookies,
    );
    const { otpCode } = validated;

    const verification = await prisma.verification.findFirst({
      where: {
        code: otpCode,
        type: "EMAIL",
      },
    });

    // Check if verification exists
    if (!verification) {
      throw ZodCustomError({
        message: ErrorMessages.VERIFICATION_NOT_FOUND,
      });
    }

    // Check if verification is expired
    if (verification.expiresAt < new Date(Date.now())) {
      throw ZodCustomError({
        message: ErrorMessages.VERIFICATION_EXPIRED,
      });
    }

    // handle cookies
    cookies.set(CookiesKeys.CONTINUE_REGISTRATION, email!, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
    });
    cookies.delete(CookiesKeys.EMAIL_VERIFICATION);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      verificationError = error.flatten();
      return new Response(JSON.stringify(verificationError), { status: 400 });
    }
    if (error instanceof Error) {
      return new Response(error.message, { status: 400 });
    }
    return new Response(ErrorMessages.DEFAULT, { status: 400 });
  }
};
