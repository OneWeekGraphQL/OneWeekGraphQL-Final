import { getCookie, setCookies } from "cookies-next";
import { IncomingMessage, ServerResponse } from "http";
import { NextApiRequestCookies } from "next/dist/server/api-utils";
import { v4 as uuid } from "uuid";
import { useGetCartQuery } from "../types";

export function useCart() {
  const cartId = String(getCookie("cartId"));
  const { data } = useGetCartQuery({ variables: { id: cartId } });
  return data?.cart;
}

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
