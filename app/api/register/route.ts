import { NextResponse } from "next/server";
import { userSchema } from "@/db/schema";
import { db } from "@/db/indext";
import { v4 as uuidv4 } from "uuid";
import { verifyToken } from "@clerk/backend";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const secretKey = process.env.CLERK_SECRET_KEY;

    if (!secretKey) {
      throw new Error("CLERK_SECRET_KEY is not configured");
    }

    const token = authHeader.substring(7);

    const verifiedToken = await verifyToken(token, {
      secretKey,
      clockSkewInMs: 30000, // allow up to 30s skew
    });

    const clerkUserId = verifiedToken.sub;

    if (!clerkUserId) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Clerk token",
        },
        { status: 401 },
      );
    }

    // Prevent duplicate application users
    const [existingUser] = await db
      .select()
      .from(userSchema)
      .where(eq(userSchema.clerkUserId, clerkUserId))
      .limit(1);

    if (existingUser) {
      return NextResponse.json({
        success: true,
        user: existingUser,
        alreadyExists: true,
      });
    }
    const body = await req.json();

    const [user] = await db
      .insert(userSchema)
      .values({
        id: uuidv4(),
        clerkUserId,
        fullName: body.fullName,
        email: body.email,
        role: body.role,
      })
      .$returningId();

    return NextResponse.json({
      success: true,
      user,
      alreadyExists: false,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("REGISTER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to create user",
        reason: error?.reason,
      },
      {
        status: error?.reason?.includes("token") ? 401 : 500,
      },
    );
  }
}
