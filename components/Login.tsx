"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@mantine/form";
import { FcGoogle } from "react-icons/fc";
import {
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Group,
  SegmentedControl,
  Stack,
  Divider,
  Anchor,
  Center,
  Box,
} from "@mantine/core";
import { motion } from "framer-motion";

import { supabase } from "@/app/lib/supabaseClient";

type UserRole = "worker" | "employer";

type Props = {
  onLogin: (role: UserRole) => void;
  defaultRole?: UserRole;
  lockRole?: boolean;
};

const PENDING_ROLE_KEY = "EXTRAJOB_PENDING_ROLE";


async function ensureProfile(
  userId: string,
  payload: { role: UserRole; name: string; surname: string; phone: string }
) {
  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        role: payload.role,
        name: payload.name,
        surname: payload.surname,
        phone: payload.phone,
      },
      { onConflict: "id" }
    );

  if (error) throw error;
}

async function getMyRole(userId: string): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error) return null;
  return (data?.role as UserRole) ?? null;
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  const name = parts.shift() ?? "";
  const surname = parts.join(" ");
  return { name, surname };
}

export default function Login({
  onLogin,
  defaultRole = "worker",
  lockRole = false,
}: Props) {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [loading, setLoading] = useState(false);

  // se arrivi dalla welcome e cambia defaultRole, aggiorna lo state
  useEffect(() => {
    setRole(defaultRole);
  }, [defaultRole]);

  const primaryColor: "green" | "blue" = role === "worker" ? "green" : "blue";

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      name: "",
      surname: "",
      phone: "",
    },
    validate: {
      email: (v) => (/^\S+@\S+$/.test(v) ? null : "Email non valida"),
      password: (v) => (v.trim().length >= 6 ? null : "Minimo 6 caratteri"),
      name: (v) =>
        mode === "register" && !v.trim() ? "Nome obbligatorio" : null,
      surname: (v) =>
        mode === "register" && !v.trim() ? "Cognome obbligatorio" : null,
      phone: (v) =>
        mode === "register" && !v.trim() ? "Telefono obbligatorio" : null,
    },
  });

  // quando cambi modalità, pulisci errori
  useEffect(() => {
    form.clearErrors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Se torni da OAuth (Google) e c’è sessione: completa profilo e redirect
  useEffect(() => {
    let alive = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!alive) return;

      const session = data.session;
      if (!session) return;

      const userId = session.user.id;

      let r = await getMyRole(userId);

      // se profilo/ruolo manca, prova pending role (salvato pre-redirect)
      if (!r) {
        const pending =
          typeof window !== "undefined"
            ? (localStorage.getItem(PENDING_ROLE_KEY) as UserRole | null)
            : null;

        if (typeof window !== "undefined") {
          localStorage.removeItem(PENDING_ROLE_KEY);
        }

        const fallbackRole: UserRole = pending ?? role ?? "worker";

        const fullName =
          (session.user.user_metadata?.full_name as string | undefined) ?? "";
        const { name, surname } = splitName(fullName);

        await ensureProfile(userId, {
          role: fallbackRole,
          name,
          surname,
          phone: "",
        });

        r = fallbackRole;
      }

      if (!alive) return;

      onLogin(r);
      router.replace(r === "employer" ? "/employer" : "/");
    })().catch((e) => console.error("OAuth session bootstrap error:", e));

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doLogin = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const doRegister = async (payload: {
    email: string;
    password: string;
    name: string;
    surname: string;
    phone: string;
    role: UserRole;
  }) => {

    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          role: payload.role,
          name: payload.name,
          surname: payload.surname,
          phone: payload.phone,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);

      // SOLO per ricordare il ruolo durante redirect OAuth
      localStorage.setItem(PENDING_ROLE_KEY, role);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      // redirect -> qui non prosegui
    } catch (e: any) {
      alert(e?.message ?? "Errore login Google");
      setLoading(false);
    }
  };

  const handleSubmit = form.onSubmit(async (values) => {
    setLoading(true);

    try {
      const email = values.email.trim().toLowerCase();
      const password = values.password;

      if (mode === "login") {
        await doLogin(email, password);

        const { data } = await supabase.auth.getSession();
        const userId = data.session?.user.id;
        if (!userId) throw new Error("Sessione non trovata dopo login");

        const r = (await getMyRole(userId)) ?? role;

        onLogin(r);
        router.replace(r === "employer" ? "/employer" : "/");
        return;
      }

      // register
      const name = (values.name ?? "").trim();
      const surname = (values.surname ?? "").trim();
      const phone = (values.phone ?? "").trim();

      await doRegister({ email, password, name, surname, phone, role });

      // se conferma email è attiva, spesso NON c'è sessione subito
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        alert("Account creato ✅ Controlla la mail per confermare l’account.");
        setMode("login");
        return;
      }

      onLogin(role);
      router.replace(role === "employer" ? "/employer" : "/");
    } catch (e: any) {
      alert(e?.message ?? "Errore");
    } finally {
      setLoading(false);
    }
  });

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";

