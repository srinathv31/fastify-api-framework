// src/routes/callbacks.ts
import { FastifyPluginAsync } from "fastify";
import { completeWait, failWait } from "../lib/waitroom.js";
import { outcomes } from "../lib/outcomes.js";

const callbacksRoute: FastifyPluginAsync = async (app) => {
  const store = outcomes();

  app.post<{
    Body: {
      correlationId: string;
      status: "ok" | "error";
      data?: any;
      error?: any;
    };
  }>("/process/complete", {
    schema: {
      body: {
        type: "object",
        required: ["correlationId", "status"],
        properties: {
          correlationId: { type: "string", minLength: 1 },
          status: { type: "string", enum: ["ok", "error"] },
          data: {},
          error: {},
        },
      },
    },
    handler: async (req, reply) => {
      const { correlationId, status, data, error } = req.body;

      await store.save(correlationId, { status, data, error });

      const woke =
        status === "ok"
          ? completeWait(correlationId, data ?? null)
          : failWait(
              correlationId,
              new Error(error ?? "Unknown Camunda error")
            );

      // Even if no one’s waiting (async mode), 200 OK to avoid retries loops
      req.log.info({ correlationId, woke }, "callback received");
      return reply.code(200).send({ received: true });
    },
  });
};

export default callbacksRoute;
