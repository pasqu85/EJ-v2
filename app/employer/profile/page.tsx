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
  Avatar,
  Button,
  ActionIcon,
  Badge,
  Divider,
  ThemeIcon,
} from "@mantine/core";

import {
  IconBuildingStore,
  IconUser,
  IconMail,
  IconPhone,
  IconMapPin,
  IconLogout,
  IconSettings,
} from "@tabler/icons-react";

import { supabase } from "@/app/lib/supabaseClient";
import { STORAGE_KEYS } from "@/app/lib/storageKeys";

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

  // ✅ LOAD PROFILE FROM SUPABASE
  useEffect(() => {
    let alive = true;

    async function load() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.replace("/");
        return;
      }

      // controllo ruolo
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("name, surname, phone, role")
        .eq("id", authUser.id)
        .single();

      if (!alive) return;

      if (error || profile?.role !== "employer") {
        router.replace("/");
        return;
      }

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
    return () => {
      alive = false;
    };
  }, [router]);

  const handleLogout = async () => {
    localStorage.clear(); // puoi tenerlo finché usi legacy
    await supabase.auth.signOut();

    // se vuoi pulire cose vecchie UI (facoltativo)
    localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
    localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
    localStorage.removeItem(STORAGE_KEYS.APPLIED_JOBS);
    {
      loading && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50
                  px-4 py-2 rounded-full bg-white shadow border text-sm">
          Caricamento profilo…
        </div>
      )
    }
  };


  if (!user) return null;

  const fullName =
    `${user.name ?? ""} ${user.surname ?? ""}`.trim() || "Utente";

  return (
    <Box style={{ backgroundColor: "#f8fafc", minHeight: "100vh", paddingBottom: 120 }}>
      {/* HEADER */}
      <Box
        style={{
          position: "relative",
          height: "220px",
          background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
          overflow: "hidden",
        }}
      >
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute top-20 -left-10 w-48 h-48 bg-blue-400/30 rounded-full blur-3xl" />

        <Container size="sm" pt={40}>
          <Group justify="space-between">
            <Stack gap={0}>
              <Title order={1} c="white" fw={900}>
                Profilo <span style={{ opacity: 0.8 }}>Impresa</span>
              </Title>
              <Text c="blue.1">Gestisci la tua identità su extraJob</Text>
            </Stack>

            <ActionIcon
              variant="white"
              color="blue"
              radius="xl"
              size="lg"
              onClick={() => router.push("/employer/profile/edit")}
            >
              <IconSettings size={20} />
            </ActionIcon>
          </Group>
        </Container>

        <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 100">
          <path
            d="M0,100 C480,0 960,0 1440,100 L1440,100 L0,100 Z"
            fill="#f8fafc"
          />
        </svg>
      </Box>

      <Container size="sm" style={{ marginTop: "-40px", position: "relative", zIndex: 5 }}>
        <Stack gap="xl">

          {/* CARD ACCOUNT */}
          <Paper p="xl" radius="24px" withBorder shadow="md">
            <Stack gap="md">

              <Group gap="sm">
                <ThemeIcon variant="light" radius="md">
                  <IconUser size={16} />
                </ThemeIcon>
                <Box>
                  <Text size="xs" c="dimmed">Nominativo</Text>
                  <Text fw={600}>{fullName}</Text>
                </Box>
              </Group>

              <Group gap="sm">
                <ThemeIcon variant="light" radius="md">
                  <IconMail size={16} />
                </ThemeIcon>
                <Box>
                  <Text size="xs" c="dimmed">Email</Text>
                  <Text fw={600}>{user.email}</Text>
                </Box>
              </Group>

              <Group gap="sm">
                <ThemeIcon variant="light" radius="md">
                  <IconPhone size={16} />
                </ThemeIcon>
                <Box>
                  <Text size="xs" c="dimmed">Telefono</Text>
                  <Text fw={600}>{user.phone || "Non inserito"}</Text>
                </Box>
              </Group>

            </Stack>
          </Paper>

          {/* LOGOUT */}
          <Button
            variant="subtle"
            color="red"
            radius="xl"
            leftSection={<IconLogout size={18} />}
            onClick={handleLogout}
          >
            Disconnetti account
          </Button>

        </Stack>
      </Container>
    </Box>
  );
}