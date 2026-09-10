import { NextResponse } from "next/server";
import { userSchema } from "@/db/schema";
import { db } from "@/db/indext";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const guides = await db
      .select()
      .from(userSchema)
      .where(eq(userSchema.role, "Guide"));

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
