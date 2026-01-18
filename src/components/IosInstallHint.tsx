"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IosInstallHint({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/30 p-4 md:items-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-semibold">Bật thông báo tin nhắn</div>
            <div className="mt-1 text-sm text-zinc-600">
              Trên iPhone/iPad, để nhận thông báo bạn cần <b>Add to Home Screen</b>.
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-zinc-700">
          <li>Nhấn nút <b>Share</b> (hình vuông có mũi tên lên).</li>
          <li>Chọn <b>Add to Home Screen</b>.</li>
          <li>Mở app từ icon ngoài màn hình chính, rồi bật thông báo.</li>
        </ol>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Để sau
          </Button>
          <Button onClick={onClose}>OK</Button>
        </div>
      </div>
    </div>
  );
}
