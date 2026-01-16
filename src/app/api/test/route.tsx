import { dbConnect } from "@/lib/db";

export async function GET() {
  await dbConnect();
  return Response.json({ ok: true });
}
