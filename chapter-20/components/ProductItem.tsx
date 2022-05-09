import Image from "next/image";
import { HTMLProps } from "react";
import { Product } from "../lib/products";

export function ProductItem({
  product: { price, src, title },
}: HTMLProps<HTMLDivElement> & {
  product: Product;
}) {
  return (
    <div className="relative flex items-center justify-center group overflow-clip p-4 w-full h-full">
      <div className="absolute top-0 left-0 z-10">
        <div className="bg-white border-black border-b p-2 text-2xl font-semibold">
          {title}
        </div>
        <div className="bg-white p-2 text-sm w-fit z-10">
          ${price / 100} USD
        </div>
      </div>
      <Image
        className="object-cover w-full h-full transform transition duration-500 motion-safe:group-focus:scale-110 motion-safe:group-hover:scale-110"
        src={src}
        alt={title}
        layout="fill"
        objectFit="cover"
      />
    </div>
  );
}
