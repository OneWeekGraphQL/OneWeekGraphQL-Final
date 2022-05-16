# Order confirmation page

The last step of the checkout flow is displaying an order confirmation page.

Once users finish their payment flow, Stripe redirects users to `/thankyou`, which you configured on `stripe.checkout.sessions.create` `success_url` parameter.

You will create a page that confirms the order, displays the order items, and shows a button to start a new order.

## Implement Stripe success URL

Stripe will redirect users to the order confirmation page, along with a session id as URL parameter. It will look something like `/thankyou?session_id=cs_test_1234`.

Create a new page called `thankyou.tsx`. The page component will receive a Stripe session in its props, which will have the type `Stripe.Checkout.Session | null`.

The confirmation page will fetch the session using NextJs `getServerSideProps` function. It will grab the session id from the URL params, call `stripe.checkout.sessions.retrieve(sessionId)` and return its value as `props.session`.

This is what the page looks like now:

```tsx
import { GetServerSideProps, NextPage } from "next";
import Stripe from "stripe";
import { Header } from "../components/Header";
import { stripe } from "../lib/stripe";

const ThankYou: NextPage<IProps> = ({ session }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
    </div>
  );
};

interface IProps {
  session: Stripe.Checkout.Session | null;
}

export const getServerSideProps: GetServerSideProps<IProps> = async ({
  query,
}) => {
  const sessionId = query.session_id;
  const session =
    typeof sessionId === "string"
      ? await stripe.checkout.sessions.retrieve(sessionId)
      : null;
  return { props: { session } };
};

export default ThankYou;
```

## Order confirmation and starting new orders

Now that the order confirmation page has access to the user's Stripe session, it can get the cart item id from there and fetch it. This page will add a thank you message on the left side of the screen. It will also show a button that allows users to start a new order.

On the thank you page, import the `useGetCartQuery` hook, pass the cart id variable by getting it from `session?.metadata?.cartId`, and also add a `skip` property so that it only fetches data if both session and cart id are present.

Display a message that says "Your order is confirmed!" and a button that starts a new order by clearing the cart id cookie.

```tsx
// ...
import { useGetCartQuery } from "../types";
import { removeCookies } from "cookies-next";
import Router from "next/router";

const ThankYou: NextPage<IProps> = ({ session }) => {
  const { data } = useGetCartQuery({
    variables: { id: session?.metadata?.cartId! },
    skip: !session?.metadata?.cartId,
  });
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 grid grid-cols-2 mx-auto max-w-4xl space-y-8 min-h-full">
        <div className="border-r border-neutral-700 p-8 space-y-4">
          <h1 className="text-4xl">Thanks!</h1>
          <p>Your order is confirmed!</p>
          <p>You&apos;ll receive an email when it&apos;s ready.</p>
          <p>
            Want to start a new order?{" "}
            <button
              className="font-bold text-pink-400 hover:text-pink-500"
              onClick={() => {
                removeCookies("cartId");
                Router.push("/");
              }}
            >
              Click here.
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};

// ...
```

## Display cart items

The order confirmation page will display the order items.

You will reuse the `CartDetail` component that is already used on the cart page. But first you will modify it by adding a `isReadOnly` prop to it. A read only cart detail component does not display the remove, increase or decrease item icons.

Modify both `CartDetail` and `CartItem` components to accept a `isReadOnly` prop.

First change `CartDetail.tsx` to accept the boolean prop and pass it along to each cart item:

```tsx
// ...

export function CartDetail({
  cart,
  isReadOnly,
}: {
  cart: CartFragment | null | undefined;
  isReadOnly?: boolean;
}) {
  return (
    <div>
      <div className={`space-y-8 relative`}>
        {cart?.items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            cartId={cart.id}
            isReadOnly={isReadOnly}
          />
        ))}
      </div>
      {`// ...`}
    </div>
  );
}
```

Now update the component in `CartItem.tsx` to accept the new prop and make it display null instead of the remove, increase and decrease item buttons:

```tsx
// ...

export function CartItem({
  item,
  cartId,
  isReadOnly,
}: {
  item: CartItem;
  cartId: string;
  isReadOnly?: boolean;
}) {
  // ...
  return (
    <div className="space-y-2">
      {`// ...`}
      <div className="flex gap-2">
        {isReadOnly ? null : (
          <button
            onClick={() =>
              removeFromCart({
                variables: { input: { id: item.id, cartId } },
              })
            }
            disabled={removingFromCart}
            className="p-1 font-light border border-neutral-700  hover:bg-black hover:text-white"
          >
            <CloseIcon />
          </button>
        )}
        <div className="flex-1 flex">
          <div className="px-2 py-1 font-light border border-neutral-700 flex-1">
            {item.quantity}
          </div>
          {isReadOnly ? null : (
            <>
              <button
                onClick={() =>
                  decreaseCartItem({
                    variables: { input: { id: item.id, cartId } },
                  })
                }
                disabled={decreasingCartItem}
                className="p-1 font-light border border-neutral-700  hover:bg-black hover:text-white"
              >
                <MinusIcon />
              </button>
              <button
                onClick={() =>
                  increaseCartItem({
                    variables: { input: { id: item.id, cartId } },
                  })
                }
                disabled={increasingCartItem}
                className="p-1 font-light border border-neutral-700  hover:bg-black hover:text-white"
              >
                <PlusIcon />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

Finally, update the order confirmation page in `pages/thankyou.tsx` to display `CartDetail`:

```tsx
// ...
import { CartDetail } from "../components/CartDetail";

const ThankYou: NextPage<IProps> = ({ session }) => {
  const { data } = useGetCartQuery({
    variables: { id: session?.metadata?.cartId! },
    skip: !session?.metadata?.cartId,
  });
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 grid grid-cols-2 mx-auto max-w-4xl space-y-8 min-h-full">
        {`// ...`}
        <div className="p-8">
          <CartDetail isReadOnly cart={data?.cart} />
        </div>
      </main>
    </div>
  );
};

// ...
```

And that's it! You created a success page that users will see after they finish their payment flow.

Try it out! Make sure you have a `STRIPE_SECRET_KEY` in your environment variables, go to [http://localhost:3000](http://localhost:3000), add some cart items, click the checkout button and finish a payment. Remember to use test cards, and you will see the order confirmation page at the end of your journey.
