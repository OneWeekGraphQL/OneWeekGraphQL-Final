# Create product grid

You will show a list of products on the home page. They will be displayed as a grid, have an optimized image and link to their respective product detail pages.

To achieve this, you will first create some basic components like `ProductItem`, `ProductLink` and `ProductList`. Since product images will play a key part, you will use NextJs optimized `Image` component.

## Create building blocks

The goal is to display each product's name and price on the top left of every item, and have their images at the center of every product. When users hover over them, the images will scale.

Create a file called `ProductItem.tsx` on the `components` folder. This component receives a single prop of type `Product`, the one defined in `lib/products.ts`.

It will contain three main children. One that displays the product title, another one that shows the price in USD, and the last one that displays a full sized image based on `product.src`.

```tsx
import Image from "next/image";
import { HTMLProps } from "react";
import { Product } from "../lib/products";

export function ProductItem({
  product: { price, src, title },
}: HTMLProps<HTMLDivElement> & {
  product: Product;
}) {
  return (
    <div className="relative flex items-center justify-center group overflow-clip p-4 w-full h-full">
      <div className="absolute top-0 left-0 z-10">
        <div className="bg-white border-black border-b p-2 text-2xl font-semibold">
          {title}
        </div>
        <div className="bg-white p-2 text-sm w-fit z-10">
          ${price / 100} USD
        </div>
      </div>
      <Image
        className="w-full h-full transform transition duration-500 motion-safe:group-focus:scale-110 motion-safe:group-hover:scale-110"
        src={src}
        alt={title}
        layout="fill"
        objectFit="cover"
      />
    </div>
  );
}
```

Create another component called `ProductList.tsx`. It will receive a prop called `products`, which is an array of the `Product` type. It maps over its products and displays a product link for every one of them. It also uses tailwind's responsive classes to be a one column grid by default, and a two column grid on medium sized devices and up.

This file defined an internal component called `ProductLink` that simply links to a product's detail page based on its slug.

```tsx
import Link from "next/link";
import { Product } from "../lib/products";
import { ProductItem } from "./ProductItem";

export function ProductList({ products }: { products: Product[] }) {
  return (
    <ul className="grid grid-flow-row-dense grid-cols-1 md:grid-cols-2">
      {products.map((product, index) => (
        <ProductLink key={index} product={product} />
      ))}
    </ul>
  );
}

export function ProductLink({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`} key={product.slug}>
      <a style={{ height: 500 }} className="bg-gray-400">
        <ProductItem product={product} />
      </a>
    </Link>
  );
}
```

## Optimized images in NextJs

Before importing the `ProductList` component in `pages/index.tsx`, you need to whitelist the domain that serves the product images. To do this, go to `next.config.js` and add set `images.domains` as ["burst.shopifycdn.com"].

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["burst.shopifycdn.com"],
  },
};

module.exports = nextConfig;
```

This domain is from the products dataset in `public/products.json`. NextJs' `Image` component requires external domains to be whitelisted for security reasons. If it allowed any domain to its image optimization API, it'd leave the door open for malicious attackers.

The `Image` component inside `ProductItem` provides several performance benefits compared to a barebones `img` tag, like:

- Size adapted per device
- Loaded when entering viewport
- Prevents layout shift

Read more [in NextJs image optimization docs](https://nextjs.org/docs/basic-features/image-optimization)

## Display products in home page

The final step is displaying the products list on the home page. This page will be prerendered at build time and it will display the first 6 products from our products dataset, using `ProductList`.

NextJs offers an intuitive API to [prerender pages at build time through `getStaticProps`](https://nextjs.org/docs/basic-features/data-fetching/get-static-props).

It even offers a way to type it with an exported type called `GetStaticProps`, which uses Typescript generics to specify the shape of the returning props. In our case, it will be a single prop called `products`.

Sharing types between page component and `getStaticProps` is possible using another exported NextJs type called `InferGetStaticPropsType`, which receives a `getStaticProps` function and infers its return types. We'll pass this inferred type to `NextPage` so that both the exported Home page and it's static props are nicely typed.

This is what `pages/index.tsx` looks like now:

```tsx
import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import { Header } from "../components/Header";
import { ProductList } from "../components/ProductList";
import { Product, products } from "../lib/products";

export const getStaticProps: GetStaticProps<{
  products: Product[];
}> = async () => ({
  props: {
    products: products.slice(0, 6),
  },
});

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  products,
}) => {
  return (
    <div>
      <Header />
      <main>
        <section>
          <ProductList products={products} />
        </section>
      </main>
    </div>
  );
};

export default Home;
```

Go to [http://localhost:3000](http://localhost:3000) to see the final result.
