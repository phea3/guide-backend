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

    const guide = await db.query.userSchema.findFirst({
      where: and(eq(userSchema.id, id)),
      with: {
        friends: true,
      },
    });

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
