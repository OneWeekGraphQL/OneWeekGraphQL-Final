# Checkout page

Once users finish adding items to their cart, they should be able to click a checkout button to complete their order.

To make this happen, you will add a button to the cart page that creates a Stripe checkout session URL, then redirects users there to finish their order.

This will involve writing a GraphQL mutation document that calls `createCheckoutSession` with the users' cart id, gets the generated URL, and redirects there.

You will also make sure to handle errors and displays them, along with suggested actions to overcome those potential issues.

## Creating checkout sessions

You will write a GraphQL query to create checkout sessions, regenerate types to create its associated hook, call that hook in the cart page, and finally redirect users to the session URL that this mutation returns.

Create a new file called `CreateCheckoutSession.graphql` inside `components` with the following mutation:

```graphql
mutation CreateCheckoutSession($input: CreateCheckoutSessionInput!) {
  createCheckoutSession(input: $input) {
    id
    url
  }
}
```

Now regenerate types with `npm run codegen` to update `types.ts`.

Import the generated `useCreateCheckoutSessionMutation` hooks in `cart.tsx`. Add `cartId` to this hooks variables, and also an `onCompleted` function that redirects users to `data.createCheckoutSession?.url`.

Finally add a button that displays "Go to Checkout" and calls `createCheckoutSession`. When the mutation is in progress, this button displays "Redirecting to Checkout" and is disabled.

```tsx
// ...
import { useCreateCheckoutSessionMutation, useGetCartQuery } from "../types";
// ...
import { useRouter } from "next/router";

const Cart: NextPage<IProps> = ({ cartId }) => {
  // ...
  const router = useRouter();
  const [createCheckoutSession, { loading: creatingCheckoutSession, error }] =
    useCreateCheckoutSessionMutation({
      variables: {
        input: {
          cartId,
        },
      },
      onCompleted: (data) => {
        if (data?.createCheckoutSession?.url) {
          router.push(data.createCheckoutSession?.url);
        }
      },
    });
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="p-8 min-h-screen">
        <div className="mx-auto max-w-xl space-y-8">
          <h1 className="text-4xl">Cart</h1>
          <CartDetail cart={data?.cart} />
          <div>
            <button
              onClick={(e) => {
                e.preventDefault();
                createCheckoutSession();
              }}
              disabled={creatingCheckoutSession}
              className="p-1 font-light border border-neutral-700 hover:bg-black hover:text-white w-full"
            >
              {creatingCheckoutSession
                ? "Redirecting to Checkout"
                : "Go to Checkout"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

// ...
```

## Handling checkout errors

You will add an error message in case the checkout mutation fails. This will handle cases like empty cart items, or problems with invalid cart ids.

Right now, when users start the checkout process with an empty cart, they won't see anything and might wonder what's the issue. Keep in mind that in development mode, you will see a big red modal that says "Error: Cart is empty", but this won't appear on the production build.

Create a new component called `CartError.tsx` that receives an error as prop and displays it as text. In the case of known errors it'll also display next actions, like "keep browsing" in the case of empty carts or "empty cache and reload" when a cart is invalid.

This is what `CartError` should look like:

```tsx
import Link from "next/link";
import { removeCookies } from "cookies-next";
import { ExclamationCircle } from "./ExclamationCircle";

export function CartError({ error }: { error: Error | undefined }) {
  if (!error) {
    return null;
  }
  return (
    <div className="bg-red-500 rounded p-4">
      <div className="flex gap-2 items-center">
        <ExclamationCircle />
        <div className="flex-1 flex justify-between items-center">
          {error.message}
          {error.message === "Cart is empty" ? (
            <Link href="/">
              <a className="border border-black p-1 px-2 rounded hover:bg-red-300">
                Keep browsing
              </a>
            </Link>
          ) : null}
          {error.message === "Invalid cart" ? (
            <button
              onClick={() => {
                removeCookies("cartId");
                window.location.reload();
              }}
              className="border border-black p-1 px-2 rounded hover:bg-red-300"
            >
              Empty cache and reload
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
```

Create the `ExclamationCircle.tsx` that holds the icon we display on the error component:

```tsx
export function ExclamationCircle() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
```

Finally, add the `CartError` component in `cart.tsx`, right above `CartDetail`.

```tsx
// ...
import { useCreateCheckoutSessionMutation, useGetCartQuery } from "../types";
// ...
import { useRouter } from "next/router";
import { CartError } from "../components/CartError";

const Cart: NextPage<IProps> = ({ cartId }) => {
  // ...
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="p-8 min-h-screen">
        <div className="mx-auto max-w-xl space-y-8">
          {`// ...`}
          <CartError error={error} />
          <CartDetail cart={data?.cart} />
          {`// ...`}
        </div>
      </main>
    </div>
  );
};

// ...
```

Try out the complete checkout flow at [http://localhost:3000/cart](http://localhost:3000/cart).
