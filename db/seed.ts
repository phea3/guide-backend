import "dotenv/config";

import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { guideSchema } from "./schema";

const main = async () => {
  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
  });

  const db = drizzle(connection);

  console.log("🌱 Seeding database...");

  await db.insert(guideSchema).values([
    {
      id: "1",
      guideName: "John Guide",
      nationality: "Cambodian",
      email: "john@guide.com",
      phoneNumber: "012345678",
      status: "ACTIVE",
    },
    {
      id: "2",
      guideName: "Dara Guide",
      nationality: "Thai",
      email: "dara@guide.com",
      phoneNumber: "098765432",
      status: "INACTIVE",
    },
  ]);

  console.log("✅ Seed completed");

  await connection.end();
};

main().catch((error) => {
  console.error("❌ Seed failed");
  console.error(error);
  process.exit(1);
});
