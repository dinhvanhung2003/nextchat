import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const phone = (searchParams.get("phone") || "").trim();

  if (!/^0\d{9}$/.test(phone)) {
    return NextResponse.json({ message: "SĐT không hợp lệ" }, { status: 400 });
  }

  await dbConnect();
  const u = await User.findOne({ phone }).select("_id name phone avatarUrl image").lean();
  if (!u) return NextResponse.json({ message: "Không tìm thấy người dùng" }, { status: 404 });

  return NextResponse.json({
    data: {
      userId: String((u as any)._id),
      name: (u as any).name,
      phone: (u as any).phone,
      avatarUrl: (u as any).avatarUrl || (u as any).image || "",
    },
  });
}
