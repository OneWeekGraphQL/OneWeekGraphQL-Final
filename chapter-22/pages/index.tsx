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
