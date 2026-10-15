import { NextRequest, NextResponse } from "next/server";
import { markInvitationAsPaid } from "@/lib/supabase";

// POST /api/webhooks/yookassa - Handle YooKassa notifications
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let body: Record<string, unknown>;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const event = (body.event as string) || "";
    const paymentObj = (body.object || {}) as Record<string, unknown>;

    if (event === "payment.succeeded" && paymentObj.status === "succeeded") {
      const metadata = (paymentObj.metadata || {}) as Record<string, string>;
      const invitationId = metadata.invitationId;

      if (invitationId) {
        console.log(`[YooKassa Webhook] Payment succeeded for invitation ${invitationId}`);
        await markInvitationAsPaid(invitationId);
        return NextResponse.json({
          received: true,
          invitationId,
          is_paid: true,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[YooKassa Webhook Error]:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
