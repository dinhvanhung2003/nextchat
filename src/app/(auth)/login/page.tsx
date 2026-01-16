"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ phone: "", password: "" });

  async function submit() {
    setLoading(true);

    const res = await signIn("credentials", {
      phone: form.phone.trim(),
      password: form.password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);

    if (!res) {
      alert("Có lỗi xảy ra, thử lại nhé.");
      return;
    }

    if (res.ok) {
      router.push(res.url || callbackUrl);
      router.refresh();
    } else {
      alert("Sai số điện thoại hoặc mật khẩu.");
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-zinc-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-xl">Đăng nhập</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Số điện thoại</Label>
            <Input
              placeholder="0123456789"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <Label>Mật khẩu</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>

          <Button onClick={submit} disabled={loading} className="w-full">
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>

          <p className="text-center text-sm text-zinc-500">
            Chưa có tài khoản?{" "}
            <button
              onClick={() => router.push("/register")}
              className="text-blue-600 hover:underline"
            >
              Đăng ký
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
