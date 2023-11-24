import type { APIRoute } from "astro";
import { z } from "astro/zod";
import prisma from "../../lib/prisma";
import totp from "totp-generator";
import { generateBase32Secret } from "../../utils/base32";
import { emailExpiration } from "../../utils/date-constants";

let registerErrors: RegisterFlattenedErrors | undefined;

export type RegisterFlattenedErrors = z.inferFlattenedErrors<typeof formSchema>;

const formSchema = z.object({
  email: z.string().email("Wrong email format"),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const data = await request.formData();
    const validated = formSchema.parse(Object.fromEntries(data.entries()));
    const { email } = validated;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      const error = new z.ZodError([]);
      error.addIssue({
        code: "custom",
        message: "User already exists. Please login.",
        path: [],
      });
      throw error;
    }
    // TODO: Initiate registration process

    // Generate TOTP
    const secret = generateBase32Secret();
    const TOTP = totp(secret);

    // Send email with TOPT

    console.log(TOTP);

    // Create a Verification record with the TOTP
    const expiration = emailExpiration();

    await prisma.verification.create({
      data: {
        code: TOTP,
        type: "EMAIL",
        expiresAt: expiration,
      },
    });

    // Set session cookie
    cookies.set("email_verification", email, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      expires: expiration,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      registerErrors = error.flatten();
      return new Response(JSON.stringify(registerErrors), { status: 400 });
    }
    if (error instanceof Error) {
      return new Response(error.message, { status: 400 });
    }
    return new Response("Something went wrong", { status: 400 });
  }
};
