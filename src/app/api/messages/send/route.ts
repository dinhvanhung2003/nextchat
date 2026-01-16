import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Friendship } from "@/models/Friendship";
import { Conversation } from "@/models/Conversation";
import { Message } from "@/models/Message";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const senderId = (session.user as any).id;
  const { toUserId, text } = await req.json();

  if (!toUserId || !String(text || "").trim()) {
    return NextResponse.json({ message: "Invalid data" }, { status: 400 });
  }

  await dbConnect();

  // 1) Check đã là bạn (ACCEPTED) chưa
  const okFriend = await Friendship.findOne({
    status: "ACCEPTED",
    $or: [
      { requesterId: senderId, addresseeId: toUserId },
      { requesterId: toUserId, addresseeId: senderId },
    ],
  }).lean();

  if (!okFriend) {
    return NextResponse.json({ message: "Phải kết bạn trước khi chat" }, { status: 403 });
  }

  // 2) Tìm hoặc tạo conversation DM
  let convo = await Conversation.findOne({
    type: "DM",
    members: { $all: [senderId, toUserId] },
  });

  if (!convo) {
    convo = await Conversation.create({
      type: "DM",
      members: [senderId, toUserId],
      lastMessageAt: new Date(),
    });
  } else {
    convo.lastMessageAt = new Date();
    await convo.save();
  }

  // 3) Lưu message
  const msg = await Message.create({
    conversationId: convo._id,
    senderId,
    type: "TEXT",
    text: String(text).trim(),
    seenBy: [senderId],
  });

  // 4) Emit socket realtime
  const io = (globalThis as any).io;
  if (io) {
    io.to(String(convo._id)).emit("message:new", msg);
  }

  return NextResponse.json({ ok: true, conversationId: String(convo._id), message: msg });
}
