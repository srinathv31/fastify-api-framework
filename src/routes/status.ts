// src/routes/status.ts
import { FastifyPluginAsync } from "fastify";
import { outcomes } from "../lib/outcomes.js";

const statusRoute: FastifyPluginAsync = async (app) => {
  const store = outcomes();

  app.get<{ Params: { correlationId: string } }>(
    "/process/status/:correlationId",
    {
      schema: {
        params: {
          type: "object",
          properties: { correlationId: { type: "string" } },
          required: ["correlationId"],
        },
      },
      handler: async (req, reply) => {
        const res = await store.get(req.params.correlationId);
        if (!res) return reply.code(404).send({ status: "not found" });
        return reply.code(res.status === "ok" ? 200 : 500).send(res);
      },
    }
  );

  app.get("/process/status/all", {
    handler: async (_req, reply) => {
      return reply.code(200).send(await store.values());
    },
  });
};

export default statusRoute;
