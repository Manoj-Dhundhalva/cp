import dotenv from "dotenv";
import { z } from "zod";

export const APP_STAGE = {
  STAGING: "staging",
  PRODUCTION: "production",
  TEST: "test",
} as const;

export const NODE_ENV = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  TEST: "test",
} as const;

process.env.APP_STAGE = process.env.APP_STAGE || APP_STAGE.STAGING;

const isProduction = process.env.APP_STAGE === APP_STAGE.PRODUCTION;
const isDevelopment = process.env.APP_STAGE === APP_STAGE.STAGING;
const isTest = process.env.APP_STAGE === APP_STAGE.TEST;

// Load environment-specific .env files
if (isDevelopment) {
  dotenv.config({ path: ".env.staging" });
} else if (isTest) {
  dotenv.config({ path: ".env.test" });
}

const envSchema = z.object({
  NODE_ENV: z
    .enum([NODE_ENV.DEVELOPMENT, NODE_ENV.PRODUCTION, NODE_ENV.TEST])
    .default(NODE_ENV.DEVELOPMENT),

  APP_STAGE: z
    .enum([APP_STAGE.STAGING, APP_STAGE.PRODUCTION, APP_STAGE.TEST])
    .default(APP_STAGE.STAGING),

  PORT: z.coerce.number().positive().default(3000),
  HOST: z.string().default("localhost"),

  DATABASE_URL: z
    .url()
    .refine((url) => url.startsWith("postgresql://") || url.startsWith("postgres://"), {
      message: "DATABASE_URL must be a PostgreSQL connection string",
    }),

  DATABASE_POOL_MIN: z.coerce.number().min(0).default(2),
  DATABASE_POOL_MAX: z.coerce.number().positive().default(10),

  CORS_ORIGIN: z
    .union([z.string(), z.array(z.string())])
    .transform((val) => {
      if (typeof val === "string") {
        return val
          .split(",")
          .map((origin) => origin.trim())
          .filter(Boolean);
      }
      return val;
    })
    .default([]),

  LOG_LEVEL: z
    .enum(["error", "warn", "info", "debug", "trace"])
    .default(isProduction ? "info" : "debug"),

  RATE_LIMIT_WINDOW: z.coerce
    .number()
    .positive()
    .default(isProduction ? 900000 : 60000),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("❌ Invalid environment variables\n");

  const tree = z.treeifyError(result.error);
  console.error(JSON.stringify(tree, null, 2));

  console.error("\nValidation Errors:");

  result.error.issues.forEach((issue) => {
    const path = issue.path.length > 0 ? issue.path.join(".") : "root";
    console.error(`  • ${path}: ${issue.message}`);
  });

  process.exit(1);
}

export const env = result.data;

export type Env = typeof env;

export const isProd = () => env.NODE_ENV === NODE_ENV.PRODUCTION;
export const isDev = () => env.NODE_ENV === NODE_ENV.DEVELOPMENT;
export const isTestEnv = () => env.NODE_ENV === NODE_ENV.TEST;

export default env;
