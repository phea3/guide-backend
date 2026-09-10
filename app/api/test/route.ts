import { db } from "@/db/indext";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);

    return NextResponse.json({
      success: true,
      message: "Database connection works",
    });
  } catch (error) {
    console.error("DB TEST ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
