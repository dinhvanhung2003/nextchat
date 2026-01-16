"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";

type Me = { id: string; name?: string; phone?: string; image?: string };

function randomAvatar(seed: string) {
  const s = encodeURIComponent(seed || "user");
  return `https://api.dicebear.com/8.x/thumbs/svg?seed=${s}`;
}

export default function ProfileMenu() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s) => setMe(s?.user || null))
      .catch(() => setMe(null));
  }, []);

  const letter = (me?.name || me?.phone || "U").slice(0, 1).toUpperCase();

  const avatarSrc = useMemo(() => {
    if (!me) return randomAvatar("user");
    return me.image?.trim() || randomAvatar(me.id || me.phone || me.name || "user");
  }, [me]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 w-10 p-0 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarSrc} alt="avatar" />
            <AvatarFallback>{letter}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="space-y-0.5">
          <div className="text-sm font-semibold truncate">
            {me?.name || "Tài khoản"}
          </div>
          <div className="text-xs text-zinc-500 truncate">
            {me?.phone || me?.id || ""}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => router.push("/profile")}
          className="gap-2"
        >
          <User className="h-4 w-4" /> Hồ sơ
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="gap-2 text-red-600 focus:text-red-600"
        >
          <LogOut className="h-4 w-4" /> Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
