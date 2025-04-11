import { z } from "zod";

export const acceptMessagesSchemaValidation = z.object({
  acceptMessages: z.boolean(),
})