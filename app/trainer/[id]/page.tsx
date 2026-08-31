"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Container,
  Title,
  Text,
  Paper,
  Stack,
  Group,
  Button,
  Avatar,
  ActionIcon,
  Divider,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconCertificate,
  IconCalendarCheck,
  IconWallet,
} from "@tabler/icons-react";
import { supabase } from "@/app/lib/supabaseClient";

type TrainerProfile = {
  id: string;
  specialization: string;
  bio: string;
  hourly_rate: number;
  profiles: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
};

export default function TrainerPublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [trainer, setTrainer] = useState<TrainerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrainerProfile() {
      try {
        // Recuperiamo i dati del trainer facendo un JOIN con la tabella profiles per avere nome e cognome
        const { data, error } = await supabase
          .from("trainers")
          .select(`
            id,
            specialization,
            bio,
            hourly_rate,
            profiles (
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq("id", params.id)
          .single();

        if (error) throw error;
        setTrainer(data as unknown as TrainerProfile);
      } catch (err) {
        console.error("Errore caricamento profilo trainer:", err);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadTrainerProfile();
    }
  }, [params.id]);

  const handleBooking = () => {
    // Qui andrà l'integrazione di pagamento (es. reindirizzamento a checkout di Stripe)
    alert(`Reindirizzamento al pagamento di €${trainer?.hourly_rate} per la sessione con ${trainer?.profiles.first_name}`);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center font-bold text-slate-400 uppercase tracking-widest text-xs">
        Caricamento Profilo…
      </div>
    );
  }

  if (!trainer) {
    return (
      <Container size="sm" py="xl" className="text-center">
        <Text color="red" fw={700}>Trainer non trovato</Text>
        <Button onClick={() => router.back()} mt="md" variant="light">Torna indietro</Button>
      </Container>
    );
  }

  return (
    <Box style={{ backgroundColor: "#f8fafc", minHeight: "100vh", paddingBottom: 100 }}>
      {/* STICKY TOP BAR */}
      <Box bg="white" py="md" style={{ borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 10 }}>
        <Container size="sm">
          <Group justify="space-between">
            <ActionIcon variant="subtle" color="gray" onClick={() => router.back()} radius="xl">
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Title order={4} fw={900}>Profilo Trainer</Title>
            <Box w={34} /> {/* Bilanciatore spaziale */}
          </Group>
        </Container>
      </Box>

      <Container size="sm" py="xl">
        <Stack gap="lg">
          {/* CARD PRINCIPALE INFORMAZIONI */}
          <Paper p="xl" radius="32px" className="border-none shadow-sm bg-white">
            <Stack align="center" gap="md" className="text-center">
              <Avatar 
                src={trainer.profiles?.avatar_url} 
                size={100} 
                radius="32px" 
                className="shadow-md"
              />
              
              <Box>
                <Title order={3} fw={900}>
                  {trainer.profiles?.first_name} {trainer.profiles?.last_name}
                </Title>
                <Group gap={6} justify="center" mt={4}>
                  <IconCertificate size={16} className="text-blue-500" />
                  <Text fw={800} size="xs" color="blue" className="uppercase tracking-wider">
                    {trainer.specialization}
                  </Text>
                </Group>
              </Box>
            </Stack>

            <Divider my="xl" color="slate.1" />

            <Box>
              <Text fw={800} size="sm" color="dimmed" className="uppercase tracking-wider" mb="xs">
                Su di me
              </Text>
              <Text className="leading-relaxed text-slate-700 font-medium whitespace-pre-line">
                {trainer.bio || "Nessuna biografia inserita."}
              </Text>
            </Box>
          </Paper>

          {/* CARD PREZZO E PRENOTAZIONE */}
          <Paper p="xl" radius="32px" className="border-none shadow-sm bg-white">
            <Group justify="space-between" align="center">
              <Box>
                <Text size="xs" color="dimmed" fw={700} className="uppercase tracking-wider">
                  Costo Sessione
                </Text>
                <Group gap={4} align="flex-end">
                  <Title order={2} fw={900}>€{trainer.hourly_rate}</Title>
                  <Text size="sm" color="dimmed" fw={600} pb={4}>/ora</Text>
                </Group>
              </Box>

              <Button
                size="lg"
                radius="xl"
                color="blue"
                leftSection={<IconCalendarCheck size={20} />}
                className="font-bold px-8 shadow-sm hover:shadow-md transition-all"
                onClick={handleBooking}
              >
                Prenota Ora
              </Button>
            </Group>
          </Paper>

        </Stack>
      </Container>
    </Box>
  );
}