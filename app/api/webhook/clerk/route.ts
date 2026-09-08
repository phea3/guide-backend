// src/app/api/webhooks/clerk/route.ts
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/indext";
import { userSchema } from "@/db/schema";

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_SECRET_KEY;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Please add CLERK_SECRET_KEY from Clerk Dashboard to .env or .env.local",
    );
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", { status: 400 });
  }

  // Get body as raw text for verification
  const payload = await req.text();
  const wh = new Webhook(SIGNING_SECRET);

  let evt: WebhookEvent;

  // Verify payload with headers
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as unknown as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification failed", { status: 400 });
  }

  const eventType = evt.type;

  // Handle user creation
  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const primaryEmail = email_addresses?.[0]?.email_address;

    if (!primaryEmail) {
      return new Response("Error: No primary email found", { status: 400 });
    }

    await db.insert(userSchema).values({
      id: id,
      email: primaryEmail,
      firstName: first_name,
      lastName: last_name,
      imageUrl: image_url,
    });
  }

  // Handle user update
  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const primaryEmail = email_addresses?.[0]?.email_address;

    await db
      .update(userSchema)
      .set({
        email: primaryEmail,
        firstName: first_name,
        lastName: last_name,
        imageUrl: image_url,
      })
      .where(eq(userSchema.id, id));
  }

  // Handle user deletion
  if (eventType === "user.deleted") {
    const { id } = evt.data;

    if (id) {
      await db.delete(userSchema).where(eq(userSchema.id, id));
    }
  }

  return new Response("Webhook processed successfully", { status: 200 });
}
