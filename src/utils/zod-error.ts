import { z } from "astro/zod";

interface ZodCustomErrorParams {
  message: string;
  path?: (string | number)[];
  code?: z.ZodCustomIssue["code"];
}

export function ZodCustomError({
  message,
  path = [],
  code = "custom",
}: ZodCustomErrorParams) {
  const error = new z.ZodError([]);
  error.addIssue({
    code,
    message,
    path,
  });

  return error;
}
