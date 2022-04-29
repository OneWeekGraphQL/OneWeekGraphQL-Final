# Create schema and resolver for fetching a cart by ID

We’ll create the API for querying carts in 4 steps;

1. Define GraphQL schema
2. Define Prisma schema
3. Migrate database
4. Define GraphQL resolver

Earlier when we setup GraphQL Yoga, we defined a basic GraphQL schema for Cart that looks like this:

```graphql
type Query {
  cart(id: ID!): Cart
}

type Cart {
  id: ID!
  totalItems: Int!
}
```

However this doesn’t include the `items` or `subTotal` a typical shopping cart would want to store.

We’ll update the `Cart` type to include an array of `CartItem`'s as well as `subTotal` that is of type `Money!`.

## GraphQL Schema

Inside `schema.graphql`, update the `type Cart` to:

```graphql
type Cart {
  id: ID!
  totalItems: Int!
  items: [CartItem!]!
  subTotal: Money!
}
```

Next, we’ll create a `Money` type as we’ll want to use this for both `Cart` and `CartItem` types inside the same `schema.graphql` file. The `Money` type will contain a `formatted` string, and `amount` integer.

```graphql
type Money {
  formatted: String!
  amount: Int!
}
```

Now all that’s left to do is define the `CartItem` type, which has fields for:

- `id`
- `name`
- `description`
- `unitTotal`
- `lineTotal`
- `quantity`
- `image`

Not all of these will be stored in the database as we can compute them within GraphQL. Field such as `unitTotal`, and `lineTotal` can be made up from the `quantity` field, and a private `price` field we’ll store in the database.

Inside `schema.graphql` we can define the following for `CartItem`:

```graphql
type CartItem {
  id: ID!
  name: String!
  description: String
  unitTotal: Money!
  lineTotal: Money!
  quantity: Int!
  image: String
}
```

Now that our schema is defined, we can now move onto creating the Prisma schema that manages how our database is structured.

## Prisma Schema

Inside `prisma/schema.prisma` let’s now add our first model for `Cart`:

```
model Cart {
  id    String     @id @default(uuid())
  items CartItem[]
}
```

The `Cart`'s `id` will have a default value of a new UUID when a new row is inserted. You’ll notice here we don’t have a field for `totalItems` or `subTotal`. This is because these will be computed fields.

We’ll now define the `CartItem` model with some fields that are different to our GraphQL schema. This is because we can compute the values of both `unitTotal`, and `lineTotal` as mentioned previously.

We’ll also set a default value for the `id` field, and create a relation to `cart` using the field `cartId`.

```
model CartItem {
  id          String  @default(uuid())
  name        String
  description String?
  price       Float
  quantity    Int
  image       String?
  cartId      String
  cart        Cart    @relation(fields: [cartId], references: [id], onDelete: Cascade)

  @@id([id, cartId])
}
```

We’ve also scoped the `id` to be unique for each cart by setting `@@id([id, cartId])`.

We will now generate the Prisma Client library based on the updated models.

At the command line, run the following:

```bash
npm run generate
```

You should now see output similar to the following:

```bash
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (3.9.2 | library) to ./node_modules/@prisma/client in 316ms
You can now start using Prisma Client in your code. Reference: https://pris.ly/d/client

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
```

We’ll next update `codegen.yml` to map our GraphQL types to Prisma so our resolvers are type-safe. We’ll also prefix our database types with `Model` so they don’t clash with our GraphQL types.

Inside `codegen.yml` under the `config` section, add the following:

```yaml
mapperTypeSuffix: Model
mappers:
  Cart: "@prisma/client#Cart"
  CartItem: "@prisma/client#CartItem"
```

The file should now look something like:

```yaml
overwrite: true
schema: "schema.graphql"
documents: null
generates:
  types.ts:
    config:
      contextType: ./pages/api/index#GraphQLContext
      mapperTypeSuffix: Model
      mappers:
        Cart: "@prisma/client#Cart"
        CartItem: "@prisma/client#CartItem"
    plugins:
      - "typescript"
      - "typescript-operations"
      - "typescript-resolvers"
```

Now we can run the GraphQL Code Generator to update and overwrite `types.ts.`

At the command line, run the following:

```bash
npm run codegen
```

If you open `types.ts` you should see the following import at the top of the file:

```tsx
import { Cart as CartModel, CartItem as CartItemModel } from "@prisma/client";
```

If you search for `CartModel` or `CartItemModel` inside of this field, you should find `ResolversTypes`:

