import { NextResponse } from "next/server";
import { userSchema } from "@/db/schema";
import { db } from "@/db/indext";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  console.log("POST /api/register");

  try {
    const body = await req.json();

    console.log("body", body);

    const passwordHash = await bcrypt.hash(body.password, 12);

    console.log("hashed");

    await db.insert(userSchema).values({
      id: uuidv4(),
      fullName: body.fullName,
      email: body.email,
      role: body.role,
      hashPassword: passwordHash,
    });

    console.log("inserted");

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ success: false }, { status: 500 });
  }
}
