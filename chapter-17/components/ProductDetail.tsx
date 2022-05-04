import { Product } from "../lib/products";
import { ProductItem } from "./ProductItem";

export function ProductDetail({ product }: { product: Product | null }) {
  if (!product) {
    return null;
  }
  return (
    <main className="grid grid-cols-4 h-[700px]">
      <div className="col-span-3 flex items-center justify-center">
        <ProductItem product={product} />
      </div>
      <div className="p-8 space-y-4">
        <div dangerouslySetInnerHTML={{ __html: product.body }} />
      </div>
    </main>
  );
}
