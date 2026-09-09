import { NextResponse } from "next/server";
import { userSchema } from "@/db/schema";
import { db } from "@/db/indext";

export async function GET() {
  console.log("🔥 /api/guide called");

  try {
    console.log("🔥 Testing database query...");

    const guides = await db.select().from(userSchema);

    console.log("✅ Database query successful");
    console.log("✅ Rows:", guides.length);

    return NextResponse.json({
      ok: true,
      data: guides,
    });
  } catch (error) {
    console.error("🔥🔥 DATABASE ERROR 🔥🔥");
    console.error(error);

    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
