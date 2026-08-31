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
  TextInput,
  Textarea,
  NumberInput,
  Button,
  Divider,
  Avatar,
} from "@mantine/core";
import {
  IconSchool,
  IconWallet,
  IconSettings,
  IconCalendarEvent,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { supabase } from "@/app/lib/supabaseClient";

export default function TrainerDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dati del Trainer (da salvare su DB nella tabella 'trainers')
  const [specialization, setSpecialization] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState<number | string>(30); // Prezzo finale per l'utente

  // La tua percentuale di commissione (es. 20%)
  const PLATFORM_FEE_PERCENT = 0.20;

  // Calcolo del guadagno netto del trainer
  const trainerNetEarnings = typeof hourlyRate === "number" 
    ? (hourlyRate * (1 - PLATFORM_FEE_PERCENT)).toFixed(2) 
    : "0.00";

  // Mock per le consulenze prenotate (da collegare a tabella 'consultations')
  const [appointments, setAppointments] = useState([
    { id: "1", studentName: "Luca Verdis", date: "Domani, ore 15:00", job: "Preparazione Barista" },
    { id: "2", studentName: "Elena Neri", date: "4 Giugno, ore 10:30", job: "Ripasso Sala/Mise en place" },
  ]);

useEffect(() => {
  async function initTrainer() {
    try {
      // 1. Controlliamo se Supabase vede qualcuno
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.log("Problema Auth:", authError);
        // Invece di fare router.replace("/"), per ora stampiamo solo l'errore
        // così puoi vedere la pagina anche se l'auth "balla"
        setLoading(false); 
        return;
      }

      console.log("Utente trovato:", user.email);

      // 2. Carichiamo i dati del trainer (usando maybeSingle per evitare crash)
      const { data: trainerData, error: dbError } = await supabase
        .from("trainers")
        .select("specialization, bio, hourly_rate")
        .eq("id", user.id)
        .maybeSingle();

      if (dbError) console.error("Errore DB Trainers:", dbError);

      if (trainerData) {
        setSpecialization(trainerData.specialization ?? "");
        setBio(trainerData.bio ?? "");
        setHourlyRate(trainerData.hourly_rate ?? 30);
      }

    } catch (error) {
      console.error("Errore catch:", error);
    } finally {
      setLoading(false);
    }
  }

  initTrainer();
}, [router]);
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("trainers")
        .upsert({
          id: user.id,
          specialization: specialization.trim(),
          bio: bio.trim(),
          hourly_rate: Number(hourlyRate),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      alert("Profilo aggiornato con successo! ✅");
    } catch (e: any) {
      alert(e.message ?? "Errore durante il salvataggio");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center font-bold text-slate-400 uppercase tracking-widest text-xs">
        Caricamento Dashboard…
      </div>
    );
  }

  return (
    <Box style={{ backgroundColor: "#f1f5f9", minHeight: "100vh", paddingBottom: 100 }}>
      {/* HEADER DELLA DASHBOARD */}
      <Box bg="white" py="md" style={{ borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 10 }}>
        <Container size="sm">
          <Group justify="space-between">
            <Group gap="sm">
              <Avatar color="blue" radius="xl"><IconSchool size={20} /></Avatar>
              <Box>
                <Title order={4} fw={900} style={{ lineHeight: 1.1 }}>Area Trainer</Title>
                <Text size="xs" color="dimmed" fw={600}>Gestisci le tue consulenze</Text>
              </Box>
            </Group>
            <Button size="xs" variant="subtle" color="red" onClick={async () => { await supabase.auth.signOut(); router.replace("/"); }}>
              Esci
            </Button>
          </Group>
        </Container>
      </Box>

      <Container size="sm" py="xl">
        <Stack gap="xl">
          
          {/* SEZIONE GUADAGNI */}
          <Paper p="xl" radius="lg" withBorder shadow="sm" style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", color: "white" }}>
            <Group justify="space-between">
              <Stack gap={2}>
                <Group gap={6}>
                  <IconWallet size={18} className="text-blue-400" />
                  <Text size="xs" fw={700} className="uppercase tracking-wider text-slate-400">Il tuo portafoglio</Text>
                </Group>
                <Title order={2} fw={900}>€0,00</Title>
              </Stack>
              <Box className="text-right">
                <Text size="xs" color="slate-400" fw={600}>Commissione piattaforma</Text>
                <Text size="sm" fw={800} className="text-blue-400">{(PLATFORM_FEE_PERCENT * 100)}% inclusa</Text>
              </Box>
            </Group>
          </Paper>

          {/* PROFILO PUBBLICO (COSA VEDONO GLI UTENTI) */}
          <Paper p="xl" radius="lg" withBorder shadow="sm">
            <Group mb="lg">
              <IconSettings color="#3b82f6" stroke={1.5} />
              <Title order={5} fw={700}>Configura Profilo Pubblico</Title>
            </Group>

            <Stack gap="md">
              <TextInput
                label="La tua Specializzazione"
                placeholder="es. Head Barman, Sommelier, Chef de Rang"
                value={specialization}
                onChange={(e) => setSpecialization(e.currentTarget.value)}
                radius="md"
              />

              <Textarea
                label="Presentazione (Bio)"
                placeholder="Descrivi la tua esperienza e come puoi aiutare i lavoratori a prepararsi..."
                value={bio}
                onChange={(e) => setBio(e.currentTarget.value)}
                radius="md"
                minRows={3}
              />

              <Group grow align="flex-start">
                <NumberInput
                  label="Prezzo a sessione (€)"
                  placeholder="Es. 40"
                  value={hourlyRate}
                  onChange={(val) => setHourlyRate(val)}
                  radius="md"
                  min={10}
                />
                
                {/* Visualizzazione trasparente del netto */}
                <Box className="bg-slate-50 border border-slate-200 rounded-xl p-3 h-[68px] flex flex-col justify-center">
                  <Text size="xs" color="dimmed" fw={700} className="uppercase">Il tuo guadagno netto</Text>
                  <Text fw={900} size="md" color="emerald.7">€{trainerNetEarnings} / sessione</Text>
                </Box>
              </Group>

              <Button
                leftSection={<IconDeviceFloppy size={18} />}
                radius="xl"
                onClick={handleSaveProfile}
                loading={saving}
                mt="sm"
              >
                Salva modifiche profilo
              </Button>
            </Stack>
          </Paper>

          {/* CONSULENZE PRENOTATE */}
          <Paper p="xl" radius="lg" withBorder shadow="sm">
            <Group mb="lg">
              <IconCalendarEvent color="#10b981" stroke={1.5} />
              <Title order={5} fw={700}>Prossimi Appuntamenti</Title>
            </Group>

            <Stack gap="sm">
              {appointments.length === 0 ? (
                <Text size="sm" color="dimmed">Non hai ancora nessuna prenotazione attiva.</Text>
              ) : (
                appointments.map((app) => (
                  <Group key={app.id} justify="space-between" p="sm" className="bg-slate-50 rounded-xl border border-slate-100">
                    <Box>
                      <Text fw={700} size="sm">{app.studentName}</Text>
                      <Text size="xs" color="blue" fw={600}>{app.job}</Text>
                    </Box>
                    <Box className="text-right">
                      <Text size="xs" fw={700} color="dark">{app.date}</Text>
                    </Box>
                  </Group>
                ))
              )}
            </Stack>
          </Paper>

        </Stack>
      </Container>
    </Box>
  );
}