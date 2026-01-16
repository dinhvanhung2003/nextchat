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
  const { toUserId, text, replyTo } = await req.json();

  if (!toUserId || !String(text || "").trim()) {
    return NextResponse.json({ message: "Invalid data" }, { status: 400 });
  }

  await dbConnect();

  // 1) Must be friends
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

  // 2) Find or create DM conversation
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

  // ✅ Validate replyTo belongs to this conversation
  let replyToId: any = null;
  if (replyTo) {
    const base = await Message.findById(replyTo).lean();
    if (!base) {
      return NextResponse.json({ message: "Tin nhắn được trả lời không tồn tại" }, { status: 400 });
    }
    if (String(base.conversationId) !== String(convo._id)) {
      return NextResponse.json({ message: "replyTo không thuộc cuộc trò chuyện này" }, { status: 400 });
    }
    replyToId = base._id;
  }

  // 3) Create message
  const msg = await Message.create({
    conversationId: convo._id,
    senderId,
    type: "TEXT",
    text: String(text).trim(),
    seenBy: [senderId],
    replyTo: replyToId,
  });

  // ✅ IMPORTANT: re-fetch & populate for realtime UI quote
  const fullMsg = await Message.findById(msg._id)
    .populate("replyTo", "text senderId createdAt")
    .lean();

  // 4) Broadcast via Render socket server
  try {
    const socketUrl = process.env.SOCKET_SERVER_URL;
    if (socketUrl) {
      await fetch(`${socketUrl}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: String(convo._id),
          message: fullMsg,
        }),
      });
    }
  } catch (e) {
    console.error("Socket publish failed:", e);
  }

  return NextResponse.json({
    ok: true,
    conversationId: String(convo._id),
    message: fullMsg,
  });
}
