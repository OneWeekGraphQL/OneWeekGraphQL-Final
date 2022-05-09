import { useCart } from "../lib/cart.client";

export function ShoppingCartIcon() {
  const cart = useCart();
  return (
    <div className="relative group">
      {/* Outlined shopping cart icon */}
      {/* Courtesy of [heroicons](https://heroicons.com/) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 block group-hover:hidden"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      {/* Solid shopping cart icon */}
      {/* Also courtesy of [heroicons](https://heroicons.com/) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 hidden group-hover:block"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
      </svg>
      {/* Rounded black circle displaying total items as white text */}
      <span
        className="absolute bottom-0 left-0 rounded-full translate translate-y-[50%] translate-x-[-50%] inline-flex items-center justify-center px-[0.25rem] py-[0.125rem] text-xs bg-black text-white"
        style={{
          lineHeight: "0.75rem",
        }}
      >
        {cart?.totalItems ?? 0}
      </span>
    </div>
  );
}
