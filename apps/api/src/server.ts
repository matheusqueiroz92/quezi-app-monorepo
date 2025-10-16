import { fastify } from "fastify";

const server = fastify({ logger: true });
const port = Number(process.env.PORT) || 3333;
const host = process.env.HOST || "0.0.0.0";

server
  .listen({ port, host })
  .then(() => {
    console.log(`Server is running on ${port}`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

server.get("/test", (request, reply) => {
  reply.send("Hello world");
});
