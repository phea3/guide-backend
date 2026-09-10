import { NextResponse } from "next/server";
import { userSchema } from "@/db/schema";
import { db } from "@/db/indext";
import { verifyToken } from "@clerk/backend";
import { eq } from "drizzle-orm";

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

    const { fullName = "", role } = await req.json();

    if (!["Guide", "Agency"].includes(role)) {
      return NextResponse.json(
        { success: false, message: "Invalid role" },
        { status: 400 },
      );
    }

    const name = typeof fullName === "string" ? fullName.trim() : "";
    const [firstName = "", ...rest] = name.split(/\s+/);
    const lastName = rest.join(" ");

    const [user] = await db
      .select({ id: userSchema.id })
      .from(userSchema)
      .where(eq(userSchema.id, clerkUserId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User does not exist" },
        { status: 404 },
      );
    }

    await db
      .update(userSchema)
      .set({
        firstName,
        lastName,
        fullName: name,
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
