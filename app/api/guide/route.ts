import { NextResponse } from "next/server";
import { userSchema } from "@/db/schema";
import { db } from "@/db/indext";

export async function GET() {
  try {
    console.log("GET /api/guide");

    const guides = await db.select().from(userSchema);

    console.log("Guides fetched:", guides.length);

    return NextResponse.json({
      ok: true,
      data: guides,
    });
  } catch (error) {
    console.error("❌ GET /api/guide FAILED");
    console.error(error);

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch guides",
      },
      {
        status: 500,
      },
    );
  }
}
