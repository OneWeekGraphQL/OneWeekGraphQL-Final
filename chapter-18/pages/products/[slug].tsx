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
