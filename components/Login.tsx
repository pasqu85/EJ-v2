"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@mantine/form";
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
} from "@mantine/core";

import { supabase } from "@/app/lib/supabaseClient";
import { STORAGE_KEYS } from "@/app/lib/storageKeys";

type UserRole = "worker" | "employer";

async function ensureProfile(
  userId: string,
  payload: { role: UserRole; name: string; surname: string; phone: string }
) {
  // upsert: se esiste aggiorna, se non esiste crea
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

async function getMyRole(): Promise<UserRole | null> {
  const { data: u } = await supabase.auth.getUser();
  const user = u.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error) return null;
  return (data?.role as UserRole) ?? null;
}

export default function Login({ onLogin }: { onLogin: (role: UserRole) => void }) {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<UserRole>("worker");
  const [loading, setLoading] = useState(false);

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
      // obbligatori solo in registrazione
      name: (v) => (mode === "register" && !v.trim() ? "Nome obbligatorio" : null),
      surname: (v) =>
        mode === "register" && !v.trim() ? "Cognome obbligatorio" : null,
      phone: (v) =>
        mode === "register" && !v.trim() ? "Telefono obbligatorio" : null,
    },
  });

  // quando cambi modalità, pulisci errori (evita “rimangono rossi”)
  useEffect(() => {
    form.clearErrors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // opzionale: se l’utente è già loggato, porta nella pagina giusta
  useEffect(() => {
    let alive = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!alive) return;
      if (!data.session) return;

      const r = await getMyRole();
      if (!alive) return;
      if (!r) return;

      // storage UI (finché ti serve)
      localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, "true");
      localStorage.setItem(STORAGE_KEYS.USER_ROLE, r);
      window.dispatchEvent(new Event("auth-change"));

      onLogin(r);
      router.replace(r === "employer" ? "/employer" : "/");
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doLogin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
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
        // Se hai conferma email attiva, puoi impostare dove tornare:
        // emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) throw error;

    const userId = data.user?.id;
    if (userId) {
      await ensureProfile(userId, {
        role: payload.role,
        name: payload.name,
        surname: payload.surname,
        phone: payload.phone,
      });
    }

    return data.user;
  };

  const handleSubmit = form.onSubmit(async (values) => {
    setLoading(true);

    try {
      const email = values.email.trim().toLowerCase();
      const password = values.password;

      if (mode === "login") {
        await doLogin(email, password);

        const r = await getMyRole();
        const finalRole: UserRole = r ?? role;

        // storage UI (finché tieni l’app così)
        localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, "true");
        localStorage.setItem(STORAGE_KEYS.USER_ROLE, finalRole);
        window.dispatchEvent(new Event("auth-change"));

        onLogin(finalRole);
        router.replace(finalRole === "employer" ? "/employer" : "/");
        return;
      }

      // register
      const name = (values.name ?? "").trim();
      const surname = (values.surname ?? "").trim();
      const phone = (values.phone ?? "").trim();

      await doRegister({ email, password, name, surname, phone, role });

      // Se conferma email è attiva: session può non esistere
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        alert("Account creato ✅ (Se hai attivato conferma email, controlla la posta)");
        setMode("login");
        return;
      }

      // se c’è sessione, vai avanti
      localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, "true");
      localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
      window.dispatchEvent(new Event("auth-change"));

      onLogin(role);
      router.replace(role === "employer" ? "/employer" : "/");
    } catch (e: any) {
      alert(e?.message ?? "Errore");
    } finally {
      setLoading(false);
    }
  });

  return (
    <Paper radius="xl" p="lg" withBorder shadow="sm">
      <Group justify="space-between" align="center">
        <Title order={3}>extraJob</Title>

        <SegmentedControl
          value={mode}
          onChange={(v: any) => setMode(v)}
          data={[
            { label: "Login", value: "login" },
            { label: "Registrati", value: "register" },
          ]}
        />
      </Group>

      <Divider my="md" />

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <SegmentedControl
            value={role}
            onChange={(v: any) => setRole(v)}
            data={[
              { label: "👷 Worker", value: "worker" },
              { label: "🏢 Datore", value: "employer" },
            ]}
          />

          {mode === "register" && (
            <>
              <Group grow>
                <TextInput label="Nome" placeholder="Mario" {...form.getInputProps("name")} />
                <TextInput
                  label="Cognome"
                  placeholder="Rossi"
                  {...form.getInputProps("surname")}
                />
              </Group>

              <TextInput
                label="Telefono (WhatsApp)"
                placeholder="+39 333 1234567"
                {...form.getInputProps("phone")}
              />
            </>
          )}

          <TextInput label="Email" placeholder="mario@email.com" {...form.getInputProps("email")} />

          <PasswordInput
            label="Password"
            placeholder="••••••••"
            {...form.getInputProps("password")}
          />

          <Button radius="xl" size="lg" loading={loading} type="submit">
            {mode === "login" ? "Accedi" : "Crea account"}
          </Button>

          <Text size="xs" c="dimmed" ta="center">
            {mode === "register"
              ? "Creando l’account accetti i Termini (mock)."
              : "Se non hai un account, vai su Registrati."}
          </Text>
        </Stack>
      </form>
    </Paper>
  );
}