# Install and configure Tailwind CSS

We’ll be using Tailwind CSS to style our storefront. Let’s begin by installing the required development dependencies (using the flag `-D` below), and configuring PostCSS.

Inside the terminal, run the following:

```bash
npm install -D tailwindcss autoprefixer postcss
```

We’ll now need to generate the files `tailwind.config.js` and `postcss.config.js` where we can customize the config for the newly installed dependencies.

Inside the terminal, run the following:

```bash
npx tailwindcss init -p
```

You will now see both files in the root of the project.

Open `tailwind.config.js` and configure the template paths using the `content` array:

```jsx
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

Finally, inside `pages/_app.tsx` add the following import at the top:

```tsx
import "tailwindcss/tailwind.css";
```

Your `pages/_app.tsx` should look something like this:

```tsx
import "tailwindcss/tailwind.css";
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
```

Now let’s add a Tailwind class to our homepage `h1`. Inside `pages/index.tsx` update the `h1` to include the following `className`:

```tsx
import type { NextPage } from "next";

const Home: NextPage = () => {
  return <h1 className="text-purple-500 text-xl">Hello world</h1>;
};

export default Home;
```

Finally, let’s start the Next.js app and see our styled `h1` at `http://localhost:3000`:

```bash
npm run dev
```
