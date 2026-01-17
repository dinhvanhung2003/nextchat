import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Friendship } from "@/models/Friendship";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const requesterId = (session?.user as any)?.id;

  if (!requesterId) {
    return NextResponse.json({ message: "Unauthorized (session.user.id missing)" }, { status: 401 });
  }

  const { addresseeId } = await req.json();
  if (!addresseeId) {
    return NextResponse.json({ message: "Missing addresseeId" }, { status: 400 });
  }

  await dbConnect();

  const existed = await Friendship.findOne({ requesterId, addresseeId }).lean();
  if (existed) return NextResponse.json({ ok: true, existed: true });

  await Friendship.create({ requesterId, addresseeId, status: "PENDING" });

  return NextResponse.json({ ok: true });
}
