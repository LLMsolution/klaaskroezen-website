import { NextResponse } from "next/server";
import { fetchAction } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";

/**
 * Mollie webhook handler.
 * Mollie sends a POST with `id` (payment ID) when payment status changes.
 * We forward to the Convex action which verifies via Mollie API and processes.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const paymentId = formData.get("id") as string;

    if (!paymentId) {
      return NextResponse.json(
        { error: "Missing payment ID" },
        { status: 400 },
      );
    }

    // Forward to Convex action for processing
    await fetchAction(api.mollie.handleMollieWebhook, {
      molliePaymentId: paymentId,
    });

    // Always return 200 to Mollie (they retry on non-200)
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Mollie webhook error:", error);
    // Still return 200 to prevent Mollie from retrying
    return NextResponse.json({ received: true });
  }
}
