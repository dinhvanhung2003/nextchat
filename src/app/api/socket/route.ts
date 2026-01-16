import { NextResponse } from "next/server";
import { Server } from "socket.io";

export const dynamic = "force-dynamic";

let io: Server | null = null;

export async function GET(req: any) {
  if (!io) {
    const resSocket = req.socket?.server;
    if (!resSocket) return NextResponse.json({ ok: false }, { status: 500 });

    io = new Server(resSocket, {
      path: process.env.SOCKET_PATH || "/api/socket",
      addTrailingSlash: false,
    });

    io.on("connection", (socket) => {
      socket.on("join", ({ conversationId }) => {
        socket.join(conversationId);
      });

      socket.on("message:send", async (payload) => {
        // Ở đây bạn sẽ gọi DB (Message.create) trong thực tế.
        // Demo: broadcast lại cho phòng
        io!.to(payload.conversationId).emit("message:new", payload);
      });
    });
  }

  return NextResponse.json({ ok: true });
}
