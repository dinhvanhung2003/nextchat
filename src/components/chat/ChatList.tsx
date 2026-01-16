"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Friend = { userId: string; name: string; phone: string; avatarUrl?: string };

function randomAvatar(seed: string) {
  // DiceBear (random theo seedbo/Thumbs) – miễn phí, dùng seed để mỗi user 1 avatar ổn định
  const s = encodeURIComponent(seed || "user");
  return `https://api.dicebear.com/8.x/thumbs/svg?seed=${s}`;
}

export default function ChatList({
  onPick,
}: {
  onPick: (u: { userId: string; name: string }) => void;
}) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Friend[]>([]);

  useEffect(() => {
    fetch("/api/friends/list")
      .then((r) => r.json())
      .then((j) => setItems(j.data || []));
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return items;
    return items.filter(
      (x) => x.name.toLowerCase().includes(qq) || x.phone.includes(qq)
    );
  }, [q, items]);

  return (
    <div className="h-full px-3 pb-3">
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Tìm kiếm"
      />

      <ScrollArea className="mt-3 h-[calc(100%-52px)]">
        <div className="space-y-1">
          {filtered.length === 0 ? (
            <div className="text-sm text-zinc-500 p-3">
              Chưa có bạn bè. Sang tab Danh bạ để kết bạn.
            </div>
          ) : (
            filtered.map((c) => {
              const letter = (c.name || c.phone || "U").slice(0, 1).toUpperCase();
              const img = c.avatarUrl?.trim() || randomAvatar(c.userId || c.name);

              return (
                <button
                  key={c.userId}
                  onClick={() => onPick({ userId: c.userId, name: c.name })}
                  className="w-full rounded-xl px-3 py-2 text-left hover:bg-zinc-50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {/* ✅ Avatar thật nằm ở đây */}
                      <AvatarImage src={img} alt={c.name} />
                      <AvatarFallback>{letter}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{c.name}</div>
                      <div className="truncate text-xs text-zinc-500">{c.phone}</div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
