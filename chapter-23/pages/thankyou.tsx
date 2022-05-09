import { removeCookies } from "cookies-next";
import { GetServerSideProps, NextPage } from "next";
import Router from "next/router";
import Stripe from "stripe";
import { CartDetail } from "../components/CartDetail";
import { Header } from "../components/Header";
import { stripe } from "../lib/stripe";
import { useGetCartQuery } from "../types";

const ThankYou: NextPage<IProps> = ({ session }) => {
  const { data } = useGetCartQuery({
    variables: { id: session?.metadata?.cartId! },
    skip: !session?.metadata?.cartId,
  });
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 grid grid-cols-2 mx-auto max-w-4xl space-y-8 min-h-full">
        <div className="border-r border-neutral-700 p-8 space-y-4">
          <h1 className="text-4xl">Thanks!</h1>
          <p>Your order is confirmed!</p>
          <p>You&apos;ll receive an email when it&apos;s ready.</p>
          <p>
            Want to start a new order?{" "}
            <button
              className="font-bold text-pink-400 hover:text-pink-500"
              onClick={() => {
                removeCookies("cartId");
                Router.push("/");
              }}
            >
              Click here.
            </button>
          </p>
        </div>
        <div className="p-8">
          <CartDetail isReadOnly cart={data?.cart} />
        </div>
      </main>
    </div>
  );
};

interface IProps {
  session: Stripe.Checkout.Session | null;
}

export const getServerSideProps: GetServerSideProps<IProps> = async ({
  query,
}) => {
  const sessionId = query.session_id;
  const session =
    typeof sessionId === "string"
      ? await stripe.checkout.sessions.retrieve(sessionId)
      : null;
  return { props: { session } };
};

export default ThankYou;
