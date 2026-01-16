import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Conversation } from "@/models/Conversation";
import { Message } from "@/models/Message";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const me = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) return NextResponse.json({ message: "Missing conversationId" }, { status: 400 });

  await dbConnect();

  // check member
  const convo = await Conversation.findById(conversationId).lean();
  if (!convo) return NextResponse.json({ message: "Conversation not found" }, { status: 404 });
  if (!convo.members.map(String).includes(String(me)))
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const msgs = await Message.find({ conversationId })
    .sort({ createdAt: 1 })
    .limit(200)
    .lean();

  return NextResponse.json({ data: msgs });
}
