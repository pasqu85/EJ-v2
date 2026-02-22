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

import { supabase } from "@/app/lib/supabaseClient";
import { STORAGE_KEYS } from "@/app/lib/storageKeys";
import { IconPhone, IconMail, IconLock } from "@tabler/icons-react";
import { motion } from "framer-motion";

type UserRole = "worker" | "employer";

type Props = {
  onLogin: (role: UserRole) => void;
  defaultRole?: UserRole;
  lockRole?: boolean;
};

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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data.user;
  };

  const loginWithGoogle = async () => {
  try {
    setLoading(true);

    // salva ruolo scelto prima del redirect OAuth
    localStorage.setItem("EXTRAJOB_PENDING_ROLE", role);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) throw error;
  } catch (e: any) {
    alert(e?.message ?? "Errore login Google");
    setLoading(false);
  }
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
      },
    });

    if (error) throw error;

    const loginWithGoogle = async () => {
  setLoading(true);

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  });

  if (error) {
    alert(error.message);
    setLoading(false);
  }
};

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

      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        alert(
          "Account creato ✅ (Se hai attivato conferma email, controlla la posta)"
        );
        setMode("login");
        return;
      }

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
    <Paper radius="32px" p={30} withBorder shadow="xl" style={{ border: '1px solid #f1f5f9' }}>
  {/* Header del Box */}
  <Stack align="center" gap={5} mb="xl">
    <Title order={2} fw={900} style={{ letterSpacing: '-1.5px' }}>
      extra<span className="text-emerald-500">Job</span>
    </Title>
    <Text size="sm" c="dimmed" fw={500}>
      {mode === "login" ? "Bentornato su extraJob" : "Crea il tuo profilo gratuito"}
    </Text>
  </Stack>

  <form onSubmit={handleSubmit}>
    <Stack gap="lg">
      
      {/* Selettore Ruolo - Elegante e unico */}
      {!lockRole && (
        <Box>
          <Text size="xs" fw={700} c="dimmed" mb={8} ml={4} style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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

      {/* Campi Registrazione con icone */}
      {mode === "register" && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
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

      {/* Campi Login standard */}
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

      {/* <Button
  variant="light"
  radius="xl"
  size="lg"
  fullWidth
  onClick={loginWithGoogle}
  loading={loading}
>
  Continua con Google
</Button> */}

<Button
  variant="default"
  radius="xl"
  size="lg"
  fullWidth
  leftSection={<FcGoogle size={20} />}
  onClick={loginWithGoogle}
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

      {/* Pulsante d'azione principale */}
      <Button
        radius="xl"
        size="lg"
        fullWidth
        loading={loading}
        type="submit"
        color={primaryColor}
        h={54}
        className="shadow-lg shadow-emerald-100" // o shadow-blue-100 se employer
        style={{ transition: 'all 0.2s ease' }}
      >
        {mode === "login" ? "Accedi" : "Registrati ora"}
      </Button>

      {/* Switcher Modalità */}
      <Divider label="oppure" labelPosition="center" />

      <Center>
        <Text size="sm" fw={500}>
          {mode === "login" ? "Non hai un account?" : "Sei già iscritto?"}{" "}
          <Anchor 
            component="button" 
            type="button" 
            fw={700} 
            color={primaryColor}
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Registrati" : "Accedi"}
          </Anchor>
        </Text>
      </Center>
    </Stack>
  </form>
</Paper>
  );
}