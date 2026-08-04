import { NextResponse } from "next/server";
import { db } from "@/db/indext";
import { v4 as uuidv4 } from "uuid";
import {
  availableDaySchema,
  availableTimeSchema,
  AvailableTimeType,
} from "@/db/schema/availability";
import { eq } from "drizzle-orm";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const existingAvailableDay = await db.query.availableDaySchema.findFirst({
      where: eq(availableDaySchema.id, body.id),
    });

    if (!existingAvailableDay) throw new Error("Available day not found");

    await db
      .update(availableDaySchema)
      .set({
        startDate: dayjs(body.startDate).format("YYYY-MM-DD"), // 👈 DATE
        endDate: dayjs(body.endDate).format("YYYY-MM-DD"), // 👈 DATE
        status: body.status,
        remark: body.remark,
      })
      .where(eq(availableDaySchema.id, body.id));

    if (body?.availableTimes?.length > 0) {
      await Promise.all(
        body.availableTimes.map(async (item: AvailableTimeType) => {
          const startTime = dayjs(
            `${body.startDate} ${item.startTime}`,
            "YYYY-MM-DD HH:mm",
          );

          const endTime = dayjs(
            `${body.startDate} ${item.endTime}`,
            "YYYY-MM-DD HH:mm",
          );
          if (item.id) {
            await db
              .update(availableTimeSchema)
              .set({
                startTime: startTime.format("YYYY-MM-DD HH:mm:ss"),
                endTime: endTime.format("YYYY-MM-DD HH:mm:ss"),
                status: item.status,
                remark: item.remark,
              })
              .where(eq(availableTimeSchema.id, item.id));
          } else {
            await db.insert(availableTimeSchema).values({
              id: uuidv4(),
              availableDayId: body.id,
              startTime: startTime.format("YYYY-MM-DD HH:mm:ss"),
              endTime: endTime.format("YYYY-MM-DD HH:mm:ss"),
              status: item.status,
              remark: item.remark,
            });
          }
        }),
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
