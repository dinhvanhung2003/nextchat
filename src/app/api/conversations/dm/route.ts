import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Friendship } from "@/models/Friendship";
import { Conversation } from "@/models/Conversation";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const me = (session.user as any).id;
  const { userId } = await req.json();

  await dbConnect();

  const okFriend = await Friendship.findOne({
    status: "ACCEPTED",
    $or: [
      { requesterId: me, addresseeId: userId },
      { requesterId: userId, addresseeId: me },
    ],
  }).lean();

  if (!okFriend) return NextResponse.json({ message: "Phải kết bạn trước" }, { status: 403 });

  let convo = await Conversation.findOne({
    type: "DM",
    members: { $all: [me, userId] },
  });

  if (!convo) {
    convo = await Conversation.create({
      type: "DM",
      members: [me, userId],
      lastMessageAt: new Date(),
    });
  }

  return NextResponse.json({ conversationId: String(convo._id) });
}
