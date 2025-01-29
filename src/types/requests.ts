import { z } from "zod";

export const requestSchema = z.object({
  content: z.string(),
});

export type RequestType = z.infer<typeof requestSchema>;
