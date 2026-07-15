import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

const envSchema = z.object({
  PRIMARY_PORT: z.coerce.number().int().min(1).max(65_535).default(3001),
  API_PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  POSTGRES_USER: z.string().default("postgres"),
  POSTGRES_PASSWORD: z.string().default("postgres"),
  POSTGRES_DB: z.string().default("OpenRouter"),
  JWT_SECRET: z.string().default("Anurag@79201"),
  DATABASE_URL: z.string().url(),
  GOOGLE_CLOUD_PROJECT: z.string().default("open-router-502315"),
  GOOGLE_CLOUD_LOCATION: z.string().default("global"),
  GOOGLE_GENAI_USE_VERTEXAI: z
    .string()
    .transform((val) => val.toLowerCase() === "true")
    .default(true),
});

export type Env = z.infer<typeof envSchema>;
let cashedEnv: Env | null = null;

const parseEnv = () => {
  if (cashedEnv) return cashedEnv;

  const res = envSchema.safeParse(process.env);
  if (res.success) {
    cashedEnv = res.data;
    return cashedEnv;
  }
  console.error(
    "Invalid environment variables:",
    JSON.stringify(res.error.format(), null, 2),
  );
  throw new Error("Invalid environment variables");
};

export const env: Env = parseEnv();
export default env;
