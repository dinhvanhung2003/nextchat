import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Friendship } from "@/models/Friendship";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as any)?.id;

  if (!uid) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const list = await Friendship.find({ addresseeId: uid, status: "PENDING" })
    .populate("requesterId", "name phone avatarUrl image")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ data: list });
}
