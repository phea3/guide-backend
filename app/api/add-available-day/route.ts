import { NextResponse } from "next/server";
import { db } from "@/db/indext";
import { v4 as uuidv4 } from "uuid";
import {
  availableDaySchema,
  availableTimeSchema,
  AvailableTimeType,
  NewAvailableTimeType,
} from "@/db/schema/availability";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newAvailableDayId = uuidv4();

    await db.insert(availableDaySchema).values({
      id: newAvailableDayId,
      userId: body.userId,
      startDate: body.startDate,
      endDate: body.endDate,
      status: body.status,
      remark: body.remark,
    });

    if (body?.availableTimes?.length > 0) {
      const newAvailableTimes: NewAvailableTimeType[] = body.availableTimes.map(
        (item: AvailableTimeType) => ({
          id: uuidv4(),
          availableDayId: newAvailableDayId,
          startTime: item.startTime,
          endTime: item.endTime,
          status: item.status,
          remark: item.remark,
        }),
      );

      await db.insert(availableTimeSchema).values(newAvailableTimes);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
