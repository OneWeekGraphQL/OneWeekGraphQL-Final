# Add products to cart

Let's add a button so that users can add products to their shopping carts.

To achieve this, you will write a GraphQL document for the `addItem` mutation the backend provides. Then, regenerate types to autogenerate the corresponding React hook.

The last step will be adding a button to the `ProductDetail` component that calls the mutation when the user clicks it, with the appropriate `product` and `cartId` arguments.

## Add to cart mutation

Create a new GraphQL file inside `documents` and call it `AddToCart.graphql`. It will import the `Cart` fragment, and spread it on the result of the `addItem` mutation.

```graphql
# import Cart from "./CartFragment"

mutation addToCart($input: AddToCartInput!) {
  addItem(input: $input) {
    ...Cart
  }
}
```

Run `npm run codegen` to update `types.ts` with the associated mutation types and hooks.

## Create "Add to cart" button

The cart detail page will have a button right below the product description that, when clicked, will add the current product to the shopping cart.

Users should see the new cart item quantity on the page's header and when they navigate to their cart, so you need to make sure to reflect the state of the cart after the action ends.

Import the generated GraphQL hook named `useAddToCartMutation` on `ProductDetail.tsx`, and call it on the top of the component. On the hook options, add a key called `refetchQueries` to refetch the `getCart` queyr once the mutation finishes.

Finally replace the `div` that wraps the product description with an html `form` element, call `addToCart` on that form's submit prop, and lastly add a submit button to trigger the function.

```tsx
// ...
import { GetCartDocument, useAddToCartMutation } from "../types";
import { getCookie } from "cookies-next";

export function ProductDetail({ product }: { product: Product | null }) {
  const cartId = String(getCookie("cartId"));
  const [addToCart, { loading }] = useAddToCartMutation({
    refetchQueries: [GetCartDocument],
  });

  // ...

  return (
    <main className="grid grid-cols-4 h-[700px]">
      {`// ...`}
      <form
        className="p-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          addToCart({
            variables: {
              input: {
                cartId,
                id: product.id,
                name: product.title,
                description: product.body,
                price: product.price,
                image: product.src,
              },
            },
          });
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: product.body }} />
        <button
          className="px-6 py-4 bg-black rounded w-full text-white hover:bg-white hover:text-black border border-black uppercase"
          type="submit"
        >
          {loading ? "Adding to cart..." : "Add to cart"}
        </button>
      </form>
    </main>
  );
}
```

Now you should be able to add products to cart, try it out!
