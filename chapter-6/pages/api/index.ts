import { createServer } from "@graphql-yoga/node";
import { join } from "path";
import { readFileSync } from "fs";
import { Resolvers } from "../../types";
import type { PrismaClient } from "@prisma/client";
import type { YogaInitialContext } from "@graphql-yoga/node";

import prisma from "../../lib/prisma";

export interface GraphQLContext extends YogaInitialContext {
  prisma: PrismaClient;
}

const typeDefs = readFileSync(join(process.cwd(), "schema.graphql"), {
  encoding: "utf-8",
});

const resolvers: Resolvers = {
  Query: {
    cart: (_, { id }) => {
      return {
        id,
        totalItems: 0,
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
