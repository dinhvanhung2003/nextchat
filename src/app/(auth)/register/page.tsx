"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Errors = {
  name?: string;
  phone?: string;
  password?: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
  });

  const [errors, setErrors] = useState<Errors>({});

  // ================== VALIDATE ==================
  function validate(values = form): Errors {
    const e: Errors = {};

    // Name
    if (!values.name.trim()) {
      e.name = "Vui lòng nhập tên";
    } else if (values.name.trim().length < 2) {
      e.name = "Tên phải có ít nhất 2 ký tự";
    }

    // Phone (VN)
    if (!values.phone.trim()) {
      e.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^0\d{9}$/.test(values.phone)) {
      e.phone = "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)";
    }

    // Password
    if (!values.password) {
      e.password = "Vui lòng nhập mật khẩu";
    } else if (values.password.length < 6) {
      e.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    return e;
  }

  function onChange(
    field: keyof typeof form,
    value: string
  ) {
    const next = { ...form, [field]: value };
    setForm(next);
    setErrors(validate(next)); // validate realtime
  }

  async function submit() {
    const e = validate();
    setErrors(e);

    if (Object.keys(e).length > 0) return;

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

  const isDisabled =
    loading || Object.keys(errors).length > 0;

  // ================== UI ==================
  return (
    <div className="min-h-dvh flex items-center justify-center bg-zinc-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-xl">
            Tạo tài khoản
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* NAME */}
          <div className="space-y-1">
            <Label>Tên</Label>
            <Input
           
              value={form.name}
              onChange={(e) =>
                onChange("name", e.target.value)
              }
            />
            {errors.name && (
              <p className="text-xs text-red-500">
                {errors.name}
              </p>
            )}
          </div>

          {/* PHONE */}
          <div className="space-y-1">
            <Label>Số điện thoại</Label>
            <Input
            
              value={form.phone}
              onChange={(e) =>
                onChange("phone", e.target.value)
              }
            />
            {errors.phone && (
              <p className="text-xs text-red-500">
                {errors.phone}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div className="space-y-1">
            <Label>Mật khẩu</Label>
            <Input
              type="password"
             
              value={form.password}
              onChange={(e) =>
                onChange("password", e.target.value)
              }
            />
            {errors.password && (
              <p className="text-xs text-red-500">
                {errors.password}
              </p>
            )}
          </div>

          <Button
            onClick={submit}
            disabled={isDisabled}
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
