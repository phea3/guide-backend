import { NextResponse } from "next/server";
import { db } from "@/db/indext";
import {
  availableDaySchema,
  availableTimeSchema,
  AvailableTimeType,
} from "@/db/schema/availability";
import { and, eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const existingAvailableDay = await db.query.availableDaySchema.findFirst({
      where: eq(availableDaySchema.id, body.id),
    });

    if (!existingAvailableDay) throw new Error("Available day not found");

    await db
      .delete(availableDaySchema)
      .where(eq(availableDaySchema.id, body.id));

    if (body?.availableTimes?.length > 0) {
      await Promise.all(
        body.availableTimes.map(async (item: AvailableTimeType) => {
          await db
            .delete(availableTimeSchema)
            .where(
              and(
                eq(availableTimeSchema.id, item.id),
                eq(availableTimeSchema.availableDayId, body.id),
              ),
            );
        }),
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
