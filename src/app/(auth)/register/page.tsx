"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
  });

  async function submit() {
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);

    if (res.ok) {
      router.push("/login");
    } else {
      const j = await res.json();
      alert(j.message || "Đăng ký thất bại");
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-zinc-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-xl">
            Tạo tài khoản
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Tên</Label>
            <Input
              placeholder="Nguyễn Văn A"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

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
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </div>

          <Button
            onClick={submit}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Đang tạo..." : "Đăng ký"}
          </Button>

          <p className="text-center text-sm text-zinc-500">
            Đã có tài khoản?{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-blue-600 hover:underline"
            >
              Đăng nhập
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
