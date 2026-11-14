import { existsSync } from 'node:fs';
import { z } from 'zod';

// Load `.env` (Node's built-in loader — no dotenv dependency). Real environment
// variables (e.g. on Render) always win over values in the file.
if (existsSync('.env')) process.loadEnvFile('.env');

// Same dev-only fallback secret as the Spring backend, so local tokens are interchangeable.
const DEV_JWT_SECRET =
  'afafasfafafasfasfasfafacasdasfasxASFACASDFACASDFASFASFDAFASFASDAADSCSDFADCVSGCFVADXCcadwavfsfarvf';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(8080),
  // SPRING_DATA_MONGODB_URI is accepted so the Spring Boot `.env` can be reused unchanged.
  MONGODB_URI: z.string().min(1).optional(),
  SPRING_DATA_MONGODB_URI: z.string().min(1).optional(),
  JWT_SECRET: z.string().min(32).optional(),
  MAIL_HOST: z.string().default('smtp.gmail.com'),
  MAIL_PORT: z.coerce.number().int().positive().default(587),
  MAIL_USERNAME: z.string().default(''),
  MAIL_PASSWORD: z.string().default(''),
  CORS_ORIGINS: z.string().default('*'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).optional(),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment variables:', z.prettifyError(parsed.error));
  process.exit(1);
}
const raw = parsed.data;

if (raw.NODE_ENV === 'production' && !raw.JWT_SECRET) {
  console.error('JWT_SECRET must be set in production.');
  process.exit(1);
}

export const env = {
  nodeEnv: raw.NODE_ENV,
  isProduction: raw.NODE_ENV === 'production',
  isTest: raw.NODE_ENV === 'test',
  port: raw.PORT,
  mongoUri: raw.MONGODB_URI ?? raw.SPRING_DATA_MONGODB_URI ?? 'mongodb://127.0.0.1:27017/jobportal',
  jwtSecret: raw.JWT_SECRET ?? DEV_JWT_SECRET,
  mail: {
    host: raw.MAIL_HOST,
    port: raw.MAIL_PORT,
    user: raw.MAIL_USERNAME,
    password: raw.MAIL_PASSWORD,
    enabled: Boolean(raw.MAIL_USERNAME && raw.MAIL_PASSWORD),
  },
  corsOrigins: raw.CORS_ORIGINS === '*' ? '*' : raw.CORS_ORIGINS.split(',').map((o) => o.trim()),
  logLevel: raw.LOG_LEVEL ?? (raw.NODE_ENV === 'test' ? 'silent' : 'info'),
} as const;
