import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./db/migrations",
  schema: "./db/schema",
  dialect: "mysql",
  dbCredentials: {
    port: 3310,
    host: process.env.DB_HOST || "",
    user: process.env.DB_USER || "",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "",
  },
  verbose: true,
  strict: true,
});
