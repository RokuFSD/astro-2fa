import { z } from "astro/zod";
import type { APIRoute } from "astro";
import prisma from "../../lib/prisma";
import bcrypt from "bcryptjs";

let formErrors: FinishRegisterFlattenedErrors | undefined;

const formSchema = z
  .object({
    name: z.string(),
    username: z.string().min(5, "Username must be at least 5 characters long"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, "Password is invalid"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type FinishRegisterFlattenedErrors = z.inferFlattenedErrors<
  typeof formSchema
>;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const data = await request.formData();
    const validated = formSchema.parse(Object.fromEntries(data.entries()));
    const { name, username, password } = validated;
    const email = cookies.get("continue_registration")?.value;

    if (!email) {
      const error = new z.ZodError([]);
      error.addIssue({
        code: "custom",
        message: "Registration process expired.",
        path: [],
      });
      throw error;
    }

    // check if user exists
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (user) {
      const error = new z.ZodError([]);
      error.addIssue({
        code: "custom",
        message: "User already exists, please login",
        path: [],
      });
      throw error;
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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
    cookies.delete("continue_registration");

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
    return new Response("Something went wrong", { status: 500 });
  }
};
