"use client";

import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { firebaseApp } from "./firebase-client";

/**
 * Đăng ký push notification + gửi token lên server
 */
export async function registerPushToken() {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;

  const supported = await isSupported();
  if (!supported) {
    console.warn("FCM not supported on this browser");
    return;
  }

  // Nếu chưa được phép → xin quyền
  if (Notification.permission !== "granted") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      throw new Error("Notification permission denied");
    }
  }

  const messaging = getMessaging(firebaseApp);

  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  });

  if (!token) {
    throw new Error("Failed to get FCM token");
  }

  // gửi token lên backend
  await fetch("/api/push/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
      platform: detectPlatform(),
    }),
  });
}

function detectPlatform(): "ios" | "android" | "web" {
  if (typeof navigator === "undefined") return "web";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("iphone") || ua.includes("ipad")) return "ios";
  if (ua.includes("android")) return "android";
  return "web";
}
