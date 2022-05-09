import Link from "next/link";
import { removeCookies } from "cookies-next";
import { ExclamationCircle } from "./ExclamationCircle";

export function CartError({ error }: { error: Error | undefined }) {
  if (!error) {
    return null;
  }
  return (
    <div className="bg-red-500 rounded p-4 text-white">
      <div className="flex gap-2 items-center">
        <ExclamationCircle />
        <div className="flex-1 flex justify-between items-center">
          {error.message}
          {error.message === "Cart is empty" ? (
            <Link href="/">
              <a className="border border-black p-1 px-2 rounded hover:bg-red-300">
                Keep browsing
              </a>
            </Link>
          ) : null}
          {error.message === "Invalid cart" ? (
            <button
              onClick={() => {
                removeCookies("cartId");
                window.location.reload();
              }}
              className="border border-black p-1 px-2 rounded hover:bg-red-300"
            >
              Empty cache and reload
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
