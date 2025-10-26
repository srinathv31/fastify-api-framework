import fastify from "fastify";
import statusRoute from "./routes/status.js";
import startRoute from "./routes/start.js";
import callbacksRoute from "./routes/process-complete.js";

const server = fastify({
  logger: true,
});

await server.register(startRoute, { prefix: "/api" });
await server.register(statusRoute, { prefix: "/api" });
await server.register(callbacksRoute, { prefix: "/api" });

server.get("/ping", async () => {
  return "pong\n";
});

server.post("/order", async (request, reply) => {
  const { id } = request.body as { id: string };

  if (!id) {
    return reply.status(400).send({ error: "ID is required" });
  }

  // call workflow service to create order
  const response = await fetch("http://localhost:3000/api/order", {
    method: "POST",
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    return reply.status(500).send({ error: "Failed to create order" });
  }

  const data = await response.json();

  reply.status(201).send(data);
});

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
