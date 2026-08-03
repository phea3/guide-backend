import { NextRequest, NextResponse } from "next/server";
import { availableDaySchema } from "@/db/schema";
import { db } from "@/db/indext";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { ok: false, message: "Missing user id parameter" },
        { status: 400 },
      );
    }

    const availableDays = await db.query.availableDaySchema.findMany({
      where: eq(availableDaySchema.userId, userId),
      with: {
        availableTimes: true, // works once you add relation
      },
    });

    return NextResponse.json({
      ok: true,
      data: availableDays,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, message: "Failed to fetch available days" },
      { status: 500 },
    );
  }
}
