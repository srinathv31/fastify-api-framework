// src/routes/start.ts
import { FastifyPluginAsync } from "fastify";
import { createWait } from "../lib/waitroom.js";
import { startProcessInstance } from "../lib/camunda.js";
import { outcomes } from "../lib/outcomes.js";

const SYNC_TIMEOUT_MS = Number(process.env.SYNC_TIMEOUT_MS ?? 25000);

const startRoute: FastifyPluginAsync = async (app) => {
  app.post<{
    Body: { correlationId: string };
    Reply: any;
  }>("/process/start", {
    schema: {
      body: {
        type: "object",
        required: ["correlationId"],
        properties: {
          correlationId: { type: "string", minLength: 1 },
        },
      },
    },
    handler: async (req, reply) => {
      const { correlationId } = req.body;
      const store = outcomes();

      // save initial status
      await store.save(correlationId, {
        status: "pending",
        step: "queued",
        startedAt: new Date().toISOString(),
      });

      // call workflow service to start process instance
      await startProcessInstance({
        key: "order",
        variables: {
          correlationId: { value: correlationId, type: "String" },
          // add anything else you need here
        },
      });

      try {
        const result = await createWait(correlationId, SYNC_TIMEOUT_MS);
        return reply.code(200).send({ status: "ok", correlationId, result });
      } catch (e: any) {
        if (e?.code === "TIMEOUT") {
          return reply.code(202).send({
            status: "pending",
            correlationId,
            statusUrl: `/api/process/status/${correlationId}`,
          });
        }
        req.log.error({ err: e, correlationId }, "start failed");
        return reply.code(500).send({
          status: "error",
          correlationId,
          error: String(e?.message ?? e),
        });
      }
    },
  });
};

export default startRoute;
