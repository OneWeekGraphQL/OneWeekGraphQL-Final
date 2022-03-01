import { createServer } from "@graphql-yoga/node";
import { join } from "path";
import { readFileSync } from "fs";
import { Resolvers } from "../../types";
import type { PrismaClient } from "@prisma/client";
import type { YogaInitialContext } from "@graphql-yoga/node";

import prisma from "../../lib/prisma";

import currencyFormatter from "currency-formatter";

const currencyCode = "USD";

export interface GraphQLContext extends YogaInitialContext {
  prisma: PrismaClient;
}

const typeDefs = readFileSync(join(process.cwd(), "schema.graphql"), {
  encoding: "utf-8",
});

const resolvers: Resolvers = {
  Query: {
    cart: async (_, { id }, { prisma }) => {
      let cart = await prisma.cart.findUnique({
        where: { id },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { id },
        });
      }

      return cart;
    },
  },
  Cart: {
    items: async ({ id }, _, { prisma }) => {
      const items = await prisma.cart
        .findUnique({
          where: { id },
        })
        .items();

      return items;
    },
    totalItems: async ({ id }, _, { prisma }) => {
      const items = await prisma.cart
        .findUnique({
          where: { id },
        })
        .items();

      return items.reduce((total, item) => total + item.quantity || 1, 0);
    },
    subTotal: async ({ id }, _, { prisma }) => {
      const items = await prisma.cart
        .findUnique({
          where: { id },
        })
        .items();

      const amount =
        items.reduce((acc, item) => acc + item.price * item.quantity, 0) ?? 0;

      return {
        amount,
        formatted: currencyFormatter.format(amount / 100, {
          code: currencyCode,
        }),
      };
    },
  },
};

const context: (req: YogaInitialContext) => GraphQLContext = (req) => ({
  ...req,
  prisma,
});

const server = createServer({
  cors: false,
  endpoint: "/api",
  logging: {
    prettyLog: false,
  },
  schema: {
    typeDefs,
    resolvers,
  },
  context,
});

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default server.requestListener;
