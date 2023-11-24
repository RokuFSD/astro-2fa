import type { APIRoute } from "astro";
import { z } from "astro/zod";
import prisma from "../../lib/prisma";

let verificationError: VerificationFlattenedErros | undefined;

export type VerificationFlattenedErros = z.inferFlattenedErrors<
  typeof formSchema
>;

const formSchema = z.object({
  otpCode: z.string().min(6, "OTP code must be 6 characters long"),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const data = await request.formData();
    const validated = formSchema.parse(Object.fromEntries(data.entries()));
    const { otpCode } = validated;

    // Check if verification is valid

    const verification = await prisma.verification.findFirst({
      where: {
        code: otpCode,
        type: "EMAIL",
      },
    });

    if (!verification) {
      const error = new z.ZodError([]);
      error.addIssue({
        code: "custom",
        message: "Invalid verification code",
        path: [],
      });
      throw error;
    }

    // Check if verification is expired

    if (verification.expiresAt < new Date(Date.now())) {
      const error = new z.ZodError([]);
      error.addIssue({
        code: "custom",
        message: "Verification code expired",
        path: [],
      });
      throw error;
    }

    // handle cookies

    const email = cookies.get("email_verification")?.value;

    cookies.delete("email_verification");

    cookies.set("continue_registration", email!, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      verificationError = error.flatten();
      return new Response(JSON.stringify(verificationError), { status: 400 });
    }
    if (error instanceof Error) {
      return new Response(error.message, { status: 400 });
    }
    return new Response("Something went wrong", { status: 400 });
  }
};
