import { NextResponse } from "next/server";
import { userSchema } from "@/db/schema";
import { db } from "@/db/indext";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const passwordHash = await bcrypt.hash(body.password, 12);

    await db.insert(userSchema).values({
      id: uuidv4(),
      fullName: body.fullName,
      email: body.email,
      role: body.role,
      hashPassword: passwordHash,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ success: false }, { status: 500 });
  }
}
