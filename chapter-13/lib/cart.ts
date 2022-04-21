import { PrismaClient, CartItem } from "@prisma/client";
import { Stripe } from "stripe";
import { Product } from "./products";

export async function findOrCreateCart(prisma: PrismaClient, id: string) {
  let cart = await prisma.cart.findUnique({
    where: { id },
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { id },
    });
  }
  return cart;
}

/**
 * Verifies that the cart items are valid and formats them for Stripe.checkout
 *
 * An item is valid if:
 * - Id matches a product in our inventory
 * - Price hasn't been tampered with. This is why we use the price from our inventory
 */
export function validateCartItems(
  inventory: Product[],
  cartItems: CartItem[]
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const checkoutItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  for (const item of cartItems) {
    const product = inventory.find(({ id }) => id === item.id);
    if (!product) {
      throw new Error(`Item with id ${item.id} is not on the inventory`);
    }
    checkoutItems.push({
      quantity: item.quantity,
      price_data: {
        currency: "USD",
        unit_amount: product.price,
        product_data: {
          name: item.name,
          description: item.description || undefined,
          images: item.image ? [item.image] : [],
        },
      },
    });
  }

  return checkoutItems;
}
