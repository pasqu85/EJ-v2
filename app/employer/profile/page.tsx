"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
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
  ScrollArea,
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
  IconPlus,
} from "@tabler/icons-react";

import { supabase } from "@/app/lib/supabaseClient";
import { motion } from "framer-motion";

type Company = {
  id: string;
  name: string;
  logo_url: string | null;
  address: string | null;
};

type EmployerProfile = {
  id: string;
  name: string | null;
  surname: string | null;
  phone: string | null;
  email: string;
  companies: Company[];
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

      // Recuperiamo profilo E aziende (assumendo una tabella 'companies' con 'owner_id')
const [profileRes, companiesRes] = await Promise.all([
  supabase
    .from("profiles")
    .select("name, surname, phone, role")
    .eq("id", authUser.id)
    .single(),

  supabase
    .from("businesses")
    .select("id, name, logo_url, address")
    .eq("owner_id", authUser.id)
]);

      if (!alive) return;
      if (profileRes.error || profileRes.data?.role !== "employer") return router.replace("/");

      setUser({
        id: authUser.id,
        name: profileRes.data.name,
        surname: profileRes.data.surname,
        phone: profileRes.data.phone,
        email: authUser.email ?? "",
        companies: companiesRes.data || [],
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
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 !rounded-full blur-3xl" />
        <div className="absolute top-20 -left-10 w-48 h-48 bg-cyan-400/20 !rounded-full blur-3xl" />

        <Container size="sm" className="relative z-10 pt-12">
          <Group justify="space-between" align="flex-start">
            <Stack gap={4}>
              <Badge variant="white" color="blue" size="sm" radius="sm" fw={900}>PORTALE EMPLOYER</Badge>
              <Title order={1} className="text-white font-black text-4xl tracking-tighter">Profilo</Title>
            </Stack>
            <ActionIcon 
              variant="cyan-400/20" 
              className="bg-white/20 hover:bg-white/30 border-white/20 backdrop-blur-md shadow-lg" 
              radius="xl" size="xl"
              onClick={() => router.push("/employer/profile/edit")}
            >
              <IconSettings size={22} color="white" />
            </ActionIcon>
          </Group>
        </Container>
      </Box>

      <Container size="sm" className="-mt-16 relative z-20">
        <Stack gap="xl">
          
          {/* CARD PRINCIPALE UTENTE */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Paper p="xl" radius="32px" shadow="xl" className="border-none bg-white/95 backdrop-blur-md">
              <Group mb={30}>
                <Avatar size={70} radius="24px" color="blue" variant="light">
                  <IconUser size={35} />
                </Avatar>
                <Stack gap={0}>
                  <Text className="font-black text-2xl text-slate-800 tracking-tight">{fullName}</Text>
                  <Text className="text-slate-400 font-bold text-sm">Amministratore Delegato</Text>
                </Stack>
              </Group>

              <Stack gap="lg">
                <InfoRow icon={IconMail} label="Email personale" value={user.email} />
                <InfoRow icon={IconPhone} label="Telefono" value={user.phone || "Non specificato"} />
              </Stack>
            </Paper>
          </motion.div>

          {/* SEZIONE AZIENDE - IL NUOVO CAROSELLO */}
          <Stack gap="xs">
            <Group justify="space-between" px="md">
              <Text className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Le tue Aziende ({user.companies.length})</Text>
              <Button 
                variant="subtle" 
                size="compact-xs" 
                leftSection={<IconPlus size={14}/>}
                onClick={() => router.push("/employer/profile/edit")}
              >
                Aggiungi
              </Button>
            </Group>

            {user.companies.length > 0 ? (
              <ScrollArea scrollbarSize={0}>
                <Group wrap="nowrap" pb="sm" px="xs">
                  {user.companies.map((company) => (
                    <motion.div key={company.id} whileTap={{ scale: 0.95 }}>
                      <Paper 
                        p="md" 
                        radius="24px" 
                        className="min-w-[200px] bg-white border border-slate-100 shadow-sm hover:shadow-md cursor-pointer"
                        onClick={() => router.push(`/employer/companies/${company.id}`)}
                      >
                        <Group align="center" gap="md">
                          <Avatar 
                            src={company.logo_url} 
                            size="lg" 
                            radius="md" 
                            className="bg-slate-50 border border-slate-100"
                          >
                            <IconBuildingSkyscraper size={20} />
                          </Avatar>
                          <Stack gap={0}>
                            <Text fw={900} className="text-slate-800 leading-tight">{company.name}</Text>
                            <Text size="xs" color="dimmed" fw={700}>{company.address || "Sede da definire"}</Text>
                          </Stack>
                        </Group>
                      </Paper>
                    </motion.div>
                  ))}
                </Group>
              </ScrollArea>
            ) : (
              <Paper p="xl" radius="24px" className="bg-slate-100/50 border-dashed border-2 border-slate-200 flex flex-col items-center">
                <Text color="dimmed" size="sm" fw={700} mb="sm">Non hai ancora registrato un'azienda</Text>
                <Button variant="light" radius="xl" size="xs" onClick={() => router.push("/employer/profile/edit")}>Configura Azienda</Button>
              </Paper>
            )}
          </Stack>

          {/* AZIONI RAPIDE */}
          <Stack gap="md">
            <MenuButton icon={IconShieldCheck} label="Privacy & Termini" onClick={() => router.push("/privacy")} />
            <MenuButton icon={IconLogout} label="Disconnetti Account" color="red" onClick={handleLogout} />
          </Stack>

          <Text className="text-center text-slate-300 text-[10px] font-black uppercase tracking-widest mt-4">
            extraJob Business v2.5
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}

// Componenti di supporto raffinati
function MenuButton({ icon: Icon, label, onClick, color = "blue" }: any) {
  const isRed = color === "red";
  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-full flex items-center justify-between p-5 transition-all active:scale-[0.98] !rounded-[24px] border",
        isRed ? "bg-red-50/50 border-red-100" : "bg-white border-slate-100 shadow-sm hover:shadow-md"
      )}
    >
      <Group>
        <ThemeIcon variant="light" color={color} radius="md" size="lg">
          <Icon size={20} />
        </ThemeIcon>
        <Text className={clsx("font-bold", isRed ? "text-red-600" : "text-slate-700")}>{label}</Text>
      </Group>
      <IconChevronRight size={18} className={isRed ? "text-red-200" : "text-slate-300"} />
    </button>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <Group justify="space-between" className="py-2 border-b border-slate-50 last:border-none">
      <Group gap="md">
        <ThemeIcon variant="light" color="blue" radius="md" size="md">
          <Icon size={16} />
        </ThemeIcon>
        <Stack gap={0}>
          <Text className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">{label}</Text>
          <Text className="font-bold text-slate-700 text-sm">{value}</Text>
        </Stack>
      </Group>
    </Group>
  );
}