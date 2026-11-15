import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1).default('postgresql://postgres:postgres@localhost:5432/student_management'),
  REDIS_URL: z.string().optional().transform((v) => v || undefined),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  LOG_LEVEL: z.string().default('info'),
  ADMIN_EMAIL: z.string().default('davisayomide999@gmail.com'),
  ADMIN_PASSWORD: z.string().default('AT/INT/2046832'),
  JWT_SECRET: z.string().min(16).optional(),
});

const parsed = schema.parse(process.env);
if (!parsed.JWT_SECRET && parsed.NODE_ENV === 'production') throw new Error('JWT_SECRET must be set in production');

export const env = { ...parsed, JWT_SECRET: parsed.JWT_SECRET ?? 'development-only-secret-change-me' };
