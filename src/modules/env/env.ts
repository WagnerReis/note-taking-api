import { z } from 'zod';

export const envSchema = z.object({
  MONGODB_URI: z.string(),
  PORT: z.coerce.number().optional().default(3000),
});

export type Env = z.infer<typeof envSchema>;
