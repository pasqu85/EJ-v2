"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

type Notification = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  read: boolean;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadNotifications();

    let channel: any;

    async function setupRealtime() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      channel = supabase
        .channel("notifications-live")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log("🔔 NUOVA NOTIFICA:", payload);

            setNotifications((prev) => [
              payload.new as Notification,
              ...prev,
            ]);
          }
        )
        .subscribe();
    }

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  async function loadNotifications() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setNotifications(data || []);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-5">
      <h1 className="text-3xl font-black mb-6">
        Notifiche
      </h1>

      <div className="space-y-4">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="bg-white rounded-3xl p-5 shadow-sm border"
          >
            <div className="font-black text-lg">
              {n.title}
            </div>

            <div className="text-slate-500 mt-1">
              {n.body}
            </div>

            <div className="text-xs text-slate-400 mt-3">
              {new Date(n.created_at).toLocaleString("it-IT")}
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="text-slate-400">
            Nessuna notifica
          </div>
        )}
      </div>
    </div>
  );
}