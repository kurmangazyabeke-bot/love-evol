import { NextRequest, NextResponse } from "next/server";
import { markInvitationAsPaid } from "@/lib/supabase";

// POST /api/webhooks/stripe - Handle Stripe webhooks
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let event: Record<string, unknown>;

    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const eventType = (event.type as string) || "";

    // Listen for completed checkout or succeeded payment
    if (
      eventType === "checkout.session.completed" ||
      eventType === "payment_intent.succeeded"
    ) {
      const dataObj = ((event.data as Record<string, unknown>)?.object || {}) as Record<string, unknown>;
      const metadata = (dataObj.metadata || {}) as Record<string, string>;
      const invitationId = metadata.invitationId || (dataObj.client_reference_id as string);

      if (invitationId) {
        console.log(`[Stripe Webhook] Marking invitation ${invitationId} as paid...`);
        const updated = await markInvitationAsPaid(invitationId);
        return NextResponse.json({
          received: true,
          invitationId,
          is_paid: true,
          updated: Boolean(updated),
        });
      }
    }

    return NextResponse.json({ received: true, eventType });
  } catch (error) {
    console.error("[Stripe Webhook Error]:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
