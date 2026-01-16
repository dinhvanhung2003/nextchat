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

  // accepted cả 2 chiều
  const list = await Friendship.find({
    status: "ACCEPTED",
    $or: [{ requesterId: uid }, { addresseeId: uid }],
  })
    .populate("requesterId", "name phone avatarUrl")
    .populate("addresseeId", "name phone avatarUrl")
    .lean();

  // normalize: trả về "bên kia"
  const friends = list.map((fr: any) => {
    const a = fr.requesterId;
    const b = fr.addresseeId;
    const other = String(a._id) === uid ? b : a;
    return { userId: String(other._id), name: other.name, phone: other.phone, avatarUrl: other.avatarUrl || "" };
  });

  return NextResponse.json({ data: friends });
}
