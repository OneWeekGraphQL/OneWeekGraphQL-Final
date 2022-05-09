# Product detail page

The product detail page displays same product item from landing but bigger and with the product description on the right. You will create a product item component that takes care of this functionality.

In the product detail page, you will use two NextJs features that go well together, which are dynamic routes and server side rendering.

## Product detail component

The product detail component will composing together `components/ProductItem` with the product body as HTML.

This component receives a `product` prop. It passes that property to `ProductItem` and displays the product body in a `div` element, using `dangerouslySetInnerHTML`. Despite its scary name, the HTML we pass to it is not dangerous since we have full control over it. It would be dangerous if the HTML came from user defined input.

You will use tailwind's `grid` classes to make the product item cover 3/4 of the screen, and have the description cover the rest.

```tsx
import { Product } from "../lib/products";
import { ProductItem } from "./ProductItem";

export function ProductDetail({ product }: { product: Product | null }) {
  if (!product) {
    return null;
  }
  return (
    <main className="grid grid-cols-4 h-[700px]">
      <div className="col-span-3 flex items-center justify-center">
        <ProductItem product={product} />
      </div>
      <div className="p-8 space-y-4">
        <div dangerouslySetInnerHTML={{ __html: product.body }} />
      </div>
    </main>
  );
}
```

## Product details page

The main job of the product details page is getting the product slug from the page URL, using it to fetch a product from the products list, and passing it to the `ProductDetail` component you implemented on the previous step.

Create a file called `[slug].tsx` on the `pages` folder. Notice the square brackets in the file's name, that's because it uses [NextJs dynamic routes](https://nextjs.org/docs/routing/dynamic-routes) to define product slug as a URL parameter. NextJs will store the slug value in `query.slug`.

To prerender the page on the server side, this file will implement [NextJs server side rendering](https://nextjs.org/docs/basic-features/data-fetching/get-server-side-props) by exporting a function called `getServerSideProps`. In every request, NextJs prerenders pages that export this function, passing them the appropriate props.

This is what the product detail page looks like:

```tsx
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { Header } from "../../components/Header";
import { ProductDetail } from "../../components/ProductDetail";
import { Product, products } from "../../lib/products";

const ProductPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ product }) => (
  <div>
    <Header />
    <ProductDetail product={product} />
  </div>
);

export const getServerSideProps: GetServerSideProps<{
  product: Product | null;
}> = async ({ req, res, query }) => {
  const product =
    products.find((product) => product.slug === query.slug) || null;
  return { props: { product } };
};

export default ProductPage;
```

Now you can navigate from [http://localhost:3000](http://localhost:3000) to each product's detail page.
