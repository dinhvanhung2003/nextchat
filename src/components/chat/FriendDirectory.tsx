"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function FriendDirectory() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingReq, setLoadingReq] = useState(false);

  async function loadRequests() {
    setLoadingReq(true);
    const res = await fetch("/api/friends/requests");
    const j = await res.json();
    setRequests(j.data || []);
    setLoadingReq(false);
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function sendRequest() {
    setLoading(true);
    const res = await fetch("/api/friends/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const j = await res.json();
    setLoading(false);

    if (!res.ok) return alert(j.message || "Gửi lời mời thất bại");

    alert(j.autoAccepted ? "Đã tự động chấp nhận (do người kia đã gửi bạn trước)" : "Đã gửi lời mời kết bạn");
    setPhone("");
    loadRequests();
  }

  async function accept(requestId: string) {
    const res = await fetch("/api/friends/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId }),
    });
    const j = await res.json();
    if (!res.ok) return alert(j.message || "Accept thất bại");
    await loadRequests();
    alert("Đã chấp nhận kết bạn");
  }

  return (
    <div className="h-full px-3 pb-3">
      <Tabs defaultValue="add" className="h-full">
        <TabsList className="w-full">
          <TabsTrigger value="add" className="flex-1">Thêm bạn</TabsTrigger>
          <TabsTrigger value="requests" className="flex-1">Lời mời</TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="mt-3 space-y-3">
          <Card className="p-3">
            <div className="text-sm font-medium">Tìm theo số điện thoại</div>
            <div className="mt-2 flex gap-2">
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="VD: 0909123456" />
              <Button onClick={sendRequest} disabled={loading || !phone.trim()}>
                {loading ? "Đang gửi..." : "Kết bạn"}
              </Button>
            </div>
            <div className="mt-2 text-xs text-zinc-500">Kết bạn xong mới nhắn tin được.</div>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="mt-3 space-y-2">
          {loadingReq ? (
            <div className="text-sm text-zinc-500">Đang tải...</div>
          ) : requests.length === 0 ? (
            <div className="text-sm text-zinc-500">Chưa có lời mời nào.</div>
          ) : (
            requests.map((r) => (
              <Card key={r._id} className="p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{r.requesterId?.name || "Unknown"}</div>
                  <div className="text-xs text-zinc-500">{r.requesterId?.phone}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{r.status}</Badge>
                  <Button size="sm" onClick={() => accept(r._id)}>Chấp nhận</Button>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
