import prisma from "./prisma";

export async function findOrCreateCart(id: string) {
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
