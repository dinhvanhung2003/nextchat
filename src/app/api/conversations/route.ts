import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Conversation } from "@/models/Conversation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const uid = (session.user as any).id;
  await dbConnect();

  const list = await Conversation.find({ members: uid })
    .sort({ lastMessageAt: -1 })
    .lean();

  return NextResponse.json({ data: list });
}
