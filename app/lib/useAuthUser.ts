"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

export type UserRole = "worker" | "employer";

export type Profile = {
  id: string;
  role: UserRole;
  name: string | null;
  surname: string | null;
  phone: string | null;
  avatar_url: string | null;
};

export function useAuthProfile() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    let alive = true;

    const bootstrap = async () => {
      setLoadingProfile(true);

      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user ?? null;

      if (!alive) return;

      setUserId(sessionUser?.id ?? null);

      if (!sessionUser) {
        setProfile(null);
        setLoadingProfile(false);
        return;
      }

      const { data: prof, error } = await supabase
        .from("profiles")
        .select("id, role, name, surname, phone, avatar_url")
        .eq("id", sessionUser.id)
        .single();

      if (!alive) return;

      if (error) {
        console.error("profile load error:", error);
        setProfile(null);
      } else {
        setProfile((prof as Profile) ?? null);
      }

      setLoadingProfile(false);
    };

    bootstrap();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      bootstrap();
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { userId, profile, loadingProfile };
}