import { NextRequest, NextResponse } from "next/server";
import { guideSchema } from "@/db/schema";
import { db } from "@/db/indext";

export async function GET() {
  try {
    const guides = await db.select().from(guideSchema);

    return NextResponse.json({
      ok: true,
      data: guides,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to fetch guides",
      },
      {
        status: 500,
      },
    );
  }
}
