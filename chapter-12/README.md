# Create a new Stripe checkout session

We will implement the defining feature of any ecommerce, which is allowing users to checkout items.

Stripe will take care of the checkout experience, so the role of our API is interacting with Stripe to create a checkout URL where our users can pay for their order.

## Schema

Let's start by adding a new mutation to our schema called `createCheckoutSession`, along with it's input and output types.

It will receive only a cart id as input. It will return a checkout session type, which consists of an ID and a url, which will point to stripe. This is where our frontend will redirect our users so they can complete their order.

```graphql
type Mutation {
  # ...
  createCheckoutSession(input: CreateCheckoutSessionInput!): CheckoutSession
}

# ...

type CheckoutSession {
  id: ID!
  url: String
}

# ...

input CreateCheckoutSessionInput {
  cartId: ID!
}
```

Before moving on to implement the new resolver, remember to call `npm run codegen` to update `types.ts`.

## Setting up Stripe

The main goal of the `createCheckoutSession` mutation is calling `stripe.checkout.sessions.create` with the correct cart items, and then return this URL on its payload.

Begin Stripe's setup process by installing stripe nodejs client, along with its types.

```bash
npm add stripe@8.201.0 --save
npm add @types/stripe-v3@3.1.26 --save-dev
```

Now we're ready to create a new file inside the `lib` folder, called `stripe.ts`. It will create a new instance of the stripe client so we can reuse it in many places through our codebase.

```ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2020-08-27",
});
```

You'll need to add `STRIPE_SECRET_KEY` to `.env`. You'll need to create an account at `https://stripe.com/` and get a test API key.

## Resolver: Create checkout session

Now we can focus on the `createCheckoutSession` resolver. It will first use `prisma` to fetch a cart, then get it's items so it can create a session in Stripe with the corresponding cart info.

Go to `pages/api/index.ts` and add a new field to `Mutation` called `createCheckoutSession`

Inside of it, call `prisma.cart.findUnique()` with `cartId`. Store the result in a `cart` variable, and if there was no cart throw an error.

Secondly, call `prisma.cart.findUnique().items()` to get the cart items. Another option to get the items is calling `prisma.cartItem.findMany()`, but we choose the former because of a neat prisma [query optimization feature](https://www.prisma.io/docs/guides/performance-and-optimization/query-optimization-performance) involving `findUnique`. The gist of it is that prisma batches `findUnique` queries with the same `where` and `include` parameters.

After getting the cart items, we need to transform them into stripe's `line_items`. We'll use `map` to change every cart item into a shape that the stripe client accepts.

After all this data fetching and transforming, we finally have all the data we need to call `stripe.checkout.sessions.create`. It receives an object as argument, consisting of several required or optional keys.

We'll pass `success_url` and `cancel_url` so that the hosted checkout page knows where to redirect users. Success URL will be `${origin}/thankyou?session_id={CHECKOUT_SESSION_ID}` and cancel URL `${origin}/cart?cancelled=true`.

Both URLs start with a variable called `origin`, which changes depending on the environment and also whether it's running on the server or on the client. It is `http://localhost:3000` on development, `NEXT_PUBLIC_VERCEL_URL` on non local environments and `window.location.host` on the client.

To define the `origin` variable, create a file called `client.ts` on the `lib` folder with the following code:

```ts
const protocol = `${
  process.env.NODE_ENV === "development" ? "http" : "https"
}://`;

const host =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_VERCEL_URL || "localhost:3000"
    : // Use host on the client since using VERCEL_URL can lead to CORS errors due to aliases
      window.location.host;

export const origin = `${protocol}${host}`;
```

Back to the parameters of `stripe.checkout.sessions.create`, another key we'll set is `line_items` which is essential to show to users their chosen items. We will also set `metadata.cartId`, which Stripe will store in `session.metadata.cartId`.

This is how the resolver should look like:

```ts
// ...
import { findOrCreateCart } from "../../lib/cart";
import { stripe } from "../../lib/stripe";
import { origin } from "../../lib/client";

const resolvers: Resolvers = {
  // ...
  Mutation: {
    createCheckoutSession: async (_, { input }, { prisma }) => {
      const { cartId } = input;

      const cart = await prisma.cart.findUnique({
        where: { id: cartId },
      });

      if (!cart) {
        throw new GraphQLYogaError("Invalid cart");
      }

      const cartItems = await prisma.cart
        .findUnique({
          where: { id: cartId },
        })
        .items();

      if (!cartItems || cartItems.length === 0) {
        throw new GraphQLYogaError("Cart is empty");
      }

      const line_items = cartItems.map((item) => {
        return {
          quantity: item.quantity,
          price_data: {
            currency: "USD",
            unit_amount: item.price,
            product_data: {
              name: item.name,
              description: item.description || "Description",
              images: item.image ? [item.image] : [],
            },
          },
        };
      });

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

Try it out by going to [http://localhost:3000/api] and send the newly created mutation:

```graphql
mutation {
  createCheckoutSession(input: { cartId: "oneweekgraphql" }) {
    id
    url
  }
}
```

You'll get a response that looks like this:

```json
{
  "data": {
    "createCheckoutSession": {
      "id": "cs_test_lkdsajklasdkjasl",
      "url": "https://checkout.stripe.com/pay/cs_test_akjsdhaskdhakjshdaksjhdk"
    }
  }
}
```

Go ahead and navigate to the generated URL to see what the generated checkout page looks and feels like
