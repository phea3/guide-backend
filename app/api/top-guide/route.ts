import { NextResponse } from "next/server";
import { userSchema } from "@/db/schema";
import { db } from "@/db/indext";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const guides = await db.query.userSchema.findMany({
      where: eq(userSchema.role, "Guide"),
      with: {
        availableDays: true,
      },
    });

    // 5 guides
    const topGuides = guides
      .map((guide) => ({
        ...guide,
        availableDaysCount: (guide.availableDays as unknown[]).length,
      }))
      .filter((guide) => guide.availableDaysCount > 0)
      .sort((a, b) => b.availableDaysCount - a.availableDaysCount)
      .slice(0, 5);

    return NextResponse.json({
      ok: true,
      data: topGuides,
    });
  } catch (error) {
    console.error("Failed to fetch top guides:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to fetch top guides",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
