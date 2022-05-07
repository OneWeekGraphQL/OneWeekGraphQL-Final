import Link from "next/link";
import { ShoppingCartIcon } from "./ShoppingCartIcon";

export function Header() {
  return (
    <nav className="flex items-center justify-between p-6 border-b border-neutral-700">
      <Link href="/">
        <a>
          <svg
            className="fill-current text-pink-500 hover:text-pink-400 h-7 mx-auto"
            viewBox="0 0 385 369"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g>
              <path d="m186.31 104.93v-69.39l-60.1-34.699973-60.1 34.699973v69.39l60.1 34.7z" />
              <path d="m252.42 219.44v-69.4l-60.1-34.7-60.1 34.7v69.4l60.1 34.7z" />
              <path d="m186.31 333.95v-69.4l-60.1-34.7-60.1 34.7v69.4l60.1 34.7z" />
              <path d="m120.2 219.44v-69.4l-60.1-34.7-60.1 34.7v69.4l60.1 34.7z" />
              <path d="m384.64 219.44v-69.4l-60.1-34.7-60.1 34.7v69.4l60.1 34.7z" />
              <path d="m318.53 104.93v-69.39l-60.1-34.699973-60.1 34.699973v69.39l60.1 34.7z" />
              <path d="m318.53 333.95v-69.4l-60.1-34.7-60.1 34.7v69.4l60.1 34.7z" />
            </g>
          </svg>
        </a>
      </Link>
      <Link href="/cart">
        <a className="">
          <ShoppingCartIcon />
        </a>
      </Link>
    </nav>
  );
}
