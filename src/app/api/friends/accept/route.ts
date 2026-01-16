import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Friendship } from "@/models/Friendship";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const uid = (session.user as any).id;
  const { requestId } = await req.json();

  await dbConnect();
  const fr = await Friendship.findById(requestId);
  if (!fr) return NextResponse.json({ message: "Not found" }, { status: 404 });

  // chỉ người nhận mới accept
  if (String(fr.addresseeId) !== uid) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  fr.status = "ACCEPTED";
  await fr.save();

  return NextResponse.json({ ok: true });
}
