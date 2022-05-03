import { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "../../lib/stripe";
import getRawBody from "raw-body";
import Stripe from "stripe";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function Webhook(
  request: NextApiRequest,
  response: NextApiResponse
) {
  // Get raw body to pass to stripe's webhook checker
  // Stripe expects raw body, but nextjs already parsed it into body
  // https://github.com/vercel/next.js/discussions/13405#discussioncomment-1668455
  const payload = await getRawBody(request);
  const signature = request.headers["stripe-signature"];
  let event;

  try {
    if (!signature) {
      throw new Error("Missing stripe signature");
    }
    // Verify webhook came from stripe
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  } catch (err) {
    if (err instanceof Error) {
      return response.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  if (event?.type === "checkout.session.completed") {
    const _session = event.data.object as Stripe.Checkout.Session;
    /**
     * Fulfil order
     * This means performing one or more of the following:
     * - Send email to customer
     * - Store order in your database
     * More info: https://stripe.com/docs/payments/checkout/fulfill-orders
     */
    console.log("Fulfilling order");
  }

  response.status(200).end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};
