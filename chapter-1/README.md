# Creating a new Next.js app

We’ll begin by creating a new Next.js project using the `create-next-app` CLI tool. The Next.js app will power both our frontend, and GraphQL endpoint.

We’ll name our application `oneweekgraphql` (or choose your own name), and pass the flag `--ts` to enable TypeScript.

At the command line, run the following:

```bash
npx create-next-app@latest oneweekgraphql --ts --use-npm
```

*You’ll be prompted to install the NPX command if you haven’t ran it recently.*

Next we’ll “change directory” into our newly created project.

At the command line, run the following:

```bash
cd oneweekgraphql
```

We’ll not be using any of the generated Next.js code for styles, or pages, so we can go ahead and remove any traces of those.

Inside `pages/_app.tsx` you will want to remove the `import` for the `globals.css` file.

Now inside of `pages/index.tsx`, replace the contexts with:

```tsx
import type { NextPage } from "next";

const Home: NextPage = () => {
  return <h1>Hello world</h1>;
};

export default Home;
```

Since we’re no longer using the imported styles, we can now delete the `styles` folder from the root of our project.

Finally, we’ll create a folder for future components we’ll use to build our storefront. 

At the command line, run the following:

```bash
mkdir components
```
