"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Title,
  Text,
  Paper,
  Stack,
  Group,
  Button,
  ActionIcon,
  Badge,
  ThemeIcon,
  Avatar,
  Card,
} from "@mantine/core";

import {
  IconUser,
  IconMail,
  IconPhone,
  IconLogout,
  IconSettings,
  IconChevronRight,
  IconShieldCheck,
  IconBuildingSkyscraper,
} from "@tabler/icons-react";

import { supabase } from "@/app/lib/supabaseClient";
import { motion } from "framer-motion";

type EmployerProfile = {
  id: string;
  name: string | null;
  surname: string | null;
  phone: string | null;
  email: string;
};

export default function EmployerProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<EmployerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return router.replace("/");

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("name, surname, phone, role")
        .eq("id", authUser.id)
        .single();

      if (!alive) return;
      if (error || profile?.role !== "employer") return router.replace("/");

      setUser({
        id: authUser.id,
        name: profile.name,
        surname: profile.surname,
        phone: profile.phone,
        email: authUser.email ?? "",
      });
      setLoading(false);
    }
    load();
    return () => { alive = false; };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const fullName = `${user.name ?? ""} ${user.surname ?? ""}`.trim() || "Account Impresa";

  return (
    <Box className="bg-[#f8fafc] min-h-screen pb-32">
      {/* HEADER DINAMICO */}
      <Box className="relative h-64 bg-gradient-to-br from-blue-600 to-cyan-500 overflow-hidden">
        {/* Cerchi decorativi sfumati */}
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 !rounded-full blur-3xl" />
        <div className="absolute top-20 -left-10 w-48 h-48 bg-cyan-400/20 !rounded-full blur-3xl" />

        <Container size="sm" className="relative z-10 pt-12">
          <Group justify="space-between" align="flex-start">
            <Stack gap={4}>
              <Badge variant="white" color="blue" size="sm" radius="sm" fw={900}>PORTALE EMPLOYER</Badge>
              <Title order={1} className="text-white font-black text-4xl tracking-tighter">
                Profilo
              </Title>
            </Stack>
            <ActionIcon 
              variant="blur" 
              className="bg-white hover:bg-cyan/500 border-white/20 backdrop-blur-md" 
              radius="xl" size="xl"
              onClick={() => router.push("/employer/profile/edit")}
            >
              <IconSettings size={22} color="black" />
            </ActionIcon>
          </Group>
        </Container>
      </Box>

      <Container size="sm" className="-mt-16 relative z-20">
        <Stack gap="xl">
          
          {/* CARD PRINCIPALE UTENTE */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Paper p="xl" radius="32px" shadow="xl" className="border-none">
              <Group mb={30}>
                <Avatar size={70} radius="24px" color="blue" variant="light">
                  <IconBuildingSkyscraper size={35} />
                </Avatar>
                <Stack gap={0}>
                  <Text className="font-black text-2xl text-slate-800 tracking-tight">{fullName}</Text>
                  <Text className="text-slate-400 font-bold text-sm">Amministratore Account</Text>
                </Stack>
              </Group>

              <Stack gap="lg">
                <InfoRow icon={IconMail} label="Email aziendale" value={user.email} />
                <InfoRow icon={IconPhone} label="Recapito telefonico" value={user.phone || "Non specificato"} />
                <InfoRow icon={IconShieldCheck} label="Stato Account" value="Verificato" isBadge />
              </Stack>
            </Paper>
          </motion.div>

          {/* AZIONI RAPIDE */}
          <Stack gap="md">

            
            <button
              onClick={() => router.push("/privacy")}
              className="w-full flex items-center justify-between p-5 bg-white !rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              <Group>
                <ThemeIcon variant="light" color="slate" radius="md" size="lg">
                  <IconShieldCheck size={20} />
                </ThemeIcon>
                <Text className="font-bold text-slate-700">Privacy & Termini di Servizio</Text>
              </Group>
              <IconChevronRight size={18} className="text-slate-300" />
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-5 bg-red-50/50 !rounded-[24px] border border-red-100 shadow-sm hover:bg-red-50 transition-all active:scale-[0.98]"
            >
              <Group>
                <ThemeIcon variant="light" color="red" radius="md" size="lg">
                  <IconLogout size={20} />
                </ThemeIcon>
                <Text className="font-bold text-red-600">Disconnetti Account</Text>
              </Group>
            </button>
          </Stack>

          {/* FOOTER LOGO O INFO */}
          <Text className="text-center text-slate-300 text-xs font-bold uppercase tracking-widest mt-4">
            extraJob Business v2
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}

// Componente di supporto per le righe di info
function InfoRow({ icon: Icon, label, value, isBadge = false }: { icon: any, label: string, value: string, isBadge?: boolean }) {
  return (
    <Group justify="space-between" className="py-2 border-b border-slate-50 last:border-none">
      <Group gap="md">
        <ThemeIcon variant="light" color="blue" radius="md" size="md">
          <Icon size={16} />
        </ThemeIcon>
        <Stack gap={0}>
          <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">{label}</Text>
          {isBadge ? (
            <Badge color="emerald" variant="light" size="sm" radius="sm" fw={900}>{value}</Badge>
          ) : (
            <Text className="font-bold text-slate-700">{value}</Text>
          )}
        </Stack>
      </Group>
    </Group>
  );
}