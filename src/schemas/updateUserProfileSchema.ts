import { z } from "zod";

export const userNameValidation = z
  .string()
  .min(2, "Username must be at least 2 characters long")
  .max(20, "Username must be no more than 20 characters long")
  .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores")
  .optional()
  .or(z.literal(""));

export const updateUserProfileSchemaValidation = z
  .object({
    username: userNameValidation,
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .optional()
      .or(z.literal("")),
    confirmPassword: z.string(),
  })
  .refine(
    (data) => !data.newPassword || data.newPassword === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );
