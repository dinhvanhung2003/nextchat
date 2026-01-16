import http from "http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

await app.prepare();

const server = http.createServer((req, res) => handle(req, res));

const io = new Server(server, {
  path: "/socket.io",
  cors: { origin: true, credentials: true },
});

globalThis.io = io;

io.on("connection", (socket) => {
  socket.on("join", ({ conversationId }) => {
    if (conversationId) socket.join(conversationId);
  });
});

server.listen(3000, () => console.log("> Ready on http://localhost:3000"));
