"use client";

import { useEffect, useMemo, useState } from "react";
import {
  IconMail,
  IconLock,
  IconPhone,
  IconUser,
  IconBuildingStore,
  IconSettings,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { Container, Group, Stack, ActionIcon } from "@mantine/core";
import { supabase } from "@/app/lib/supabaseClient";
import { STORAGE_KEYS } from "@/app/lib/storageKeys";

type Business = {
  businessName: string;
  businessType: string;
  address: string;
};

export default function ProfilePage() {
  const router = useRouter();

  // ✅ STATE REALI DAL DB
  const [avatar, setAvatar] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const userRole =
    typeof window !== "undefined"
      ? (localStorage.getItem(STORAGE_KEYS.USER_ROLE) as
          | "worker"
          | "employer"
          | null)
      : null;

  // -----------------------
  // LOAD PROFILE FROM SUPABASE
  // -----------------------
  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setEmail(user.email ?? "");

      const { data, error } = await supabase
        .from("profiles")
        .select("name, surname, phone, avatar_url")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Errore caricamento profilo:", error);
        return;
      }

      setFirstName(data?.name ?? "");
      setLastName(data?.surname ?? "");
      setPhone(data?.phone ?? "");
      setAvatar(data?.avatar_url ?? null);
    }

    loadProfile();
  }, []);

  // -----------------------
  // LOGOUT
  // -----------------------
const handleLogout = async () => {
  localStorage.clear(); // puoi tenerlo finché usi legacy
  await supabase.auth.signOut();
};

  const fullName = useMemo(
    () => `${firstName} ${lastName}`.trim() || "Utente",
    [firstName, lastName]
  );

  // -----------------------
  // UI
  // -----------------------
  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-50">
      {/* HEADER */}
      <div className="relative h-46 lg:h-52">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-emerald-400" />

        <Container size="lg" pt={30} className="relative z-10">
          <Group justify="space-between" align="flex-start">
            <Stack gap={0}>
              <h1
                style={{
                  color: "white",
                  fontWeight: 900,
                  fontSize: "2.5rem",
                  letterSpacing: "-1.5px",
                }}
              >
                {fullName}
              </h1>

              <div className="text-white/80 text-sm flex items-center gap-2 mt-2">
                <IconMail size={14} /> {email}
              </div>
            </Stack>

            <ActionIcon
              variant="white"
              radius="xl"
              size="lg"
              onClick={() => router.push("/profile/edit")}
            >
              <IconSettings size={20} />
            </ActionIcon>
          </Group>
        </Container>

        {/* AVATAR */}
        <div className="absolute right-6 bottom-[-34px] z-20">
          <div className="h-28 w-28 !rounded-full border-[6px] border-slate-50 bg-white shadow-lg overflow-hidden flex items-center justify-center">
            {avatar ? (
              <img
                src={avatar}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-4xl">👤</span>
            )}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 pt-14 pb-6">
        <div className="bg-white !rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <InfoRow
            icon={<IconUser size={20} />}
            label="Nome"
            value={fullName}
          />
          <Divider />
          <InfoRow icon={<IconMail size={20} />} label="Email" value={email} />
          <Divider />
          <InfoRow
            icon={<IconPhone size={20} />}
            label="Telefono"
            value={phone || "—"}
          />
        </div>

        <button
          onClick={handleLogout}
          className="mt-4 w-full !rounded-full border border-red-200 text-red-600 font-semibold py-4 bg-white hover:bg-red-50 transition"
        >
          LOGOUT
        </button>
      </div>
    </div>
  );
}

// -----------------------
// COMPONENTI UI
// -----------------------

function Divider() {
  return <div className="h-px bg-slate-100" />;
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="w-full px-5 py-4 flex items-center gap-4">
      <div className="h-11 w-11 !rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-slate-900 font-semibold truncate">{value}</div>
      </div>
    </div>
  );
}