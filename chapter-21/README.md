# Remove items from cart

You will add a close button on cart items so that users can remove them from the shopping cart.

To implement this, you will write a `RemoveFromCart` mutation, create a `CloseIcon`, and add `button` on `CartItem`.

## Remove from cart mutation

Create a file inside `components` and name it `RemoveFromCart.graphql`.

```graphql
# import Cart from "./CartFragment"

mutation removeFromCart($input: RemoveFromCartInput!) {
  removeItem(input: $input) {
    ...Cart
  }
}
```

At the command line, run `npm run codegen` to regenerate `types.ts`.

This will create a new mutation hook called `useRemoveFromCartMutation`, which calls `Apollo.useMutation` in its body with the appropriate argument and return types.

## Send mutation on cart items

Create a new component called `CloseIcon.tsx` and put the following svg from [heroicons](https://heroicons.com):

```tsx
export function CloseIcon() {
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
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
```

Inside `CartItem.tsx`, import both `CloseIcon` and `useRemoveFromCartMutation`.

Call `useRemoveFromCartMutation` at the top of the component, and make it refetch `GetCartDocument`.

Add a button on the left of the item quantity that calls `removeFromCart`, is disabled while it's loading and has `CloseIcon` as children.

This is what `CartItem.tsx` looks like now:

```tsx
import {
  // ...
  useRemoveFromCartMutation,
} from "../types";
// ...
import { CloseIcon } from "./CloseIcon";

export function CartItem({ item, cartId }: { item: CartItem; cartId: string }) {
  // ...
  const [removeFromCart, { loading: removingFromCart }] =
    useRemoveFromCartMutation({
      refetchQueries: [GetCartDocument],
    });
  return (
    <div className="space-y-2">
      {`// ...`}
      <div className="flex gap-2">
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
        {`// ...`}
      </div>
    </div>
  );
}
```

Test this shiny new remove icon on [http://localhost:3000/cart](http://localhost:3000/cart)
