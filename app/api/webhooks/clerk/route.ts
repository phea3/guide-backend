// src/app/api/webhooks/clerk/route.ts

import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db/indext";
import { userSchema } from "@/db/schema";

export async function POST(req: Request) {
  console.log("========== CLERK WEBHOOK START ==========");

  try {
    const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!SIGNING_SECRET) {
      console.error("❌ CLERK_WEBHOOK_SECRET is missing");

      return NextResponse.json(
        { success: false, message: "Webhook secret is not configured" },
        { status: 500 },
      );
    }

    console.log("✅ Webhook secret exists");

    const headerPayload = await headers();

    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    console.log("Svix headers:", {
      hasId: !!svix_id,
      hasTimestamp: !!svix_timestamp,
      hasSignature: !!svix_signature,
    });

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("❌ Missing Svix headers");

      return NextResponse.json(
        { success: false, message: "Missing Svix headers" },
        { status: 400 },
      );
    }

    const payload = await req.text();

    console.log("✅ Webhook body received");
    console.log("Payload length:", payload.length);

    const wh = new Webhook(SIGNING_SECRET);

    // Verify signature.
    // In your installed Svix version, verify() may return void.
    wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });

    console.log("✅ Webhook signature verified");

    // The signature is verified, so now parse the original payload.
    const evt = JSON.parse(payload) as {
      type: string;
      data: {
        id: string;
        email_addresses?: {
          email_address: string;
        }[];
        first_name?: string | null;
        last_name?: string | null;
        image_url?: string | null;
      };
    };

    console.log("========== CLERK EVENT ==========");
    console.log("Event type:", evt.type);
    console.log("Event data:", evt.data);

    if (evt.type === "user.created") {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;

      const primaryEmail = email_addresses?.[0]?.email_address ?? null;

      console.log("👤 Creating user:", id);
      console.log("📧 Email:", primaryEmail);

      await db.insert(userSchema).values({
        id,
        clerkUserId: id,
        email: primaryEmail,
        firstName: first_name ?? null,
        lastName: last_name ?? null,
        fullName: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
        imageUrl: image_url ?? null,
        isRegisterUser: false,
        isVerified: false,
        isFirstLogin: true,
      });
    }

    if (evt.type === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;

      const primaryEmail = email_addresses?.[0]?.email_address ?? null;

      console.log("✏️ Updating user:", id);

      await db
        .update(userSchema)
        .set({
          email: primaryEmail,
          firstName: first_name ?? "",
          lastName: last_name ?? "",
          fullName: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
          imageUrl: image_url ?? null,
        })
        .where(eq(userSchema.id, id));

      console.log("✅ User updated successfully");
    }

    if (evt.type === "user.deleted") {
      const { id } = evt.data;

      console.log("🗑️ Deleting user:", id);

      await db.delete(userSchema).where(eq(userSchema.id, id));

      console.log("✅ User deleted successfully");
    }

    console.log("========== CLERK WEBHOOK SUCCESS ==========");

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("========== CLERK WEBHOOK ERROR ==========");
    console.error(error);
    console.error("==========================================");

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