return (
  <>
    {/* Badge versione */}
    <div className="fixed top-3 left-3 z-50">
      <div
        className="
          px-3 py-1
          text-xs font-semibold
          rounded-lg
          bg-black/70
          text-white
          backdrop-blur
          shadow
        "
      >
        {APP_VERSION}
      </div>
    </div>

    <Paper
      radius="32px"
      p={30}
      withBorder
      shadow="xl"
      style={{ border: "1px solid #f1f5f9" }}
    >
      {/* Header */}
      <Stack align="center" gap={5} mb="xl">
        <Title order={2} fw={900} style={{ letterSpacing: "-1.5px" }}>
          extra<span className="text-emerald-500">Job</span>
        </Title>
        <Text size="sm" c="dimmed" fw={500}>
          {mode === "login"
            ? "Bentornato su extraJob"
            : "Crea il tuo profilo gratuito"}
        </Text>
      </Stack>

      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          {!lockRole && (
            <Box>
              <Text
                size="xs"
                fw={700}
                c="dimmed"
                mb={8}
                ml={4}
                style={{ textTransform: "uppercase", letterSpacing: "0.5px" }}
              >
                Sei un...
              </Text>
              <SegmentedControl
                fullWidth
                radius="xl"
                size="md"
                value={role}
                onChange={(v) => setRole(v as UserRole)}
                color={primaryColor}
                data={[
                  { label: "👷 Lavoratore", value: "worker" },
                  { label: "🏢 Datore", value: "employer" },
                ]}
              />
            </Box>
          )}

          {/* Google */}
          <Button
            variant="default"
            radius="xl"
            size="lg"
            fullWidth
            leftSection={<FcGoogle size={20} />}
            onClick={loginWithGoogle}
            loading={loading}
            styles={{
              root: {
                border: "1px solid #e5e7eb",
                backgroundColor: "white",
                fontWeight: 600,
              },
            }}
          >
            Continua con Google
          </Button>

          <Divider label="oppure" labelPosition="center" />

          {/* Campi Registrazione */}
          {mode === "register" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Stack gap="md">
                <Group grow gap="xs">
                  <TextInput
                    label="Nome"
                    placeholder="Mario"
                    radius="md"
                    variant="filled"
                    {...form.getInputProps("name")}
                  />
                  <TextInput
                    label="Cognome"
                    placeholder="Rossi"
                    radius="md"
                    variant="filled"
                    {...form.getInputProps("surname")}
                  />
                </Group>

                <TextInput
                  label="Telefono (WhatsApp)"
                  placeholder="+39 333 1234567"
                  radius="md"
                  variant="filled"
                  {...form.getInputProps("phone")}
                />
              </Stack>
            </motion.div>
          )}

          {/* Email/Password */}
          <TextInput
            label="Email"
            placeholder="mario@email.com"
            radius="md"
            variant="filled"
            {...form.getInputProps("email")}
          />

          <PasswordInput
            label="Password"
            placeholder="••••••••"
            radius="md"
            variant="filled"
            {...form.getInputProps("password")}
          />

          {/* Submit */}
          <Button
            radius="xl"
            size="lg"
            fullWidth
            loading={loading}
            type="submit"
            color={primaryColor}
            h={54}
            style={{ transition: "all 0.2s ease" }}
          >
            {mode === "login" ? "Accedi" : "Registrati ora"}
          </Button>

          {/* Switch mode */}
          <Center>
            <Text size="sm" fw={500}>
              {mode === "login" ? "Non hai un account?" : "Sei già iscritto?"}{" "}
              <Anchor
                component="button"
                type="button"
                fw={700}
                color={primaryColor}
                onClick={() =>
                  setMode(mode === "login" ? "register" : "login")
                }
              >
                {mode === "login" ? "Registrati" : "Accedi"}
              </Anchor>
            </Text>
          </Center>
        </Stack>
      </form>
    </Paper>
  </>
);} 