# GetCart query and set cart id cookie

We will create an initial version of the cart page that displays number of items and subtotal.

To do this we will create a query to fetch cart information, and then keep track of users' carts across requests using HTTP cookies.

## GetCart query

Create a folder named `documents`. This is where we will store GraphQL documents, which can be either Mutations, Queries or Fragments.

Inside of this folder, create a file called `GetCart.graphql`.

It will import a Cart fragment and define a query that receives a variable called `id` with an `ID` type, asks for the top level `cart` field with the subfields defined by the `Cart` fragment.

```graphql
# import Cart from "./CartFragment"

query GetCart($id: ID!) {
  cart(id: $id) {
    ...Cart
  }
}
```

Next step is defining the `Cart` fragment on the `Cart` type. Create `documents/CartFragment.graphql` with the following content:

```graphql
fragment Cart on Cart {
  id
  totalItems
  subTotal {
    formatted
  }
  items {
    id
    name
    description
    image
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
}
```

In order to regenerate types, modify `codegen.yml` with a glob that defines where to get documents and add the `typescript-react-apollo` plugin.

In the `documents` key, replace `null` with `"**/*.graphql"`.

Inside the `generates/types.ts/plugins` array, add an item called `typescript-react-apollo`.

```yml
overwrite: true
schema: "schema.graphql"
documents: "**/*.graphql"
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
      - "typescript-react-apollo"
```

Now it's time to add the required dependencies.

Install React Apollo's GraphQL codegen with `npm add @graphql-codegen/typescript-react-apollo --save-dev`. This plugin generates React Apollo components and HOC with TypeScript typings. More info on [their website](https://www.graphql-code-generator.com/plugins/typescript-react-apollo)

Now install Apollo client by running `npm add @apollo/client --save`

Once it's finished installing, update `types.ts` by running `npm run codegen`. It will generate types and hooks based on the documents we defined earlier. Types like `CartFragment`, `GetCartQueryVariables`, `GetCartQuery`; and hooks like `useGetCartQuery` that use those types.

This is what `types.ts` should look like now:

```ts
// ...

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";

// ...

export type CartFragment = {
  // ...
};

export type GetCartQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type GetCartQuery = {
  // ...
};

// ....

export function useGetCartQuery(
  baseOptions: Apollo.QueryHookOptions<GetCartQuery, GetCartQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetCartQuery, GetCartQueryVariables>(
    GetCartDocument,
    options
  );
}

// ...
```

Let's create a handy helper called `useClient` that always returns the same instance of `ApolloClient`. It's important to initialize it once, and then call React's `useMemo` to return the same instance.

Import the required dependencies and add this hook to the end of `lib/client.ts`:

```ts
import { useMemo } from "react";
import { ApolloClient, InMemoryCache } from "@apollo/client";

// ...

export const useClient = () => {
  const client = useMemo(
    () =>
      new ApolloClient({
        uri: `${origin}/api`,
        cache: new InMemoryCache(),
      }),
    []
  );
  return client;
};
```

With `useClient` and `useGetCartQuery` we have the tools we need to fetch cart information on the cart page.

## Set cart id cookie

To make sure our server associates the same cart to every user's request, we will store their cart id inside an [HTTP cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies).

We will create a cart id on the users' first request, set a cookie with its value and then send it to the browser using the `cookies-next` library and its `setCookie` utility.

On subsequent requests, we will get that value using `getCookie` and send it as a prop to the Cart page.

Install `cookies-next` to handle cookies both on the browser and the server, and `uuid` to create unique ids. Run `npm add cookies-next uuid --save` to install the libraries and `npm add @types/uuid --save-dev` to install types for `uuid`.

Let's put the cart id cookie logic in a function called `getCartId`, inside a file called `lib/cart.client.ts` to differentiate it from the `lib/cart.ts` function that the server uses. We cannot put this cart cookie logic in `lib/cart.ts` because that file handles database connections, which would fail on the client.

This function will receive an object containing NextJs' request and response objects and pass them to `getCookie` and `setCookie`.

Take a look at the final result in:

```tsx
import { getCookie, setCookies } from "cookies-next";
import { IncomingMessage, ServerResponse } from "http";
import { NextApiRequestCookies } from "next/dist/server/api-utils";
import { v4 as uuid } from "uuid";

export function getCartId({
  req,
  res,
}: {
  req: IncomingMessage & {
    cookies: NextApiRequestCookies;
  };
  res: ServerResponse;
}) {
  let cartId = getCookie("cartId", { req, res });
  if (!cartId) {
    const id = uuid();
    setCookies("cartId", id, { req, res });
    cartId = id;
  }
  return String(cartId);
}
```

We have all the pieces to implement the cart page. Create the `pages/cart.tsx` file and import `getCartId`, `useClient`, and `useGetCartQuery`.

Let's define a component called `Cart`, which receives a `cartId` as prop and passes it as variable to `useGetCartQuery`. It's body will define a hierarchy of layout and child elements that display `data?.cart?.totalItems` and `data?.cart?.subTotal.formatted`.

To provide Cart with the same `cartId` across requests, define `getServerSideProps` and call the `getCartId` utility we defined earlier.

Finally define an IProps typescript interface with a `cartId` prop with a `string` type. Both `Cart` and `getServerSideProps` will receive this type to make sure they share the same `cartId` property.

```tsx
import type { GetServerSideProps, NextPage } from "next";
import { getCartId } from "../lib/cart.client";
import { useClient } from "../lib/client";
import { useGetCartQuery } from "../types";

const Cart: NextPage<IProps> = ({ cartId }) => {
  const client = useClient();
  const { data } = useGetCartQuery({ variables: { id: cartId }, client });
  return (
    <div className="min-h-screen flex flex-col">
      <main className="p-8 min-h-screen">
        <div className="mx-auto max-w-xl space-y-8">
          <h1 className="text-4xl">Cart</h1>
          <div>Items: {data?.cart?.totalItems}</div>
          <div className="border-t pt-4 flex justify-between">
            <div>Subtotal</div>
            <div>{data?.cart?.subTotal.formatted}</div>
          </div>
        </div>
      </main>
    </div>
  );
};

interface IProps {
  cartId: string;
}

export const getServerSideProps: GetServerSideProps<IProps> = async ({
  req,
  res,
}) => {
  const cartId = getCartId({ req, res });
  return { props: { cartId } };
};

export default Cart;
```

To see the final result, go to [http://localhost:3000/cart](http://localhost:3000/cart) to see your zero cart items that cost you a whooping $0.00.
