import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Conversation } from "@/models/Conversation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs"; // 🔥 BẮT BUỘC
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("👉 API CALLED");

    console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);

    const session = await getServerSession(authOptions);
    console.log("SESSION:", !!session?.user);

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    console.log("✅ DB CONNECTED");

    const uid = (session.user as any).id;

    const list = await Conversation.find({ members: uid })
      .sort({ lastMessageAt: -1 })
      .lean();

    console.log("FOUND conversations:", list.length);

    return NextResponse.json({ data: list });
  } catch (err: any) {
    console.error("❌ API ERROR:", err);
    return NextResponse.json(
      { message: "Server error", detail: String(err?.message || err) },
      { status: 500 }
    );
  }
}
