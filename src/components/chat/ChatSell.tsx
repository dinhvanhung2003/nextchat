"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Users, SquarePen, Camera } from "lucide-react";
import ChatList from "./ChatList";
import FriendDirectory from "./FriendDirectory";
import ChatPanel from "./ChatPanel";
import ProfileMenu from "./ProfileMenu";
import { Button } from "@/components/ui/button";
import { usePushUX } from "@/hooks/usePushUX";
import IosInstallHint from "../../components/IosInstallHint";

export default function ChatShell() {
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [activeName, setActiveName] = useState<string>("");
  const pushUx = usePushUX();
  const isChatOpen = useMemo(() => !!activeUserId, [activeUserId]);

  return (

    <div className="h-dvh w-full bg-zinc-50">
            <IosInstallHint
        open={pushUx.showIosInstallHint}
        onClose={pushUx.closeIosInstallHint}
      />
      <div className="mx-auto h-full max-w-6xl">
        <div className="grid h-full grid-cols-1 md:grid-cols-[72px_360px_1fr] border-x bg-white">
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
            {/* ✅ Header giống hình: avatar + Chats + icons */}
            <div className="px-3 pt-3 pb-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ProfileMenu />
                  <div>
                    <div className="text-lg font-semibold leading-5">Chats</div>
                    <div className="text-xs text-zinc-500">Chat & Danh bạ</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Camera className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <SquarePen className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-3">
                <input
                  className="h-9 w-full rounded-full bg-zinc-100 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search"
                />
              </div>
            </div>

            <Tabs defaultValue="chat" className="h-[calc(100%-108px)]">
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
