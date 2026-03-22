"use client";

import { 
  Paper, 
  Text, 
  Group, 
  Stack, 
  Badge, 
  Button, 
  Box 
} from "@mantine/core";
import { 
  IconMapPin, 
  IconCalendarEvent, 
  IconCheck, 
  IconClock // NUOVO: aggiungi questo import
} from "@tabler/icons-react";

type Job = {
  id: string;
  role: string;
  location: string;
  startDate: Date;
  endDate: Date;
  pay: string;
  business_name?: string; // NUOVO: aggiungiamo il nome dell'attività
};

type JobCardProps = Job & {
  isLoggedIn: boolean;
  appliedJobs: string[];
  onApply: (id: string) => void;
};

// Funzione di utilità per il calcolo delle ore
const calcolaOre = (inizio: any, fine: any) => {
  const start = new Date(inizio);
  const end = new Date(fine);
  const diffInMs = end.getTime() - start.getTime();
  const ore = diffInMs / (1000 * 60 * 60);
  return ore > 0 ? ore.toFixed(1) : "N/D";
};

export default function JobCard({
  id,
  role,
  location,
  startDate,
  endDate,
  pay,
  business_name, // NUOVO: recuperiamo il nome dalle props
  isLoggedIn,
  appliedJobs,
  onApply,
}: JobCardProps) {
  const alreadyApplied = appliedJobs.includes(id);

  const formatDate = (date: any) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Paper
      withBorder
      radius="24px"
      p="md"
      mb="sm"
      shadow="xs"
      style={{
        transition: "all 0.2s ease",
        cursor: "pointer",
        backgroundColor: alreadyApplied ? "#f8fafc" : "white",
        borderColor: alreadyApplied ? "#e2e8f0" : "#f1f5f9",
      }}
      className="hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"
    >
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <Stack gap={4} style={{ flex: 1 }}>
          
          {/* NUOVO: Nome attività in piccolo sopra il ruolo */}
          <Text size="xs" fw={800} c="blue.6" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {business_name || "Privato"}
          </Text>

          <Group gap={8}>
            <Title order={4} fw={800} style={{ letterSpacing: "-0.5px" }}>
              {role}
            </Title>
            {alreadyApplied && (
              <Badge color="teal" variant="light" size="sm" leftSection={<IconCheck size={12} />}>
                Inviata
              </Badge>
            )}
          </Group>

          <Group gap={4} c="dimmed">
            <IconMapPin size={14} stroke={2} />
            <Text size="xs" fw={500}>{location}</Text>
          </Group>

          <Group gap={12} mt={6}>
            <Group gap={4}>
              <IconCalendarEvent size={14} color="#10b981" />
              <Text size="xs" fw={700} c="slate.7">
                {formatDate(startDate)}
              </Text>
            </Group>
            <Text size="xs" c="dimmed" fw={500}>—</Text>
            <Text size="xs" fw={700} c="slate.7">
                {/* Visualizza solo l'orario di fine */}
                {new Date(endDate).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </Group>
        </Stack>

        <Stack align="flex-end" gap={8}>
          {/* NUOVO: Badge ore totali */}
          <Badge variant="dot" color="gray" size="sm">
            {calcolaOre(startDate, endDate)} ore
          </Badge>
          
          <Box
            style={{
              backgroundColor: "#ecfdf5",
              padding: "4px 12px",
              borderRadius: "12px",
              border: "1px solid #10b98120"
            }}
          >
            <Text fw={900} c="green.9" size="md">
              {pay}€/h
            </Text>
          </Box>
        </Stack>
      </Group>

      {!alreadyApplied && (
        <Button
          fullWidth
          radius="xl"
          mt="md"
          size="sm"
          variant="light"
          color="green"
          onClick={async (e) => {
            e.stopPropagation();
            if (!isLoggedIn) return alert("Accedi per candidarti");
            try {
              await onApply(id);
              window.dispatchEvent(new Event("applications-updated"));
            } catch (err: any) {
              alert(err?.message ?? "Errore candidatura");
            }
          }}
          style={{ height: 40, fontWeight: 700 }}
        >
          Candidati Ora
        </Button>
      )}
    </Paper>
  );
}

function Title({ children, style }: any) {
    return <h3 style={{ margin: 0, ...style }}>{children}</h3>;
}