```tsx
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars["Boolean"]>;
  Cart: ResolverTypeWrapper<CartModel>;
  CartItem: ResolverTypeWrapper<CartItemModel>;
  ID: ResolverTypeWrapper<Scalars["ID"]>;
  Int: ResolverTypeWrapper<Scalars["Int"]>;
  Money: ResolverTypeWrapper<Money>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars["String"]>;
};
```

This confirms we’ve automatically generated the types for our resolver type, and can now make use of these when implementing the resolver for the `cart` query.

## Migrate database

We defined a Prisma schema and generated a client based on it, but before we use the client on our API we need our database schema to reflect our Prisma data model.

Prisma provides a tool to automatically generate database migrations called [Prisma Migrate](https://www.prisma.io/migrate). It’s a declarative way of defining what your database should look like, as opposed to how to get from state A to state B, which is how the native imperative SQL migrations work.

Calling `prisma migrate dev` will create a SQL migration based on our Prisma schema, apply it to the database and generate our Prisma client.

This is a handy command that we’ll use a lot in development, so let’s add it to our `package.json` scripts.

This is how `package.json` scripts should look like now:

```json
"scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "codegen": "graphql-codegen --config codegen.yml",
    "generate": "prisma generate",
    "db:migrate": "prisma migrate dev"
  },
```

Call `npm run db:migrate` to generate a file called migration.sql inside `prisma/migration/{timestamp}` and apply it to our database.

👉 We’ll call this command every time we make changes to our Prisma schema and want to reflect them in our database.

## GraphQL Resolvers

We’ll now create the resolvers for the cart query.

Inside `pages/api/index.ts` we’ll update the resolver for `Query.cart` to fetch or create a cart by `id`.

```tsx
const resolvers = {
  // ...
  Query: {
    cart: async (_, { id }, { prisma }) => {
      let cart = await prisma.cart.findUnique({
        where: { id },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { id },
        });
      }

      return cart;
    },
  },
};
```

Since we only store in the database the `id`, and the related `items` for a cart, we’ll need to define the root resolvers for fields `items`, `totalItems`, and `subTotal`.

Inside the `resolvers` map, we can create a new resolver map for `Cart`, and the fields above.

For `items`, we’ll use the special `findUnique` method from Prisma that handles any n+1 queries — [learn more](https://www.prisma.io/docs/guides/performance-and-optimization/query-optimization-performance#solving-n1-in-graphql-with-findunique-and-prismas-dataloader).

```tsx
const resolvers: Resolvers = {
  // ...
  Cart: {
    items: async ({ id }, _, { prisma }) => {
      const items = await prisma.cart
        .findUnique({
          where: { id },
        })
        .items();

      return items;
    },
  },
};
```

Now for `totalItems` we’ll do something similar to the above, but use a `reduce` function to return an integer calculated using the `item.quantity`:

```tsx
const resolvers: Resolvers = {
  // ...
  totalItems: async ({ id }, _, { prisma }) => {
    const items = await prisma.cart
      .findUnique({
        where: { id },
      })
      .items();

    return items.reduce((total, item) => total + item.quantity || 1, 0);
  },
};
```

Finally we can now return the `subTotal`. For this we’ll use the `findUnique` method from Prisma to fetch our items by `id` of the parent cart. Then we will return a new object that matches the type for `Money`:

```graphql
type Money {
  formatted: String!
  amount: Int!
}
```

So that we can create a formatted string, we’ll use the NPM package `currency-formatter` (and it’s Definitely Typed accompanying package), and pass it a currency code. In this case, we’ll use the currency code `USD` throughout the rest of our application.

At the command line, run the following:

```bash
npm install -E currency-formatter
npm install -E -D @types/currency-formatter
```

Then inside of `pages/api/index.ts` add the following:

```tsx
import currencyFormatter from "currency-formatter";

const currencyCode = "USD";
```

We’ll first calculate `amount` by using a `reduce` function to return the amount value. If there are no items, we’ll return `0`.

```tsx
const amount =
  items.reduce((acc, item) => acc + item.price * item.quantity, 0) ?? 0;
```

To generate the `formatted` value, we can use the amount, and the currency code `USD`:

```tsx
currencyFormatter.format(amount / 100, {
  code: currencyCode,
}),
```

If we put all of this together with our `findUnique` function, we should have something like this inside of our root resolver for `Cart.subTotal`:

```tsx
const resolvers: Resolvers = {
  // ...
  subTotal: async ({ id }, _, { prisma }) => {
    const items = await prisma.cart
      .findUnique({
        where: { id },
      })
      .items();

    const amount =
      items.reduce((acc, item) => acc + item.price * item.quantity, 0) ?? 0;

    return {
      amount,
      formatted: currencyFormatter.format(amount / 100, {
        code: currencyCode,
      }),
    };
  },
};
```
