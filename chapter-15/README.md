# Setup Apollo Provider and display total items in header

You will display number of items in the app's header. To do this you will fetch cart and display `cart.totalItems` in a shopping cart SVG icon. This will call for a refactor that sets up Apollo Client in `ApolloProvider` instead of passing it as an argument to `useGetCartQuery`.

## Use cart helper and Apollo Provider

Let's create a helper function that gets the cart id cookie value, fetches a cart using the generated `useGetCartQuery` and returns it's value. We'll use this function in the shopping cart icon to display the number of items users currently have.

Modify `lib/cart.client.ts` with the following code:

```tsx
// ...
import { useGetCartQuery } from "../types";

export function useCart() {
  const cartId = String(getCookie("cartId"));
  const { data } = useGetCartQuery({ variables: { id: cartId } });
  return data?.cart;
}

// ...
```

Notice that `useGetCartQuery` does not receive a `client` argument, unlike the `useGetCartQuery` hook you added to `cart.tsx`. We could pass `client` to every hook on the application, but to avoid that repetition we'll setup `ApolloProvider` on `_app.tsx` so that every hook can get it from context.

Go to `_app.tsx` and wrap the app's top level `Component` with `ApolloProvider`, using the client returned from `useClient`.

```tsx
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ApolloProvider } from "@apollo/client";
import { useClient } from "../lib/client";

function MyApp({ Component, pageProps }: AppProps) {
  const client = useClient();
  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}

export default MyApp;
```

Now's a good time to simplify the code in `cart.tsx`. Delete the `useClient` import and remove it from `useGetCartQuery`, since it'll get access to the client implicitly.

```tsx
import type { GetServerSideProps, NextPage } from "next";
import { getCartId } from "../lib/cart.client";
import { useGetCartQuery } from "../types";

const Cart: NextPage<IProps> = ({ cartId }) => {
  const { data } = useGetCartQuery({ variables: { id: cartId } });
  return <div className="min-h-screen flex flex-col">{`// ...`}</div>;
};

// ...
```

## Display total items in shopping cart icon

Create a new top-level folder, name it `components`, and create a file called `Header.tsx` inside of it. It will have a component that will be reused in many pages across the app, but for now it will only be inside `/cart`.

The app's header component will serve two purposes. It will display a link to `/` and a shopping cart icon that shows the users their total cart items. This handy icon will also link to `/cart`.

```tsx
import Link from "next/link";
import { ShoppingCartIcon } from "./ShoppingCartIcon";

export function Header() {
  return (
    <nav className="flex items-center justify-between p-6 border-b border-neutral-700">
      <Link href="/">
        <a>
          <svg
            className="fill-current text-pink-500 hover:text-pink-400 h-7 mx-auto"
            viewBox="0 0 385 369"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g>
              <path d="m186.31 104.93v-69.39l-60.1-34.699973-60.1 34.699973v69.39l60.1 34.7z" />
              <path d="m252.42 219.44v-69.4l-60.1-34.7-60.1 34.7v69.4l60.1 34.7z" />
              <path d="m186.31 333.95v-69.4l-60.1-34.7-60.1 34.7v69.4l60.1 34.7z" />
              <path d="m120.2 219.44v-69.4l-60.1-34.7-60.1 34.7v69.4l60.1 34.7z" />
              <path d="m384.64 219.44v-69.4l-60.1-34.7-60.1 34.7v69.4l60.1 34.7z" />
              <path d="m318.53 104.93v-69.39l-60.1-34.699973-60.1 34.699973v69.39l60.1 34.7z" />
              <path d="m318.53 333.95v-69.4l-60.1-34.7-60.1 34.7v69.4l60.1 34.7z" />
            </g>
          </svg>
        </a>
      </Link>
      <Link href="/cart">
        <a className="">
          <ShoppingCartIcon />
        </a>
      </Link>
    </nav>
  );
}
```

Let's create and implement `components/ShoppingCartIcon.tsx`. It calls the `useCart` hook from `lib/cart.client.ts` and renders a cart svg.

The cart icon is an outlined shopping cart that display total items in white text. When users hover over it, it turns into a solid shopping cart icon.

We will get both solid and outlined cart icons from [heroicons](https://heroicons.com/), which offer a handy "Copy JSX" option. Both icons and a `span` that displays the number of cart items will be wrapped in a div with the `relative` and `group` tailwind CSS classes, which will serve as the foundation for the hover effect.

To get the hover effect, the outlined icon will have a `block` and a `group-hover:hidden` so that it's initially shown and hidden on hover. The opposite will happen to the solid cart icon, it will start `hidden` and have a `group-hover:block` class so it appears on hover.

A simple `span` will display `cart?.totalItems`. It will look like a circle, thanks to `rounded-full`, have some padding and white text. We will use `bottom-0`, `left-0` `translate-x` and `translate-y` so it's nicely positioned on the bottom left of the cart.

```tsx
import { useCart } from "../lib/cart.client";

export function ShoppingCartIcon() {
  const cart = useCart();
  return (
    <div className="relative group">
      {/* Outlined shopping cart icon */}
      {/* Courtesy of [heroicons](https://heroicons.com/) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 block group-hover:hidden"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      {/* Solid shopping cart icon */}
      {/* Also courtesy of [heroicons](https://heroicons.com/) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 hidden group-hover:block"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
      </svg>
      {/* Rounded black circle displaying total items as white text */}
      <span
        className="absolute bottom-0 left-0 rounded-full translate translate-y-[50%] translate-x-[-50%] inline-flex items-center justify-center px-[0.25rem] py-[0.125rem] text-xs bg-black text-white"
        style={{
          lineHeight: "0.75rem",
        }}
      >
        {cart?.totalItems ?? 0}
      </span>
    </div>
  );
}
```

Don't worry if the tailwind classes seem like dark magic. It would also have been the case with regular CSS. The most important thing in this case is to know the desired end result we want on the icon, and have fun playing around with them until you get there.

Feel free to comment parts of the component to see what changes and get a better feel of how the parts fit together. For example try commenting `lineHeight: "0.75rem",` to see what happens to that beautiful black circle.

Now that you implemented `Header` and it's children, you can add it to `cart.tsx`.

```tsx
// ...
import { Header } from "../components/Header";

const Cart: NextPage<IProps> = ({ cartId }) => {
  const { data } = useGetCartQuery({ variables: { id: cartId } });
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="p-8 min-h-screen">{`// ...`}</main>
    </div>
  );
};
// ...
```

Head over to `pages/index.tsx` and replace Hello World with the newly created `Header`.

```tsx
import type { NextPage } from "next";
import { Header } from "../components/Header";

const Home: NextPage = () => {
  return <Header />;
};

export default Home;
```

Go to [http://localhost:3000/cart](http://localhost:3000/cart) and check the cart is displaying correctly. Also try navigating between the home and cart pages with the header links.
