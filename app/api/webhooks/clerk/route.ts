// src/app/api/webhooks/clerk/route.ts

import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/indext";
import { userSchema } from "@/db/schema";

export async function POST(req: Request) {
  try {
    console.log("========== CLERK WEBHOOK START ==========");

    const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!SIGNING_SECRET) {
      console.error("❌ CLERK_WEBHOOK_SECRET is missing");

      return new Response("CLERK_WEBHOOK_SECRET is missing", {
        status: 500,
      });
    }

    console.log("✅ Webhook secret exists");

    // -----------------------------------------
    // Get Svix headers
    // -----------------------------------------

    const headerPayload = await headers();

    const svixId = headerPayload.get("svix-id");
    const svixTimestamp = headerPayload.get("svix-timestamp");
    const svixSignature = headerPayload.get("svix-signature");

    console.log("Svix headers:", {
      hasId: !!svixId,
      hasTimestamp: !!svixTimestamp,
      hasSignature: !!svixSignature,
    });

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("❌ Missing Svix headers");

      return new Response("Missing Svix headers", {
        status: 400,
      });
    }

    // -----------------------------------------
    // Read raw body
    // -----------------------------------------

    const payload = await req.text();

    console.log("✅ Webhook body received");
    console.log("Payload length:", payload.length);

    // -----------------------------------------
    // Verify webhook
    // -----------------------------------------

    const wh = new Webhook(SIGNING_SECRET);

    let evt: WebhookEvent;

    try {
      evt = wh.verify(payload, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as unknown as WebhookEvent;

      console.log("✅ Webhook signature verified");
    } catch (error) {
      console.error("❌ Webhook verification failed:", error);

      return new Response("Webhook verification failed", {
        status: 400,
      });
    }

    // -----------------------------------------
    // Event
    // -----------------------------------------

    const eventType = evt.type;

    console.log("Webhook event:", eventType);

    // -----------------------------------------
    // USER CREATED
    // -----------------------------------------

    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;

      const primaryEmail = email_addresses?.[0]?.email_address;

      console.log("Creating user:", {
        id,
        email: primaryEmail,
        firstName: first_name,
        lastName: last_name,
        imageUrl: image_url,
      });

      if (!id) {
        console.error("❌ Clerk user ID is missing");

        return new Response("Clerk user ID is missing", {
          status: 400,
        });
      }

      if (!primaryEmail) {
        console.error("❌ Primary email is missing");

        return new Response("Primary email is missing", {
          status: 400,
        });
      }

      console.log("Attempting database insert...");

      try {
        await db.insert(userSchema).values({
          id,
          clerkUserId: id,
          fullName: [first_name, last_name].filter(Boolean).join(" ") || null,
          firstName: first_name ?? null,
          lastName: last_name ?? null,
          email: primaryEmail,
          imageUrl: image_url ?? null,
          isRegisterUser: false,
        });

        console.log("✅ User inserted successfully");
      } catch (error) {
        console.error("❌ DATABASE INSERT FAILED");
        console.error(error);

        return new Response("Database insert failed", {
          status: 500,
        });
      }
    }

    // -----------------------------------------
    // USER UPDATED
    // -----------------------------------------

    if (eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;

      const primaryEmail = email_addresses?.[0]?.email_address ?? null;

      console.log("Updating user:", {
        id,
        email: primaryEmail,
        firstName: first_name,
        lastName: last_name,
        imageUrl: image_url,
      });

      if (!id) {
        return new Response("Clerk user ID is missing", {
          status: 400,
        });
      }

      try {
        await db
          .update(userSchema)
          .set({
            email: primaryEmail,
            firstName: first_name ?? null,
            lastName: last_name ?? null,
            imageUrl: image_url ?? null,
          })
          .where(eq(userSchema.id, id));

        console.log("✅ User updated successfully");
      } catch (error) {
        console.error("❌ DATABASE UPDATE FAILED");
        console.error(error);

        return new Response("Database update failed", {
          status: 500,
        });
      }
    }

    // -----------------------------------------
    // USER DELETED
    // -----------------------------------------

    if (eventType === "user.deleted") {
      const { id } = evt.data;

      console.log("Deleting user:", id);

      if (id) {
        try {
          await db.delete(userSchema).where(eq(userSchema.id, id));

          console.log("✅ User deleted successfully");
        } catch (error) {
          console.error("❌ DATABASE DELETE FAILED");
          console.error(error);

          return new Response("Database delete failed", {
            status: 500,
          });
        }
      }
    }

    console.log("========== CLERK WEBHOOK SUCCESS ==========");

    return new Response("Webhook processed successfully", {
      status: 200,
    });
  } catch (error) {
    console.error("========== CLERK WEBHOOK ERROR ==========");
    console.error(error);

    return new Response("Internal webhook error", {
      status: 500,
    });
  }
}
