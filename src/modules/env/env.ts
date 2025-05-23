import { z } from 'zod';

export const envSchema = z.object({
  MONGODB_URI: z.string(),
  PORT: z.coerce.number().optional().default(3000),
  JWT_SECRET: z.string(),
  JWT_EXPIRATION: z.coerce
    .number()
    .optional()
    .default(60 * 60 * 24),
});

export type Env = z.infer<typeof envSchema>;
