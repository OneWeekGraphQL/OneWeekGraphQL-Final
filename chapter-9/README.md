# Create schema and resolver for removing cart items

Have you ever added something to your cart, only to feel a little bit of guilty later and finally remove it? Hmmm oh, yeah, no, me neither.

Let's add to our API a way for consumers to remove items from their carts.

At this point you're familiar with the approach we'll take:

1. Modify GraphQL Schema
2. Generate types
3. Add resolver
4. Try mutation in the explorer

## Add remove item mutation to schema

Add a mutation called `removeItem`. It will receive a required input called `RemoveFromCartInput` and return a `Cart`.

You also need to define this new input type. It contains two required fields, called `id` and `cartId`. They identify which item to remove, from which cart. Both have an `ID` type.

The `schema.graphql` file should look a bit like this:

```graphql
type Mutation {
  # ...
  removeItem(input: RemoveFromCartInput!): Cart
}

# ...

input RemoveFromCartInput {
  id: ID!
  cartId: ID!
}
```

## Regenerate types

Let's generate new types based on our modified schema.

Running `npm run generate` will generate the following output on the console.

```sh
npm run codegen

> graphql-codegen --config codegen.yml

✔ Parse configuration
✔ Generate outputs
```

Based on the configuration in `codegen.yml` it regenerated `types.ts`.

Open the modified types file to check what the command added.

It added a new property called `removeItem` to the `Mutation` type, to reflect our schema's mutation type. It also added that property to `MutationResolvers`, along with its parent, context, response and argument types.

```ts
export type Mutation = {
  // ...
  removeItem?: Maybe<Cart>;
};

export type MutationRemoveItemArgs = {
  input: RemoveFromCartInput;
};

export type RemoveFromCartInput = {
  cartId: Scalars["ID"];
  id: Scalars["ID"];
};

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  // ...
  RemoveFromCartInput: RemoveFromCartInput;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  // ...
  RemoveFromCartInput: RemoveFromCartInput;
};

export type MutationResolvers<
  ContextType = GraphQLContext,
  ParentType extends ResolversParentTypes["Mutation"] = ResolversParentTypes["Mutation"]
> = {
  // ...
  removeItem?: Resolver<
    Maybe<ResolversTypes["Cart"]>,
    ParentType,
    ContextType,
    RequireFields<MutationRemoveItemArgs, "input">
  >;
};
```

## Create remove item resolver

Now that types are in sync with the schema, we can add the new mutation to our API.

Add the new `removeItem` mutation to `pages/api/index.ts` resolvers, right below `addItem`.

Inside its body, call `prisma.cartItem.delete` with values from `input` so it deletes the correct cart item. We only need `cartItem.cartId` out of this mutation, so be sure to add it as a property of prisma SDK's `select`.

Finally return `findOrCreateCart` with the `cartId` from the previous line.

```ts
const resolvers: Resolvers = {
  // ...
  Mutation: {
    // ...
    removeItem: async (_, { input }) => {
      const { cartId } = await prisma.cartItem.delete({
        where: { id_cartId: { id: input.id, cartId: input.cartId } },
        select: {
          cartId: true,
        },
      });
      return findOrCreateCart(cartId);
    },
  },
  // ...
};
```

## Try new mutation in explorer

To verify API consumers can remove items from carts, navigate to [http://localhost:3000/api](http://localhost:3000/api) and run the following query.

```graphql
mutation {
  removeItem(input: { cartId: "oneweekgraphql", id: "1" }) {
    id
    totalItems
  }
}
```

If things went right, you should see a JSON response similar to this:

```json
{
  "data": {
    "removeItem": {
      "id": "oneweekgraphql",
      "totalItems": 0
    }
  }
}
```
