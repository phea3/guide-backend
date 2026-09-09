import { NextResponse } from "next/server";
import { userSchema } from "@/db/schema";
import { db } from "@/db/indext";
import { verifyToken } from "@clerk/backend";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    // --------------------------------------------------
    // 1. Get Clerk Bearer token
    // --------------------------------------------------
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
      console.error("CLERK_SECRET_KEY is missing");

      return NextResponse.json(
        {
          success: false,
          message: "Server authentication configuration error",
        },
        { status: 500 },
      );
    }

    const token = authHeader.substring(7);

    // --------------------------------------------------
    // 2. Verify Clerk token
    // --------------------------------------------------
    const verifiedToken = await verifyToken(token, {
      secretKey,
      clockSkewInMs: 30000,
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

    // --------------------------------------------------
    // 3. Parse request body
    // --------------------------------------------------
    const body = await req.json();

    const fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : "";

    const role = body.role;

    if (!["Guide", "Agency"].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid role",
        },
        { status: 400 },
      );
    }

    // --------------------------------------------------
    // 4. Split full name
    // --------------------------------------------------
    let firstName = "";
    let lastName = "";

    if (fullName) {
      const parts = fullName.split(/\s+/);

      firstName = parts[0] ?? "";
      lastName = parts.slice(1).join(" ");
    }

    // --------------------------------------------------
    // 5. Check existing user
    // --------------------------------------------------
    const existingUser = await db.query.userSchema.findFirst({
      where: eq(userSchema.id, clerkUserId),
    });

    if (existingUser) {
      console.log(`User ${clerkUserId} already exists`);

      return NextResponse.json({
        success: true,
        userId: existingUser.id,
        user: existingUser,
        message: "User already exists",
      });
    }

    // --------------------------------------------------
    // 6. Create user
    // --------------------------------------------------
    const [] = await db
      .insert(userSchema)
      .values({
        id: clerkUserId,
        clerkUserId,

        fullName: fullName || null,
        firstName: firstName || null,
        lastName: lastName || null,
        role,
        isRegisterUser: true,
        isVerified: false,
        isFirstLogin: true,

        status: "Active",
      })
      .$returningId();

    console.log(`✅ User registered successfully: ${clerkUserId}`);

    return NextResponse.json({
      success: true,
      userId: clerkUserId,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("========== REGISTER API ERROR ==========");
    console.error(error);
    console.error("========================================");

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown registration error",
      },
      { status: 500 },
    );
  }
}
