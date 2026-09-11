import { db } from "@/db/indext";
import { userSchema, UserType } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const user = await db.query.userSchema.findFirst({
      where: eq(userSchema.id, body.id),
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 401 });
    }

    type UpdateUser = {
      fullName?: string;
      username?: string;
      email?: string;
      phoneNumber?: string;
      description?: string;
      status?: UserType["status"];
      role?: UserType["role"];
    };

    const updateData: UpdateUser = {};

    if (body.fullName !== undefined) {
      updateData.fullName = body.fullName;
    }

    if (body.username !== undefined) {
      updateData.username = body.username;
    }

    if (body.email !== undefined) {
      updateData.email = body.email;
    }

    if (body.phoneNumber !== undefined) {
      updateData.phoneNumber = body.phoneNumber;
    }

    if (body.description !== undefined) {
      updateData.description = body.description;
    }

    if (body.status !== undefined) {
      updateData.status = body.status;
    }

    if (body.role !== undefined) {
      updateData.role = body.role;
    }

    await db
      .update(userSchema)
      .set(updateData)
      .where(eq(userSchema.id, user.id));

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
