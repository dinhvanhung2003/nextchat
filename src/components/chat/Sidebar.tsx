"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

export default function Sidebar({ onSelectConversation }: { onSelectConversation: (id: string) => void }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((j) => setItems(j.data || []));
  }, []);

  const filtered = items.filter((x) => (x.title || "").toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="h-full">
      <div className="p-3">
        <div className="flex items-center gap-2 rounded-xl border px-3 py-2">
          <Search className="h-4 w-4 text-zinc-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm kiếm"
            className="w-full text-sm outline-none"
          />
        </div>
      </div>

      <div className="px-2">
        <div className="text-xs text-zinc-500 px-2 pb-2">Ưu tiên</div>
        <div className="space-y-1">
          {filtered.map((c) => (
            <button
              key={c._id}
              onClick={() => onSelectConversation(String(c._id))}
              className="w-full rounded-xl px-3 py-2 text-left hover:bg-zinc-50"
            >
              <div className="text-sm font-medium line-clamp-1">{c.title || "Cuộc trò chuyện"}</div>
              <div className="text-xs text-zinc-500 line-clamp-1">Chạm để mở</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
