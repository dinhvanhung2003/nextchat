import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { defaultAvatar } from "@/lib/avatar";

export async function POST(req: Request) {
  const { name, phone, password } = await req.json();

  // validate cơ bản
  if (!name?.trim()) {
    return NextResponse.json({ message: "Vui lòng nhập tên" }, { status: 400 });
  }
  if (!/^0\d{9}$/.test(phone || "")) {
    return NextResponse.json({ message: "SĐT không hợp lệ" }, { status: 400 });
  }
  if (!password || password.length < 6) {
    return NextResponse.json({ message: "Mật khẩu tối thiểu 6 ký tự" }, { status: 400 });
  }

  await dbConnect();

  const existed = await User.findOne({ phone }).lean();
  if (existed) {
    return NextResponse.json({ message: "Số điện thoại đã tồn tại" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await User.create({
    name: name.trim(),
    phone,
    passwordHash,
    image: defaultAvatar(phone), // ✅ random avatar
  });

  return NextResponse.json({ ok: true });
}
