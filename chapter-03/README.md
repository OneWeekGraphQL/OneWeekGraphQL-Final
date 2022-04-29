# Install GraphQL Yoga, and configure API route

We’re now ready to create our first API route with Next.js — we’ll be using this as a GraphQL endpoint that powers our entire frontend.

To do this, we’ll be using [GraphQL Yoga](https://graphql-yoga.com/). A fully-featured GraphQL server with support for subscriptions over HTTP (Server Sent Events), Uploads, and more, built by [The Guild](https://www.the-guild.dev/).

⚠️ At the time of writing this, GraphQL Yoga is in beta. You’ll need to use the `@beta` version when installing.

As well as installing GraphQL Yoga, we’ll need to install the peer dependency `graphql`.

At the command line, run the following:

```bash
npm install -E @graphql-yoga/node@beta graphql
```

Now inside of `pages/api` you’ll want to rename `hello.ts` to `index.ts`. You could be explicit and name this `graphql.ts` but we’ll keep it simple for now.

Replace the contents of `pages/api/index.ts` with the following:

```tsx
import { createServer } from "@graphql-yoga/node";

const server = createServer({
  endpoint: "/api",
});

export default server.requestListener;
```

You’ll notice above we’re exporting `const config`. We’ll defer to GraphQL Yoga for handling our requests, so we’ll disable `bodyParser`, and set `externalResolver` to true. This tells Next.js that this route is being by an external resolver.

## Schema

Now we’ll create a `schema` we can pass to `createServer`.

In the root of the project, create the file `schema.graphql`. We’ll use the SDL-first approach to define our schema.

At the command line, run the following:

```bash
touch schema.graphql
```

Inside `schema.graphql`, add the following:

```bash
type Query {
  cart(id: ID!): Cart
}

type Cart {
  id: ID!
  totalItems: Int!
}
```

We’ll add more to this later, but now next let’s import, and define a resolver for the `cart` query.

Inside `pages/api/index.ts` add the following imports:

```bash
import { join } from "path";
import { readFileSync } from "fs";
```

Then above where we define our `server`, create the const `typeDefs` that reads the file `schema.graphql`:

```tsx
const typeDefs = readFileSync(join(process.cwd(), "schema.graphql"), {
  encoding: "utf-8",
});
```

⚠️ We need to use `process.cwd()` instead of `__dirname` due to how Vercel works — [learn more](https://nextjs.org/docs/api-reference/data-fetching/get-static-props#reading-files-use-processcwd).

Now we’ll define a resolver for our `cart` query. Below `typeDefs`, create a new const `resolvers`:

```tsx
const resolvers = {
  Query: {
    cart: (_, { id }) => {
      return {
        id,
        totalItems: 0,
      };
    },
  },
};
```

We’ll destructure `id` from the 2nd argument for the `cart` resolver, and then return an object that matches the type defined in our `schema.graphql`.

👀 _You’ll notice we have no type safety on the above resolvers. TypeScript is warning us about the implicit `any` type. We’ll fix that with the GraphQL Code Generator next._

You can now pass `typeDefs`, and `resolvers` to `schema` inside of `createServer`:

```tsx
const server = createServer({
  endpoint: "/api",
  schema: {
    typeDefs,
    resolvers,
  },
});
```

Finally, we can visit [http://localhost:3000/api](http://localhost:3000/api) to run an example query, and check our resolver returns as expected.

Execute the following query:

```graphql
{
  cart(id: "oneweekgraphql") {
    id
    totalItems
  }
}
```

If we did everything correctly, you should see a response containing the `id` you passed, as well as the `totalItems` as `0`:

```json
{
  "data": {
    "cart": {
      "id": "oneweekgraphql",
      "totalItems": 0
    }
  }
}
```
