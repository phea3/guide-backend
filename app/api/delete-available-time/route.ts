import { NextResponse } from "next/server";
import { db } from "@/db/indext";
import { availableTimeSchema } from "@/db/schema/availability";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const existingAvailableTime = await db.query.availableTimeSchema.findFirst({
      where: eq(availableTimeSchema.id, body.id),
    });

    if (!existingAvailableTime) throw new Error("Available time not found");

    await db
      .delete(availableTimeSchema)
      .where(eq(availableTimeSchema.id, body.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
