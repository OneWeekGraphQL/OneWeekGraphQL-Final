import type { GetServerSideProps, NextPage } from "next";
import { getCartId } from "../lib/cart.client";
import { useGetCartQuery } from "../types";
import { Header } from "../components/Header";

const Cart: NextPage<IProps> = ({ cartId }) => {
  const { data } = useGetCartQuery({ variables: { id: cartId } });
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
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
