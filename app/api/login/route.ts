import { db } from "@/db/indext";
import { userSchema } from "@/db/schema";
import bcrypt from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const user = await db.query.userSchema.findFirst({
      where: or(
        eq(userSchema.email, body.email),
        eq(userSchema.username, body.email),
      ),
    });

    if (!user?.hashPassword) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    const valid = await bcrypt.compare(body.password, user.hashPassword);

    if (!valid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        role: user.role,
      },
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
