import { NextResponse } from "next/server";
import { availableDaySchema, availableTimeSchema } from "@/db/schema";
import { db } from "@/db/indext";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const availables = await db.query.availableDaySchema.findMany({
      orderBy: asc(availableDaySchema.createdAt),
      with: {
        availableTimes: {
          orderBy: asc(availableTimeSchema.createdAt),
        },
      },
    });

    return NextResponse.json({
      ok: true,
      data: availables,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to fetch availables",
      },
      {
        status: 500,
      },
    );
  }
}
