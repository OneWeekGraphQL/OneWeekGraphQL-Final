# Create schema and resolver for adding new item

We'll expose a mutation to add new items to carts. To achieve this we'll go through the following steps:

1. GraphQL Schema
2. Generate types
3. Define GraphQL resolver
4. Verify it works

## Add item mutation

Since this is the first mutation we'll define, we need to create the `Mutation` type in our `schema.graphql` file.

Inside this new type we'll define a mutation called `addItem` that takes an input named `AddToCartInput` as argument, and returns a `Cart`.

```graphql
type Mutation {
  addItem(input: AddToCartInput!): Cart
}
```

Now let's add the `AddToCartInput` type to the end of the file. It'll contain a number of properties needed to create cart items, being `cartId`, `name` and `price` it's only required ones.

```graphql
input AddToCartInput {
  cartId: ID!
  id: ID!
  name: String!
  description: String
  image: String
  price: Int!
  quantity: Int = 1
}
```

Now let's call `npm run codegen` in the terminal to reflect the new types in `types.ts`

`npm run codegen`

The previous command created a couple of new types: `Mutation` and `AddToCartInput`.

## Add item resolvers

Now we can go ahead and add a function called `addItem` to `pages/api/index.ts` that will act as resolver.

It will create a new cart item to the database or update it if it's new, using `prisma.cartItem.upsert`.

Upsert checks whether it creates or updates the item based on it's `where` parameter. In this case, we'll send `id_cartId` to it, since we defined in our `schema.prisma` file that cart items have a compound index made up of both `id` and `cartId`.

If the item is new, we'll create one based on the input data. Otherwise, if it already exists, we'll update its quantity by `increment` or `1`.

Add the following code right after `Query`, inside of `pages/api/index.ts`:

```ts
  Mutation: {
    addItem: async (_, { input }, { prisma }) => {
      const cart = await findOrCreateCart(prisma, input.cartId);
      await prisma.cartItem.upsert({
        create: {
          cartId: cart.id,
          id: input.id,
          name: input.name,
          description: input.description,
          image: input.image,
          price: input.price,
          quantity: input.quantity || 1,
        },
        where: { id_cartId: { id: input.id, cartId: cart.id } },
        update: {
          quantity: {
            increment: input.quantity || 1,
          },
        },
      });
      return cart;
    },
  },
```

As you may have noticed, the code we just added used a new function called `findOrCreateCart`. Let's implement it. Create a file called `lib/cart.ts`, which will contain this function.

As the eloquent function name suggests, it will return a cart if it exists, otherwise it will create it before returning it.

Paste (or type) the following code inside `lib/cart.ts`:

```ts
import { PrismaClient } from "@prisma/client";

export async function findOrCreateCart(prisma: PrismaClient, id: string) {
  let cart = await prisma.cart.findUnique({
    where: { id },
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { id },
    });
  }
  return cart;
}
```

If you remember, this function looks exactly the same as the code we used previously on the `cart` resolver, so let's go ahead and edit `pages/api/index.ts` to use it in there as well.

```ts
import { findOrCreateCart } from "../../lib/cart";

// ...

const resolvers: Resolvers = {
  Query: {
    cart: async (_, { id }, { prisma }) => {
      return findOrCreateCart(prisma, id);
    },
  },
```

To verify this new mutation works well, start the server if you haven't already. We'll fire up some GraphQL queries and mutations next.

```bash
npm run start
```

Go to `http://localhost:3000/api` and paste the following mutation on the explorer. It calls `addItem` with some test data.

```graphql
mutation {
  addItem(
    input: { cartId: "oneweekgraphql", id: "1", name: "Shirt", price: 1000 }
  ) {
    id
    totalItems
  }
}
```

Now replace the mutation with a `cart` query that gets all items of the cart with the same id as before (`oneweekgraphql` in our case).

```graphql
{
  cart(id: "oneweekgraphql") {
    id
    totalItems
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

You'll be surprised to find out it didn't quite work! The API returns an error with the message `Cannot return null for non-nullable field CartItem.unitTotal.`.

This means we forgot to implement `CartItem.unitTotal` and `CartItem.lineTotal`. It's an error that did not surfaced before because we didn't have a way to add new items, but now we do.

Let's fix it! We'll calculate the `amount` and `formatted` values in similar way to `Cart.subTotal`, using `currencyFormatter.format`.

```ts
const resolvers: Resolvers = {
  // ...
  CartItem: {
    unitTotal: (item) => {
      const amount = item.price;
      return {
        amount,
        formatted: currencyFormatter.format(amount / 100, {
          code: currencyCode,
        }),
      };
    },
    lineTotal: (item) => {
      const amount = item.quantity * item.price;

      return {
        amount,
        formatted: currencyFormatter.format(amount / 100, {
          code: currencyCode,
        }),
      };
    },
  },
  // ...
};
```

Now you should be able to run the `cart` query in the explorer and receive a (suceessful!) response similar to this:

```json
{
  "data": {
    "cart": {
      "id": "oneweekgraphql",
      "totalItems": 1,
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
