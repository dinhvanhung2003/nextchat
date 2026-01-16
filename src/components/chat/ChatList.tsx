"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Friend = { userId: string; name: string; phone: string; avatarUrl?: string };

export default function ChatList({ onPick }: { onPick: (u: { userId: string; name: string }) => void }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Friend[]>([]);

  useEffect(() => {
    fetch("/api/friends/list")
      .then((r) => r.json())
      .then((j) => setItems(j.data || []));
  }, []);

  const filtered = items.filter((x) => x.name.toLowerCase().includes(q.toLowerCase()) || x.phone.includes(q));

  return (
    <div className="h-full px-3 pb-3">
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm kiếm bạn bè để chat" />

      <ScrollArea className="mt-3 h-[calc(100%-52px)]">
        <div className="space-y-1">
          {filtered.length === 0 ? (
            <div className="text-sm text-zinc-500 p-3">Chưa có bạn bè. Sang tab Danh bạ để kết bạn.</div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.userId}
                onClick={() => onPick({ userId: c.userId, name: c.name })}
                className="w-full rounded-xl px-3 py-2 text-left hover:bg-zinc-50"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{c.name.slice(0, 1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{c.name}</div>
                    <div className="truncate text-xs text-zinc-500">{c.phone}</div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
