import { NextRequest, NextResponse } from "next/server";
import { userSchema } from "@/db/schema";
import { db } from "@/db/indext";
import { and, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { ok: false, message: "Missing id parameter" },
        { status: 400 },
      );
    }

    const guides = await db
      .select()
      .from(userSchema)
      .where(and(eq(userSchema.clerkUserId, id), eq(userSchema.role, "Guide")));

    const guide = guides[0];

    return NextResponse.json({
      ok: true,
      data: guide,
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
