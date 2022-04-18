# Install and configure Prisma

We’ll be using [Prisma](https://www.prisma.io/) as our database ORM inside of our GraphQL resolvers. Prisma generates a “client” that we can use inside of our queries, and mutations to talk to our database.

We’ll be using 2 Prisma dependencies, for code generation, and use inside of our resolvers:

- `prisma`
- `@prisma/client`

At the terminal, run the following:

```bash
npm install -E -D prisma
npm install -E @prisma/client
```

Once installed, let’s run the Prisma `init`command to get started.

At the terminal, run the following:

```bash
npx prisma init
```

This will generate the file `prisma/schema.prisma`, and `.env` with some boilerplate.

Before we continue, let’s update `package.json` to include a script to run the `prisma generate` command.

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "codegen": "graphql-codegen --config codegen.yml",
  "db:generate": "prisma generate"
}
```

We’ll next update `.env` to include the value of `DATABASE_URL` that points to our Docker instance we setup previously:

```bash
DATABASE_URL="mysql://root:password@localhost:3307/mydb"
```

Instead of the default `postgresql` database provider, we’ll use `mysql`. Inside `prisma/schema.prisma` update the `datasource` `provider`:

```tsx
generator client {
  provider        = "prisma-client-js"
}

datasource db {
  provider             = "mysql"
  url                  = env("DATABASE_URL")
}
```

Now we’ll create an instance of `PrismaClient` that we’ll be able to use inside of our GraphQL API. In development we can exhaust our database connection limit very easily with reloading so we’ll attach it to a global object.

Create the file `lib/prisma.ts` and add the following:

```tsx
import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}
export default prisma;
```

Now we’ll hook up Prisma with our GraphQL server context. Inside `pages/api/index.ts` go ahead and import the Prisma client we exported from `lib/prisma.ts` and the type `PrismaClient` from the `@prisma/client`:

```tsx
import type { PrismaClient } from "@prisma/client";

import prisma from "../../lib/prisma";
```

Then define a new `type` for `GraphQLContext`:

```tsx
export type GraphQLContext = {
  prisma: PrismaClient;
};
```

We should now update `codegen.yml` to point the `contextType` to our newly defined `GraphQLContext` type.

Inside of `codegen.yml` add a block for `config` under `types.ts` to the exported type:

```yaml
overwrite: true
schema: "schema.graphql"
documents: null
generates:
  types.ts:
    config:
      contextType: ./pages/api/index#GraphQLContext
    plugins:
      - "typescript"
      - "typescript-resolvers"
```

Now if we run the `codegen` script we will have updated resolver context.

At the terminal, run the following:

```bash
npm run codegen
```

You’ll now see inside of `types.ts` that the type for `Resolvers` has been updated to include the `GraphQLContext`:

```tsx
import { GraphQLContext } from "./pages/api/index";

// ...

export type Resolvers<ContextType = GraphQLContext> = {
  Cart?: CartResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
};
```

Now inside of our resolvers we have fully typed `context`.

Before we continue, let’s create a function `createServer` object, and pass it along to `createServer`:

```tsx
export async function createContext(): Promise<GraphQLContext> {
  return {
    prisma,
  };
}

const server = createServer({
  cors: false,
  endpoint: "/api",
  logging: {
    prettyLog: false,
  },
  schema: {
    typeDefs,
    resolvers,
  },
  context: createContext(),
});
```

At this point we’ve not created any models inside `prisma/schema.prisma` so running the script `db:generate` will not do anything. We’ll fix this next.
