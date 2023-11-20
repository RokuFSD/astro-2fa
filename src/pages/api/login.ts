import type { APIRoute } from "astro";
import { z } from "astro/zod";

let loginErrors: FlattenedErrors | undefined;

export type FlattenedErrors = z.inferFlattenedErrors<typeof formSchema>;

const formSchema = z.object({
  username: z.string().min(5, "Username must be at least 5 characters long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, "Password is invalid"),
});

export const POST: APIRoute = async ({ request, redirect, cookies }) => {
  const data = await request.formData();
  try {
    const validated = formSchema.parse(Object.fromEntries(data.entries()));
    const { username, password } = validated;

    cookies.set("session", username, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
    });

    return new Response(JSON.stringify({ username, password }));
  } catch (error) {
    if (error instanceof z.ZodError) {
      loginErrors = error.flatten();
      return new Response(JSON.stringify(loginErrors), { status: 400 });
    }
    if (error instanceof Error) {
      return new Response(error.message, { status: 400 });
    }
    return new Response("Something went wrong", { status: 400 });
  }
};
