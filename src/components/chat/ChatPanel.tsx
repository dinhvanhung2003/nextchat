"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import { getSocket } from "@/lib/socket-client";

type Msg = {
  _id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
};

export default function ChatPanel({
  activeUserId,
  activeName,
  onBackMobile,
}: {
  activeUserId: string | null;
  activeName: string;
  onBackMobile: () => void;
}) {
  const socket = useMemo(() => getSocket(), []);
  const [meId, setMeId] = useState<string>("");
  const [conversationId, setConversationId] = useState<string>("");
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s) => setMeId(s?.user?.id || ""));
  }, []);

  // Khi chọn người: lấy convoId -> join room -> load history
  useEffect(() => {
    async function boot() {
      if (!activeUserId) return;
      setMsgs([]);
      setConversationId("");

      // 1) get/create DM conversationId
      const r1 = await fetch("/api/conversations/dm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: activeUserId }),
      });
      const j1 = await r1.json();
      if (!r1.ok) {
        alert(j1.message || "Không mở được cuộc trò chuyện");
        return;
      }

      const cid = String(j1.conversationId);
      setConversationId(cid);

      // 2) join socket room
      socket.emit("join", { conversationId: cid });

      // 3) load history
      const r2 = await fetch(`/api/messages/list?conversationId=${encodeURIComponent(cid)}`);
      const j2 = await r2.json();
      if (r2.ok) setMsgs(j2.data || []);
    }

    boot();
  }, [activeUserId, socket]);

  // Listen realtime
  useEffect(() => {
    const onNew = (m: any) => {
      // m.conversationId trong DB là conversationId
      if (!conversationId) return;
      if (String(m.conversationId) !== String(conversationId)) return;
      setMsgs((p) => [...p, m]);
    };

    socket.on("message:new", onNew);
    return () => {
      socket.off("message:new", onNew);
    };
  }, [socket, conversationId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  async function send() {
    const t = text.trim();
    if (!t || !activeUserId) return;

    setText("");

    const res = await fetch("/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId: activeUserId, text: t }),
    });

    const j = await res.json();
    if (!res.ok) {
      alert(j.message || "Gửi thất bại");
      return;
    }

    // API sẽ emit socket, nhưng để UI phản hồi nhanh có thể append luôn:
    // setMsgs((p) => [...p, j.message]);
  }

  if (!activeUserId) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-zinc-500">
        Chọn một người bạn để bắt đầu chat
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="h-12 border-b flex items-center gap-2 px-3">
        <button className="md:hidden" onClick={onBackMobile}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="font-semibold text-sm">{activeName}</div>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-2">
        {msgs.map((m) => {
          const isMe = String(m.senderId) === String(meId);
          return (
            <div key={m._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${isMe ? "bg-blue-600 text-white" : "bg-zinc-100"}`}>
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="border-t p-2">
        <div className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Nhập tin nhắn..."
          />
          <Button onClick={send} className="gap-2">
            <Send className="h-4 w-4" /> Gửi
          </Button>
        </div>
      </div>
    </div>
  );
}
