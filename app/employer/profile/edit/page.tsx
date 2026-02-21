"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Title,
  TextInput,
  Button,
  Paper,
  Stack,
  Group,
  ActionIcon,
  Divider,
  PasswordInput,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconBuildingCommunity,
  IconUser,
  IconPlus,
  IconStar,
  IconTrash,
} from "@tabler/icons-react";
import { supabase } from "@/app/lib/supabaseClient";

type Business = {
  id: string;
  name: string;
  type: string | null;
  address: string;
  is_default: boolean;
};

type ProfileRow = {
  id: string;
  role: "worker" | "employer";
  phone: string | null;
};

export default function EmployerEditProfilePage() {
  const router = useRouter();

  // account
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(""); // mostrare email corrente
  const [password, setPassword] = useState(""); // solo per “cambio password”

  // businesses stored (DB)
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const defaultBusinessId = useMemo(
    () => businesses.find((b) => b.is_default)?.id,
    [businesses]
  );

  // form per nuova attività
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(true);

  // -----------------------------
  // LOAD FROM DB (NO LOCALSTORAGE)
  // -----------------------------
  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const {
          data: { user },
          error: uErr,
        } = await supabase.auth.getUser();
        if (uErr) throw uErr;

        if (!user) {
          router.replace("/");
          return;
        }

        // controlla role
        const { data: profile, error: pErr } = await supabase
          .from("profiles")
          .select("id, role, phone")
          .eq("id", user.id)
          .single<ProfileRow>();

        if (pErr) throw pErr;

        if (profile.role !== "employer") {
          router.replace("/");
          return;
        }

        // carica businesses
        const { data: biz, error: bErr } = await supabase
          .from("businesses")
          .select("id, name, type, address, is_default")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false });

        if (bErr) throw bErr;

        if (!alive) return;

        setPhone(profile.phone ?? "");
        setEmail(user.email ?? "");
        setPassword("");

        setBusinesses((biz ?? []) as Business[]);
        setBusinessName("");
        setBusinessType("");
        setAddress("");
      } catch (e: any) {
        alert(e?.message ?? "Errore caricamento profilo");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [router]);

  // -----------------------------
  // DB ACTIONS
  // -----------------------------
  async function refreshBusinesses() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("businesses")
      .select("id, name, type, address, is_default")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    setBusinesses((data ?? []) as Business[]);
  }

  const addNewBusiness = async () => {
    try {
      if (!businessName.trim() || !address.trim()) {
        alert("Inserisci almeno Nome attività e Indirizzo");
        return;
      }

      const {
        data: { user },
        error: uErr,
      } = await supabase.auth.getUser();
      if (uErr) throw uErr;
      if (!user) throw new Error("Non sei loggato");

      // Se è la prima attività, la rendiamo default.
      const makeDefault = businesses.length === 0;

      const { error: insErr } = await supabase.from("businesses").insert({
        owner_id: user.id,
        name: businessName.trim(),
        type: businessType.trim() || null,
        address: address.trim(),
        is_default: makeDefault,
      });

      if (insErr) throw insErr;

      // reset form
      setBusinessName("");
      setBusinessType("");
      setAddress("");

      await refreshBusinesses();
      alert("Attività salvata ✅");
    } catch (e: any) {
      alert(e?.message ?? "Errore salvataggio attività");
    }
  };

  const removeBusiness = async (id: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Non sei loggato");

      const deletingWasDefault = businesses.find((b) => b.id === id)?.is_default;

      const { error } = await supabase
        .from("businesses")
        .delete()
        .eq("id", id)
        .eq("owner_id", user.id);

      if (error) throw error;

      // se hai eliminato la default, imposta default la prima rimasta
      if (deletingWasDefault) {
        const { data: remaining, error: rErr } = await supabase
          .from("businesses")
          .select("id")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (rErr) throw rErr;

        const nextDefaultId = remaining?.[0]?.id;
        if (nextDefaultId) {
          // set default
          await supabase
            .from("businesses")
            .update({ is_default: true })
            .eq("id", nextDefaultId)
            .eq("owner_id", user.id);
        }
      }

      await refreshBusinesses();
    } catch (e: any) {
      alert(e?.message ?? "Errore eliminazione attività");
    }
  };

  const setDefault = async (id: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Non sei loggato");

      // 1) spegni tutte
      const { error: offErr } = await supabase
        .from("businesses")
        .update({ is_default: false })
        .eq("owner_id", user.id);

      if (offErr) throw offErr;

      // 2) accendi quella scelta
      const { error: onErr } = await supabase
        .from("businesses")
        .update({ is_default: true })
        .eq("id", id)
        .eq("owner_id", user.id);

      if (onErr) throw onErr;

      await refreshBusinesses();
    } catch (e: any) {
      alert(e?.message ?? "Errore impostazione predefinita");
    }
  };

  // ✅ salva profilo SENZA obbligare email/password
  const onSaveAccountOnly = async () => {
    try {
      const {
        data: { user },
        error: uErr,
      } = await supabase.auth.getUser();
      if (uErr) throw uErr;
      if (!user) throw new Error("Non sei loggato");

      // aggiorna telefono in profiles
      const { error: pErr } = await supabase
        .from("profiles")
        .update({ phone: phone.trim() || null })
        .eq("id", user.id);

      if (pErr) throw pErr;

      // email/password: aggiorna SOLO se l’utente li ha cambiati
      // (non bloccare se sono vuoti)
      const nextEmail = email.trim().toLowerCase();
      const wantsEmailChange = nextEmail && nextEmail !== (user.email ?? "");
      const wantsPasswordChange = password.trim().length > 0;

      if (wantsEmailChange || wantsPasswordChange) {
        const updatePayload: { email?: string; password?: string } = {};
        if (wantsEmailChange) updatePayload.email = nextEmail;
        if (wantsPasswordChange) updatePayload.password = password.trim();

        const { error: aErr } = await supabase.auth.updateUser(updatePayload);
        if (aErr) throw aErr;

        // NB: se cambi email spesso supabase richiede conferma via mail
      }

      router.push("/employer/profile");
    } catch (e: any) {
      alert(e?.message ?? "Errore salvataggio profilo");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white border rounded-2xl px-5 py-4 shadow-sm">
          Caricamento…
        </div>
      </div>
    );
  }

  return (
    <Box style={{ backgroundColor: "#f1f5f9", minHeight: "100vh", paddingBottom: 100 }}>
      <Box
        bg="white"
        py="md"
        style={{ borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 10 }}
      >
        <Container size="sm">
          <Group justify="space-between">
            <ActionIcon variant="subtle" color="gray" onClick={() => router.back()} radius="xl">
              <IconArrowLeft size={20} />
            </ActionIcon>

            <Title order={4} fw={800}>Modifica Profilo Datore</Title>

            <Box w={34} />
          </Group>
        </Container>
      </Box>

      <Container size="sm" py="xl">
        <Stack gap="xl">
          {/* ATTIVITÀ */}
          <Paper p="xl" radius="lg" withBorder shadow="sm">
            <Group mb="lg">
              <IconBuildingCommunity color="#3b82f6" stroke={1.5} />
              <Title order={5} fw={700}>Dati dell&apos;Impresa</Title>
            </Group>

            {/* LISTA ATTIVITÀ */}
            <Stack gap="sm">
              {businesses.length === 0 ? (
                <div className="text-sm text-slate-500">
                  Nessuna attività salvata. Aggiungine una qui sotto.
                </div>
              ) : (
                businesses.map((b) => {
                  const isDef = b.is_default;
                  return (
                    <div
                      key={b.id}
                      className="bg-white rounded-xl border border-slate-200 p-3 flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{b.name}</div>
                        <div className="text-sm text-slate-500 truncate">{b.type ?? "Attività"}</div>
                        <div className="text-sm text-slate-600 truncate mt-1">{b.address}</div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <ActionIcon
                          variant={isDef ? "filled" : "subtle"}
                          color={isDef ? "yellow" : "gray"}
                          radius="xl"
                          onClick={() => setDefault(b.id)}
                          aria-label="Imposta come predefinita"
                        >
                          <IconStar size={18} />
                        </ActionIcon>

                        <ActionIcon
                          variant="subtle"
                          color="red"
                          radius="xl"
                          onClick={() => removeBusiness(b.id)}
                          aria-label="Elimina"
                        >
                          <IconTrash size={18} />
                        </ActionIcon>
                      </div>
                    </div>
                  );
                })
              )}
            </Stack>

            <Divider my="lg" />

            {/* FORM NUOVA ATTIVITÀ */}
            <Stack gap="md">
              <TextInput
                label="Nome attività"
                placeholder="es. Ristorante Da Mario"
                value={businessName}
                onChange={(e) => setBusinessName(e.currentTarget.value)}
                radius="md"
              />
              <TextInput
                label="Tipologia"
                placeholder="es. Hotel, Ristorante, Bar"
                value={businessType}
                onChange={(e) => setBusinessType(e.currentTarget.value)}
                radius="md"
              />
              <TextInput
                label="Indirizzo"
                placeholder="Via e numero civico, città"
                value={address}
                onChange={(e) => setAddress(e.currentTarget.value)}
                radius="md"
              />

              <Button
                leftSection={<IconPlus size={18} />}
                radius="xl"
                variant="light"
                onClick={addNewBusiness}
              >
                Aggiungi attività
              </Button>
            </Stack>
          </Paper>

          {/* ACCOUNT */}
          <Paper p="xl" radius="lg" withBorder shadow="sm">
            <Group mb="lg">
              <IconUser color="#10b981" stroke={1.5} />
              <Title order={5} fw={700}>Contatti e Accesso</Title>
            </Group>

            <Stack gap="md">
              <TextInput
                label="Telefono"
                placeholder="+39 333 ..."
                value={phone}
                onChange={(e) => setPhone(e.currentTarget.value)}
                radius="md"
              />

              <Divider label="Credenziali Login" labelPosition="center" my="sm" />

              <TextInput
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                radius="md"
              />
              <PasswordInput
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                radius="md"
              />
            </Stack>
          </Paper>

          {/* ACTIONS */}
          <Stack gap="sm">
            <Button
              size="lg"
              radius="xl"
              color="blue"
              onClick={onSaveAccountOnly}
              fullWidth
              style={{ boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)" }}
            >
              SALVA MODIFICHE
            </Button>

            <Button
              variant="subtle"
              color="gray"
              size="md"
              radius="xl"
              fullWidth
              onClick={() => router.push("/employer/profile")}
            >
              Annulla e torna indietro
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}