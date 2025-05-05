"use client";

import { useEffect } from "react";
import { requestNotificationPermission, listenToForegroundMessages } from "@/lib/fcm";

export default function FCMNotifications() {
  useEffect(() => {
    requestNotificationPermission();
    listenToForegroundMessages();
  }, []);

  return null;
}
