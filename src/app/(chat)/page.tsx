"use client";

import { useEffect, useMemo, useState } from "react";
import io from "socket.io-client";
import Sidebar from "../../components/chat/Sidebar";
import ChatWindow from "../../components/chat/ChatWindow";

export default function ChatPage() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const socket = useMemo(() => {
    const s = io({
      path: process.env.NEXT_PUBLIC_SOCKET_PATH || "/api/socket",
    });
    return s;
  }, []);

  useEffect(() => {
    // ping route để init io trong dev
    fetch("/api/socket");
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <div className="h-dvh w-full bg-white">
      <div className="mx-auto h-full max-w-6xl">
        <div className="grid h-full grid-cols-1 md:grid-cols-[72px_320px_1fr]">
          <div className="hidden md:block border-r">
            {/* Icon bar */}
            <div className="p-3 text-sm font-semibold">Z</div>
          </div>

          <div className={`${activeConversationId ? "hidden md:block" : "block"} border-r`}>
            <Sidebar onSelectConversation={(id) => setActiveConversationId(id)} />
          </div>

          <div className={`${activeConversationId ? "block" : "hidden md:block"}`}>
            <ChatWindow
              conversationId={activeConversationId}
              onBackMobile={() => setActiveConversationId(null)}
              socket={socket}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
