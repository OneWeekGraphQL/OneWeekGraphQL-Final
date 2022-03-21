# Create schema and resolver for increasing item quantity

Let's keep expanding what operations API consumers can perform by adding a mutation to increase an item's quantity.

We'll follow the same pattern as previous sections. First we'll add operations and types to the schema, then regenerate types and finally write the new resolver.

## Define increase cart item mutation

Add a new operation called `increaseCartItem` to the `Mutation` type, and also define a new input type called `IncreaseCartItemInput`.

As you can see on the following code snippet, both the mutation and its input type look very similar to the `removeItem`. Both return a `Cart` that reflects its new state, and both have a similarly shaped input consisting of `id` and `cartId`.

```graphql
type Mutation {
  # ...
  increaseCartItem(input: IncreaseCartItemInput!): Cart
}

# ...

input IncreaseCartItemInput {
  id: ID!
  cartId: ID!
}
```

Let's regenerate `types.ts` based on the new shape of the schema by running `npm run codegen`.

## Increase cart item resolver

We will increase cart items atomically using Prisma's `increment` operation.

As its name indicates, this action increments integer values by a number.

It reads and updates the value atomically, which means "in one operation" in this case. As opposed to the alternative, which is querying a value and then performing an update. This approach does not suffer from race condition problems, unlike the alternative.

In our use case of increasing cart items, using this atomic approach means that when users increase two items at the exact same time, the mutation will always end up as the sum of both operations. If we used the other approach, the cart could end up ignoring one of the two operations.

Here's what the resolver looks like now:

```ts
const resolvers: Resolvers = {
  // ...
  Mutation: {
    // ...
    increaseCartItem: async (_, { input }) => {
      const { cartId, quantity } = await prisma.cartItem.update({
        data: {
          quantity: {
            increment: 1,
          },
        },
        where: { id_cartId: { id: input.id, cartId: input.cartId } },
        select: {
          quantity: true,
          cartId: true,
        },
      });
      return findOrCreateCart(cartId);
    },
  },
};
```

## Increase cart item mutation

Let's see if increasing cart items works fine by firing up the mutation in [http://localhost:3000/api](http://localhost:3000/api) and verifying its output.

```graphql
mutation increaseCartItem {
  increaseCartItem(input: { id: "1", cartId: "oneweekgraphql" }) {
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
    "increaseCartItem": {
      "id": "oneweekgraphql",
      "items": [
        {
          "name": "Shirt",
          "quantity": 2,
          "unitTotal": {
            "formatted": "$10.00",
            "amount": 1000
          },
          "lineTotal": {
            "formatted": "$20.00",
            "amount": 2000
          }
        }
      ],
      "subTotal": {
        "formatted": "$20.00"
      }
    }
  }
}
```
