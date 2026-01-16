"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Users } from "lucide-react";
import ChatList from "./ChatList";
import FriendDirectory from "./FriendDirectory";
import ChatPanel from "./ChatPanel";

export default function ChatShell() {
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [activeName, setActiveName] = useState<string>("");

  const isChatOpen = useMemo(() => !!activeUserId, [activeUserId]);

  return (
    <div className="h-dvh w-full bg-white">
      <div className="mx-auto h-full max-w-6xl">
        <div className="grid h-full grid-cols-1 md:grid-cols-[72px_360px_1fr] border-x">
          {/* Left icon bar */}
          <div className="hidden md:flex flex-col items-center gap-3 border-r py-4">
            <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white grid place-items-center font-bold">
              Z
            </div>
            <Separator className="my-2" />
            <div className="text-xs text-zinc-500">Menu</div>
          </div>

          {/* Middle: list */}
          <div className={`${isChatOpen ? "hidden md:block" : "block"} border-r`}>
            <div className="p-3">
              <div className="text-lg font-semibold">ChatChit</div>
              <div className="text-xs text-zinc-500">Chat & Danh bạ</div>
            </div>

            <Tabs defaultValue="chat" className="h-[calc(100%-64px)]">
              <div className="px-3">
                <TabsList className="w-full">
                  <TabsTrigger value="chat" className="flex-1 gap-2">
                    <MessageSquare className="h-4 w-4" /> Chat
                  </TabsTrigger>
                  <TabsTrigger value="friends" className="flex-1 gap-2">
                    <Users className="h-4 w-4" /> Danh bạ
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="chat" className="h-[calc(100%-52px)]">
                <ChatList
                  onPick={(u) => {
                    setActiveUserId(u.userId);
                    setActiveName(u.name);
                  }}
                />
              </TabsContent>

              <TabsContent value="friends" className="h-[calc(100%-52px)]">
                <FriendDirectory />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: chat panel */}
          <div className={`${isChatOpen ? "block" : "hidden md:block"}`}>
            <ChatPanel
              activeUserId={activeUserId}
              activeName={activeName}
              onBackMobile={() => setActiveUserId(null)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
