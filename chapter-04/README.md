# Install and configure GraphQL Code Generator

As we seen previously, the `resolvers` we defined aren’t type-safe, which often leads to bugs at runtime.

Now install and configure the [GraphQL Code Generator](https://www.graphql-code-generator.com/) to automatically create some types we can use throughout our project.

The GraphQL Code Generator works by invoking plugins across our defined file(s). We’ll be using the following plugins:

- `@graphql-codegen/typescript`
- `@graphql-codegen/typescript-resolvers`

We'll need to add further plugins later when we build the frontend. Let’s use the initialization wizard to generate a config file.

At the terminal, run the following:

```bash
npx graphql-code-generator init
```

The wizard will ask us a bit more about our application:

- **What type of application are you building?** — `Backend - API or Server`

- **Where is your schema?** — `schema.graphql`

- **Pick plugins** — `TypeScript, TypeScript Resolvers`

- **Where to write the output** — `types.ts`

- **Do you want to generate an introspection file?** — `No`

- **How to name the config file?** — `codegen.yml`

- **What script in package.json should run the codegen?** — `codegen`

Once you provide the answers to all of these questions, you should see the new file `codegen.yml` in the root of your project, and `codegen` inside of `scripts` and some new `devDependencies` within `package.json`.

If you open `codegen.yml` it should look something like:

```yaml
overwrite: true
schema: schema.graphql
documents: null
generates:
  types.ts:
    plugins:
      - "typescript"
      - "typescript-resolvers"
```

Before we continue, let's install the dependencies we configured.

```bash
npm install
```

Now invoke the `codegen` script to generate our `types.ts` file.

At the command line, run the following:

```bash
npm run codegen
```

You should now see the file `types.ts` in the root of the project.

<details>
  <summary>Preview file contents</summary>
    
```tsx
import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Cart = {
  __typename?: 'Cart';
  id: Scalars['ID'];
  totalItems: Scalars['Int'];
};

export type Query = {
  __typename?: 'Query';
  cart?: Maybe<Cart>;
};


export type QueryCartArgs = {
  id: Scalars['ID'];
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Cart: ResolverTypeWrapper<Cart>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean'];
  Cart: Cart;
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  Query: {};
  String: Scalars['String'];
};

export type CartResolvers<ContextType = any, ParentType extends ResolversParentTypes['Cart'] = ResolversParentTypes['Cart']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  totalItems?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  cart?: Resolver<Maybe<ResolversTypes['Cart']>, ParentType, ContextType, RequireFields<QueryCartArgs, 'id'>>;
};

export type Resolvers<ContextType = any> = {
  Cart?: CartResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
};
```
</details>    

If you inspect this file closely, you’ll see all of the types generated for our GraphQL schema, as well as the `resolvers`.

You should see the following `type Resolvers`:

```tsx
export type Resolvers<ContextType = any> = {
  Cart?: CartResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
};
```

⚠️ You’ll notice the use of `any` for the `ContextType` above. We’ll fix this later when we define our server context.

We’ll now update `pages/api/index.ts` to import this type:

```tsx
import { Resolvers } from "../../types";
```

Then update the `resolvers` object to use `Resolvers` as its type:

```tsx
const resolvers: Resolvers = {
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

You will now see the TypeScript warnings are gone! 🥳

That’s all that we need from GraphQL Code Generator for now. We’ll see how something as simple as typing the resolvers benefits us when we add more to our schema and resolvers, later.
