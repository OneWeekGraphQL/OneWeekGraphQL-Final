import Image from "next/image";
import {
  CartItem,
  GetCartDocument,
  useDecreaseCartItemMutation,
  useIncreaseCartItemMutation,
  useRemoveFromCartMutation,
} from "../types";
import { CloseIcon } from "./CloseIcon";
import { MinusIcon } from "./MinusIcon";
import { PlusIcon } from "./PlusIcon";

export function CartItem({ item, cartId }: { item: CartItem; cartId: string }) {
  const [increaseCartItem, { loading: increasingCartItem }] =
    useIncreaseCartItemMutation({
      refetchQueries: [GetCartDocument],
    });
  const [decreaseCartItem, { loading: decreasingCartItem }] =
    useDecreaseCartItemMutation({
      refetchQueries: [GetCartDocument],
    });
  const [removeFromCart, { loading: removingFromCart }] =
    useRemoveFromCartMutation({
      refetchQueries: [GetCartDocument],
    });
  return (
    <div className="space-y-2">
      <div className="flex gap-4">
        <Image
          src={item.image || ""}
          width={75}
          height={75}
          alt={item.name}
          objectFit="cover"
        />
        <div className="flex justify-between items-baseline flex-1 gap-2">
          <span className="text-lg">{item.name}</span>
          <span className="text-sm font-light">{item.unitTotal.formatted}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() =>
            removeFromCart({
              variables: { input: { id: item.id, cartId } },
            })
          }
          disabled={removingFromCart}
          className="p-1 font-light border border-neutral-700  hover:bg-black hover:text-white"
        >
          <CloseIcon />
        </button>
        <div className="flex-1 flex">
          <div className="px-2 py-1 font-light border border-neutral-700 flex-1">
            {item.quantity}
          </div>
          <button
            onClick={() =>
              decreaseCartItem({
                variables: { input: { id: item.id, cartId } },
              })
            }
            disabled={decreasingCartItem}
            className="p-1 font-light border border-neutral-700  hover:bg-black hover:text-white"
          >
            <MinusIcon />
          </button>
          <button
            onClick={() =>
              increaseCartItem({
                variables: { input: { id: item.id, cartId } },
              })
            }
            disabled={increasingCartItem}
            className="p-1 font-light border border-neutral-700  hover:bg-black hover:text-white"
          >
            <PlusIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
