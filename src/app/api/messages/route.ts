import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Message } from "@/models/Message";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");
  if (!conversationId) return NextResponse.json({ message: "Missing conversationId" }, { status: 400 });

  await dbConnect();
  const msgs = await Message.find({ conversationId })
    .sort({ createdAt: 1 })
    .limit(200)
    .lean();

  return NextResponse.json({ data: msgs });
}
