import { NextResponse } from "next/server";
import { createClerkClient, verifyToken } from "@clerk/backend";
import { eq } from "drizzle-orm";

import { userSchema } from "@/db/schema";
import { db } from "@/db/indext";

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("Authorization");
    const secretKey = process.env.CLERK_SECRET_KEY;

    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    if (!secretKey) {
      console.error("CLERK_SECRET_KEY is missing");

      return NextResponse.json(
        {
          success: false,
          message: "Server authentication configuration error",
        },
        { status: 500 },
      );
    }

    const { sub: clerkUserId } = await verifyToken(auth.slice(7), {
      secretKey,
      clockSkewInMs: 120000,
    });

    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, message: "Invalid Clerk token" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const role = body.role;

    if (!["Guide", "Agency"].includes(role)) {
      return NextResponse.json(
        { success: false, message: "Invalid role" },
        { status: 400 },
      );
    }

    // Get trusted profile data from Clerk, not the request body.
    const clerk = createClerkClient({ secretKey });
    const profile = await clerk.users.getUser(clerkUserId);

    const firstName = profile.firstName ?? "";
    const lastName = profile.lastName ?? "";
    const fullName =
      profile.fullName?.trim() || `${firstName} ${lastName}`.trim();

    const email = profile.primaryEmailAddress?.emailAddress ?? "";
    const imageUrl = profile.imageUrl ?? "";

    const [existingUser] = await db
      .select({ id: userSchema.id })
      .from(userSchema)
      .where(eq(userSchema.id, clerkUserId))
      .limit(1);

    if (!existingUser) {
      await db.insert(userSchema).values({
        id: clerkUserId,
        firstName,
        lastName,
        fullName,
        email,
        imageUrl,
        role,
      });

      return NextResponse.json(
        {
          success: true,
          message: "User registered successfully",
        },
        { status: 201 },
      );
    }

    await db
      .update(userSchema)
      .set({
        firstName,
        lastName,
        fullName,
        email,
        imageUrl,
        role,
      })
      .where(eq(userSchema.id, clerkUserId));

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("REGISTER API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
