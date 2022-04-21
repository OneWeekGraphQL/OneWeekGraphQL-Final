# Validate and fulfill orders

In this step we'll make checkout sessions more secure by making sure users cannot tamper with product prices, and we'll also add a way to fulfill orders.

## Validate cart items

To verify users don't tamper with cart item prices, we need a list of products first that serves as source of truth. For this example we'll use a CSV dataset of products provided by Shopify partners in Github, but you can fetch any kind of products from any source and they will serve just as well.

Start by downloading the product list from [https://github.com/shopifypartners/product-csvs/blob/master/apparel.csv](https://github.com/shopifypartners/product-csvs/blob/master/apparel.csv) and saving them in `public/apparel.json`. We're saving it in public so that both the API and the frontend can access them.

To give these products some structure, we'll create a `Product` type and process the data using `filter` and `map` so they have the appropriate shape. A product in this context consists of fields like `id`, `slug` and `title`.

Create a file inside lib called `products.ts` and add the following code to it:

```ts
// https://github.com/shopifypartners/product-csvs/blob/master/apparel.csv
import apparel from "../public/apparel.json";

export type Product = {
  id: string;
  slug: string;
  title: string;
  price: number;
  src: string;
  body: string;
};

export const products: Product[] = apparel
  .filter((product) => Boolean(product["Image Src"]))
  .map((product) => ({
    id: product.id,
    price: product["Variant Price"],
    title: product.Title,
    src: product["Image Src"],
    slug: product.Handle,
    body: product["Body (HTML)"],
  }));
```

Now that we have a product list that serves as source of truth for prices, we can create a function to validate cart items. It verifies cart items are valid and formats them for `Stripe.Checkout`.

An item is valid if:

- `Id` matches a product in our inventory
- `Price` hasn't been tampered with. This is why we use the price from our inventory

We'll add a new function called `validateCartItems` to `lib/cart.ts`. It does the same mapping from cart items to line items we did in the `createCheckoutSession` resolver, and it also validates `id` and `price`.

Another thing we'll do in this file is export and define `currencyCode`, since now it's used both here and in `pages/api/index.ts`. Be sure to import it on the resolvers file and delete the previous declaration.

This is what `lib/cart.ts` should look like now:

```ts
import { PrismaClient, CartItem } from "@prisma/client";
import { Stripe } from "stripe";
import { Product } from "./products";

export const currencyCode = "USD";

// ...

export function validateCartItems(
  inventory: Product[],
  cartItems: CartItem[]
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const checkoutItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  for (const item of cartItems) {
    const product = inventory.find(({ id }) => id === item.id);
    if (!product) {
      throw new Error(`Item with id ${item.id} is not on the inventory`);
    }
    checkoutItems.push({
      quantity: item.quantity,
      price_data: {
        currency: currencyCode,
        unit_amount: product.price,
        product_data: {
          name: item.name,
          description: item.description || undefined,
          images: item.image ? [item.image] : [],
        },
      },
    });
  }

  return checkoutItems;
}
```

Now replace the `line_item` assignment inside the `createCheckoutSession` mutation with `const line_items = validateCartItems(products, cartItems);`. Remember to import both `products` and `validateCartItems`. The mutation will look like this now:

```ts
// ...
import {
  findOrCreateCart,
  validateCartItems,
  currencyCode,
} from "../../lib/cart";
import { stripe } from "../../lib/stripe";
import { origin } from "../../lib/client";
import { products } from "../../lib/products";

const resolvers: Resolvers = {
  // ...
  Mutation: {
    createCheckoutSession: async (_, { input }, { prisma }) => {
      // ...

      const line_items = validateCartItems(products, cartItems);

      const session = await stripe.checkout.sessions.create({
        success_url: `${origin}/thankyou?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/cart?cancelled=true`,
        line_items,
        metadata: {
          cartId: cart.id,
        },
        mode: "payment",
      });

      return {
        id: session.id,
        url: session.url,
      };
    },
    // ...
  },
};
```

## Fulfill orders

After users finish their checkout process, the next step is actually fulfilling the order. Fulfillment can be instant for digital products or services, or it may mean packaging and shipping products in other cases.

After completing the payment, we need to notify the user with information regarding their order, and updating whatever records we need in our database. To implement this process, we'll setup a webhook that Stripe will use to send order messages.

Create a new file inside `pages/api` called `webhook.ts`. This API route will make sure it can only be called by Stripe first of all, as a security safeguard. Afterwards it will fulfill orders by checking for the `"checkout.session.completed"` event.

To verify the authenticity of requests, we'll use `stripe.webhooks.constructEvent` fromc the official Stripe library. It will throw an error on invalid payloads. It also receives a webhook secret to verify requests authenticity. Define a variable called `endpointSecret` and set it with `process.env.STRIPE_WEBHOOK_SECRET`. When we test the fulfillment process you'll set it's value in `.env`.

We'll install a library called `raw-body` first by calling `npm i raw-body --save`. Since NextJS parses payloads, and the `constructEvent` function requires raw bodies, we'll use this library to get the unparsed request body.

Afterwards, we'll check for the session completed event, and fulfill the order here. This means performing one or more of the following:

- Send email to customer
- Store order in your database

More info: https://stripe.com/docs/payments/checkout/fulfill-orders

This is what the webhook handling code looks like:

```ts
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
     * Fulfill order
     * This means performing one or more of the following:
     * - Send email to customer
     * - Store order in your database
     * More info: https://stripe.com/docs/payments/checkout/fulfill-orders
     */
  }

  response.status(200).end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};
```

## Testing

Now that the fulfillment process is set, it's time to verify everything works.

Before we start, you need to install Stripe's CLI. [Head over to Stripe CLI's installation page](<[https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)>) for instructions tailored for your operating system.

To try the fulfillment process, we'll create a new cart since the one we've been using in previous chapters has invalid items. Because we now verify cart items based on our products list, we wouldn't be able to create checkout sessions.

Create a new cart called `graphqlrocks`:

```graphql
{
  cart(id: "graphqlrocks") {
    id
  }
}
```

Now add an item from our products list to the cart, along with its `id`, `name` and `price`.

```graphql
mutation {
  addItem(
    input: {
      cartId: "graphqlrocks"
      id: "8d49784e-e88d-464d-b224-07bc43d3a969"
      name: "Ocean Blue Shirt"
      price: 5000
    }
  ) {
    id
    totalItems
  }
}
```

Now create a new session with the `createCheckoutSession` mutation to get a checkout page URL.

```graphql
mutation {
  createCheckoutSession(input: { cartId: "graphqlrocks" }) {
    id
    url
  }
}
```

Before heading over to the checkout page, be sure to start the stripe CLI and point it to the webhook URL. It'll receive all messages coming from stripe.

`stripe listen --forward-to localhost:3000/api/webhook`

Once you start it, copy the webhook signing secret from its output and paste it in `.env` as `STRIPE_WEBHOOK_SECRET`.

Now head over to the generated checkout URL, which will look like `https://checkout.stripe.com/pay/cs_test_akjsdhaskjh`. Enter your email and card info. You can use `4242 4242 4242 4242` as card number, which is a special testing card number that ends up in successful payments.

Once you've filled all your details, and if everything went well, Stripe will redirect you to the thank you page. It will look like `http://localhost:3000/thankyou?session_id=cs_test_dsads`, notice that it includes your session id as search parameter, so the thank you page can use it to fetch more information about it.
