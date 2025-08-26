import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";

import { Pool } from "pg";
import { drizzle as drizzleNodePostgres } from "drizzle-orm/node-postgres";

import * as schema from "./schema";
import { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";

let db: PgDatabase<PgQueryResultHKT, typeof schema>;
if (process.env.DATABASE_ADAPTER === "neon") {
  // On Vercel, use the Neon serverless database service
  const sql = neon(process.env.DATABASE_URL!);
  db = drizzleNeon({ client: sql, schema });
} else {
  // By default, use the standard PostgreSQL connector
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
  });
  db = drizzleNodePostgres({ client: pool, schema });
}

export { db };
