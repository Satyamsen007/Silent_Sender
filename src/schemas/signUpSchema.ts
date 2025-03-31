import { z } from "zod";

export const userNameValidation = z
  .string()
  .min(2, "Username must be at least 2 characters long")
  .max(20, "Username must be no more than 20 characters long")
  .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores");

export const signUpSchemaValidation = z.object({
  username: userNameValidation,
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' })
})