"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, X } from "lucide-react";
import { getSocket } from "@/lib/socket-client";
import UserAvatar from "@/components/common/UserAvatar";

type ReplyLite = {
  _id: string;
  text: string;
  senderId: string;
  createdAt: string;
};

type Msg = {
  _id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  replyTo?: ReplyLite | null;
  senderAvatar?: string | null; // optional from API
};

export default function ChatPanel({
  activeUserId,
  activeName,
  activeImage,
  onBackMobile,
}: {
  activeUserId: string | null;
  activeName: string;
  activeImage?: string;
  onBackMobile: () => void;
}) {
  const socket = useMemo(() => getSocket(), []);
  const [meId, setMeId] = useState<string>("");
  const [myAvatar, setMyAvatar] = useState<string>("");
  const [conversationId, setConversationId] = useState<string>("");
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [replying, setReplying] = useState<Msg | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
const listRef = useRef<HTMLDivElement | null>(null);
const [autoScroll, setAutoScroll] = useState(true);

const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
  const el = listRef.current;
  if (!el) return;
  el.scrollTo({ top: el.scrollHeight, behavior });
};
useEffect(() => {
  const el = listRef.current;
  if (!el) return;

  const onScroll = () => {
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setAutoScroll(nearBottom);
  };

  el.addEventListener("scroll", onScroll, { passive: true });
  return () => el.removeEventListener("scroll", onScroll);
}, []);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s) => {
        setMeId(s?.user?.id || "");
        setMyAvatar(s?.user?.image || "");
      });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      if (!activeUserId) return;

      setMsgs([]);
      setConversationId("");
      setReplying(null);

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
      if (cancelled) return;

      setConversationId(cid);
      socket.emit("join", { conversationId: cid });

      const r2 = await fetch(`/api/messages/list?conversationId=${encodeURIComponent(cid)}`);
      const j2 = await r2.json();
      if (cancelled) return;

      if (r2.ok) {
        setMsgs(j2.data || []);
     setTimeout(() => scrollToBottom("auto"), 0);
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, [activeUserId, socket]);

 useEffect(() => {
  // ✅ nếu conversationId chưa có thì không subscribe
  if (!conversationId) return;

  const onNew = (m: any) => {
    if (String(m.conversationId) !== String(conversationId)) return;
    setMsgs((p) => [...p, m]);
      // chỉ auto-scroll nếu đang ở gần cuối
  setTimeout(() => {
    if (autoScroll) scrollToBottom("smooth");
  }, 0);
  };

  socket.on("message:new", onNew);

  // ✅ cleanup đúng chuẩn: return 1 function VOID
  return () => {
    socket.off("message:new", onNew);
  };
}, [conversationId, socket]);

  async function send() {
    const t = text.trim();
    if (!t || !activeUserId) return;

    setText("");

    const res = await fetch("/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        toUserId: activeUserId,
        text: t,
        replyTo: replying?._id || null,
      }),
    });

    const j = await res.json();
    if (!res.ok) {
      alert(j.message || "Gửi thất bại");
      return;
    }
    setReplying(null);
  }

  if (!activeUserId) {
    return (
      <div className="h-full w-full min-w-0 flex items-center justify-center text-sm text-zinc-500">
        Chọn một người bạn để bắt đầu chat
      </div>
    );
  }

  return (
    <div className="h-dvh md:h-full w-full min-w-0 flex flex-col bg-white">
      {/* HEADER */}
      <div className="sticky top-0 z-20 h-14 border-b bg-white flex items-center gap-3 px-3">
        <button className="md:hidden" onClick={onBackMobile}>
          <ArrowLeft className="h-5 w-5" />
        </button>

        <UserAvatar src={activeImage} alt={activeName} size={38} />
        <div className="min-w-0">
          <div className="font-semibold text-sm truncate">{activeName}</div>
          <div className="text-xs text-zinc-400">Online</div>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 w-full min-w-0 overflow-y-auto px-3 py-3 space-y-2">
        {msgs.map((m) => {
          const isMe = String(m.senderId) === String(meId);
          const avatar = isMe ? myAvatar : (m.senderAvatar || activeImage || "");

          return (
            <div key={m._id} className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
              {!isMe ? <UserAvatar src={avatar} alt="user" size={28} /> : null}

              <div
                role="button"
                tabIndex={0}
                onClick={() => setReplying(m)}
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm cursor-pointer select-text ${
                  isMe ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-900"
                }`}
              >
                {m.replyTo ? (
                  <div
                    className={`mb-2 rounded-xl px-2 py-1 text-xs border ${
                      isMe
                        ? "border-white/20 bg-blue-500/40 text-white/90"
                        : "border-zinc-200 bg-white/70 text-zinc-700"
                    }`}
                  >
                    <div className="truncate">{m.replyTo.text || "(...)"}</div>
                  </div>
                ) : null}
                {m.text}
              </div>

              {isMe ? <UserAvatar src={avatar} alt="me" size={28} /> : null}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* INPUT */}
      <div className="sticky bottom-0 z-20 border-t bg-white p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {replying ? (
          <div className="mb-2 rounded-xl border bg-zinc-50 px-3 py-2 text-xs flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="font-medium truncate">Trả lời</div>
              <div className="text-zinc-600 truncate">{replying.text}</div>
            </div>
            <button
              type="button"
              onClick={() => setReplying(null)}
              className="text-zinc-600 hover:text-zinc-900"
              aria-label="Hủy trả lời"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}

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
