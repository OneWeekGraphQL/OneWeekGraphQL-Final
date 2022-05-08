import { getCookie } from "cookies-next";
import { Product } from "../lib/products";
import { GetCartDocument, useAddToCartMutation } from "../types";
import { ProductItem } from "./ProductItem";

export function ProductDetail({ product }: { product: Product | null }) {
  const cartId = String(getCookie("cartId"));
  const [addToCart, { loading }] = useAddToCartMutation({
    refetchQueries: [GetCartDocument],
  });
  if (!product) {
    return null;
  }
  return (
    <main className="grid grid-cols-4 h-[700px]">
      <div className="col-span-3 flex items-center justify-center">
        <ProductItem product={product} />
      </div>
      <form
        className="p-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          addToCart({
            variables: {
              input: {
                cartId,
                id: product.id,
                name: product.title,
                description: product.body,
                price: product.price,
                image: product.src,
              },
            },
          });
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: product.body }} />
        <button
          className="px-6 py-4 bg-black rounded w-full text-white hover:bg-white hover:text-black border border-black uppercase"
          type="submit"
        >
          {loading ? "Adding to cart..." : "Add to cart"}
        </button>
      </form>
    </main>
  );
}
