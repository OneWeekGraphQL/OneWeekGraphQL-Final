import { CartFragment } from "../types";
import { CartItem } from "./CartItem";

export function CartDetail({
  cart,
}: {
  cart: CartFragment | null | undefined;
}) {
  return (
    <div>
      <div className={`space-y-8 relative`}>
        {cart?.items.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>
      <div className="border-t my-4 border-neutral-700 pt-4">
        <div className="flex justify-between">
          <div>Subtotal</div>
          <div>{cart?.subTotal.formatted}</div>
        </div>
      </div>
      <div className="border-t border-neutral-700 pt-4">
        <div className="flex justify-between font-bold">
          <div>Total</div>
          <div className="">{cart?.subTotal.formatted}</div>
        </div>
      </div>
    </div>
  );
}
