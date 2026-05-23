import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  CIN7_API_BASE_URL: z.string().url().default('https://inventory.dearsystems.com/ExternalApi/v2'),
  CIN7_ACCOUNT_ID: z.string().optional().default(''),
  CIN7_APPLICATION_KEY: z.string().optional().default(''),
  LOG_LEVEL: z.string().default('info')
});

export const env = envSchema.parse(process.env);
