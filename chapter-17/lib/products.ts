// https://github.com/shopifypartners/product-csvs/blob/master/apparel.csv
import apparel from "../public/apparel.json";

export type Product = {
  id: string;
  slug: string;
  title: string;
  price: number;
  src: string;
  body: string;
};

export const products: Product[] = apparel
  .filter((product) => Boolean(product["Image Src"]))
  .map((product) => ({
    id: product.id,
    price: product["Variant Price"],
    title: product.Title,
    src: product["Image Src"],
    slug: product.Handle,
    body: product["Body (HTML)"],
  }));
