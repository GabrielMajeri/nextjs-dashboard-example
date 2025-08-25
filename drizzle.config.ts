import dotenvx from "@dotenvx/dotenvx";
import { defineConfig } from "drizzle-kit";

dotenvx.config({ convention: "nextjs" });

export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
