import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Friendship } from "@/models/Friendship";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const uid = (session.user as any).id;

  await dbConnect();
  const list = await Friendship.find({ addresseeId: uid, status: "PENDING" })
    .populate("requesterId", "name phone avatarUrl")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ data: list });
}
