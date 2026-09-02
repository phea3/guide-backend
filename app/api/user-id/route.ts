import { NextRequest, NextResponse } from "next/server";
import { userSchema } from "@/db/schema";
import { db } from "@/db/indext";
import { eq } from "drizzle-orm";

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

    const user = await db.query.userSchema.findFirst({
      where: eq(userSchema.clerkUserId, id),
    });

    return NextResponse.json({
      ok: true,
      data: user || null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to fetch user",
      },
      {
        status: 500,
      },
    );
  }
}
