# Create schema and resolver for decreasing item quantity

Now we're ready to write the last one of the cart item's CRUD operations, `decreaseCartItem`. Not surprisingly, it does have a similar signature and implementation as `increaseCartItem`. Still it does have some interesting peculiarities that we'll cover in this section, specially to make sure users can mindlessly hit the minus button as much as they want.

## Add mutation to schema

First thing we'll do is adding a field called `decreaseCartItem` to the schema's `Mutation` type.

This operation receives an input of type `DecreaseCartItemInput`, which we'll define momentarily, and it returns a `Cart` type.

Create an `input` type called `DecreaseCartItemInput`, with an `id` and `cartId` fields.

This is what these two additions look like in our schema:

```graphql
type Mutation {
  # ...
  decreaseCartItem(input: DecreaseCartItemInput!): Cart
}

# ...

input DecreaseCartItemInput {
  id: ID!
  cartId: ID!
}
```

Remember to generate the types associated with these new changes with `npm run codegen` before moving on to defining the new mutation's resolver, otherwise you'll run into type errors.

## Write mutation's resolver

The bulk of the `decreaseCartItem` resolver will be handled by `prisma.cartItem.update`'s `data.quantity.decrement`, which atomically decrements the cart item's quantity. Fun fact: we could get tricky and instead of passing `decrement: 1` to `update`, use `increment: -1`. But let's take the boring path and choose clear over clever.

Besides decrementing by 1, we need to prevent users from setting negative quantities. To do that we'll check if quantity is negative after decrementing, and set quantity to 0 in that case.

Finally, the resolver should return the corresponding cart.

Here's what the resolver should look like:

```ts
const resolvers: Resolvers = {
  // ...
  Mutation: {
    // ...
    decreaseCartItem: async (_, { input }, { prisma }) => {
      const { cartId, quantity } = await prisma.cartItem.update({
        data: {
          quantity: {
            decrement: 1,
          },
        },
        where: { id_cartId: { id: input.id, cartId: input.cartId } },
        select: {
          quantity: true,
          cartId: true,
        },
      });
      // Allow users to decrease any number of times
      if (quantity <= 0) {
        await prisma.cartItem.update({
          where: { id_cartId: { id: input.id, cartId: input.cartId } },
          data: {
            quantity: {
              set: 0,
            },
          },
        });
      }
      return findOrCreateCart(prisma, cartId);
    },
  },
};
```

## Sending mutation from our client

We can now decrease cart item's by going to [http://localhost:3000/api](http://localhost:3000/api) and fire up the mutation from GraphiQL. Feel free to press <kbd>CMD</kbd> + <kbd>Enter</kbd> many times, like a madperson, just to verify the quantity never goes below zero, which would be too abstract anyway.

```graphql
mutation decreaseCartItem {
  decreaseCartItem(input: { id: "1", cartId: "oneweekgraphql" }) {
    id
    items {
      name
      quantity
      unitTotal {
        formatted
        amount
      }
      lineTotal {
        formatted
        amount
      }
    }
    subTotal {
      formatted
    }
  }
}
```

```json
{
  "data": {
    "decreaseCartItem": {
      "id": "oneweekgraphql",
      "items": [
        {
          "name": "Shirt",
          "quantity": 1,
          "unitTotal": {
            "formatted": "$10.00",
            "amount": 1000
          },
          "lineTotal": {
            "formatted": "$10.00",
            "amount": 1000
          }
        }
      ],
      "subTotal": {
        "formatted": "$10.00"
      }
    }
  }
}
```
