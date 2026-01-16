"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";

export default function ChatWindow({
  conversationId,
  onBackMobile,
  socket,
}: {
  conversationId: string | null;
  onBackMobile: () => void;
  socket: any;
}) {
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<any[]>([]);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!conversationId) return;
    socket.emit("join", { conversationId });

    fetch(`/api/messages?conversationId=${conversationId}`)
      .then((r) => r.json())
      .then((j) => setMsgs(j.data || []));

    const onNew = (m: any) => {
      if (m.conversationId === conversationId) setMsgs((prev) => [...prev, m]);
    };
    socket.on("message:new", onNew);
    return () => socket.off("message:new", onNew);
  }, [conversationId, socket]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  if (!conversationId) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-zinc-500">
        Chọn một cuộc trò chuyện
      </div>
    );
  }

  function send() {
    const t = text.trim();
    if (!t) return;
    const payload = {
      conversationId,
      type: "TEXT",
      text: t,
      createdAt: new Date().toISOString(),
    };
    socket.emit("message:send", payload);
    setText("");
  }

  return (
    <div className="h-full flex flex-col">
      <div className="h-12 border-b flex items-center gap-2 px-3">
        <button className="md:hidden" onClick={onBackMobile}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="font-semibold text-sm">Chat</div>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-2">
        {msgs.map((m, idx) => (
          <div key={idx} className="max-w-[80%] rounded-2xl bg-zinc-100 px-3 py-2 text-sm">
            {m.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="border-t p-2">
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Nhập tin nhắn..."
            className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none"
          />
          <button onClick={send} className="rounded-xl bg-blue-600 px-3 text-white">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
