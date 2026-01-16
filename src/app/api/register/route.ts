import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";

export async function POST(req: Request) {
  const body = await req.json();
  const name = String(body?.name || "").trim();
  const phone = String(body?.phone || "").trim();
  const password = String(body?.password || "");

  if (!name || !phone || password.length < 6) {
    return NextResponse.json({ message: "Invalid data" }, { status: 400 });
  }

  await dbConnect();
  const exists = await User.findOne({ phone });
  if (exists) {
    return NextResponse.json({ message: "Phone already used" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ name, phone, passwordHash });

  return NextResponse.json({ ok: true });
}
