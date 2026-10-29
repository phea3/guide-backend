import { db } from "@/db/indext";
import { userSchema, UserType } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate ID
    if (!body.id || typeof body.id !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required",
        },
        { status: 400 },
      );
    }

    // Find user
    const user = await db.query.userSchema.findFirst({
      where: eq(userSchema.id, body.id),
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    type UpdateUser = {
      fullName?: string;
      username?: string;
      email?: string;
      phoneNumber?: string;
      telegramLink?: string;
      description?: string | null;
      status?: UserType["status"];
      role?: UserType["role"];
    };

    const updateData: UpdateUser = {};

    // Only update fields provided in the request
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

    if (body.telegramLink !== undefined) {
      updateData.telegramLink = body.telegramLink;
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

    // Nothing to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No fields provided to update",
        },
        { status: 400 },
      );
    }

    // Update user
    await db
      .update(userSchema)
      .set({
        ...updateData,
        isCompletedProfile: true,
      })
      .where(eq(userSchema.id, user.id));

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("POST /api/profile-detail error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        // Remove this field in production if it could expose sensitive details.
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
