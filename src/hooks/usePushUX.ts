"use client";

import { useEffect, useMemo, useState } from "react";
import { registerPushToken } from "@/lib/push-client";

function isStandalonePwa() {
  if (typeof window === "undefined") return false;
  const iosStandalone = (window.navigator as any).standalone === true;
  const displayModeStandalone =
    window.matchMedia?.("(display-mode: standalone)")?.matches || false;
  return iosStandalone || displayModeStandalone;
}

export function usePushUX() {
  const [showIosInstallHint, setShowIosInstallHint] = useState(false);

  const platform = useMemo<"ios" | "android" | "web">(() => {
    if (typeof navigator === "undefined") return "web";
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("android")) return "android";
    if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) return "ios";
    return "web";
  }, []);

  const canAskNotification = useMemo(() => {
    if (platform !== "ios") return true;
    return isStandalonePwa(); // iOS chỉ xin permission khi đã add home
  }, [platform]);

  useEffect(() => {
    const run = async () => {
      if (typeof window === "undefined") return;
      if (!("Notification" in window)) return;

      // iOS chưa add home => show hint 1 lần
      if (platform === "ios" && !isStandalonePwa()) {
        const seen = localStorage.getItem("ios_install_hint_seen");
        if (!seen) {
          setShowIosInstallHint(true);
          localStorage.setItem("ios_install_hint_seen", "1");
        }
        return;
      }

      // đã cho phép => register token luôn
      if (Notification.permission === "granted") {
        await registerPushToken().catch(() => {});
        return;
      }

      if (!canAskNotification) return;

      // hỏi permission 1 lần
      const asked = localStorage.getItem("push_permission_asked");
      if (asked) return;

      localStorage.setItem("push_permission_asked", "1");
      await registerPushToken().catch(() => {});
    };

    run();
  }, [platform, canAskNotification]);

  return {
    platform,
    showIosInstallHint,
    closeIosInstallHint: () => setShowIosInstallHint(false),
    retryRegisterPush: () => registerPushToken(),
  };
}
