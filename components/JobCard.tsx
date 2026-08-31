"use client";

import { useState } from "react";
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
  IconCheck 
} from "@tabler/icons-react";

type Job = {
  id: string;
  role: string;
  location: string;
  startDate: Date;
  endDate: Date;
  pay: string;
  business_name?: string;
};

type JobCardProps = Job & {
  isLoggedIn: boolean;
  appliedJobs: string[];
  onApply: (id: string) => void;
};

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
  business_name,
  isLoggedIn,
  appliedJobs,
  onApply,
}: JobCardProps) {
  const alreadyApplied = appliedJobs.includes(id);

  // STATI PER L'OSCILLAZIONE 3D (ZOMM PORTATO A 1.01)
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const isTilting = rotateX !== 0 || rotateY !== 0;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = x / rect.width - 0.5;
    const centerY = y / rect.height - 0.5;

    const maxTilt = 8; // Abbassato leggermente a 15 per evitare distorsioni esagerate dei testi

    setRotateX(-centerY * maxTilt);
    setRotateY(centerX * maxTilt);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

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
      p="xl" // Portato a xl per dare più respiro interno ed evitare che tocchi i bordi
      mb="md"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        cursor: "pointer",
        backgroundColor: alreadyApplied ? "#f8fafc" : "white",
        borderColor: alreadyApplied ? "#e2e8f0" : "#f1f5f9",
        overflow: "hidden", // EVITA LA FUORIUSCITA VISIVA DELLE SCRITTE
        
        // ZOOM SCALATO A 1.01 (MENO INVASIVO)
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${isTilting ? 1.01 : 1}, ${isTilting ? 1.01 : 1}, 1)`,
        transformStyle: "preserve-3d",
        WebkitTransformStyle: "preserve-3d",
        boxShadow: isTilting 
          ? "0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.08)" 
          : "0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)",
        
        transition: isTilting 
          ? "transform 0.05s ease-out, box-shadow 0.1s ease" 
          : "transform 0.4s ease, box-shadow 0.4s ease",
      }}
    >
      {/* CONTENITORE GRUPPO PRINCIPALE */}
      <Group justify="space-between" wrap="nowrap" align="flex-start" style={{ transformStyle: "preserve-3d" }}>
        
        {/* PARALLASSE LEGGERO LATO SINISTRO (PROVENIENTI A UN LIVELLO PIÙ SICURO DI Z) */}
        <Stack gap={6} style={{ flex: 1, transform: "translateZ(10px)", transformStyle: "preserve-3d" }}>
          
          <Text size="xs" fw={800} c="blue.6" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {business_name || "Privato"}
          </Text>

          <Group gap={8} wrap="wrap">
            <Title order={4} fw={800} style={{ letterSpacing: "-0.5px", margin: 0 }}>
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

          <Group gap={12} mt={4}>
            <Group gap={4}>
              <IconCalendarEvent size={14} color="#10b981" />
              <Text size="xs" fw={700} c="slate.7">
                {formatDate(startDate)}
              </Text>
            </Group>
            <Text size="xs" c="dimmed" fw={500}>—</Text>
            <Text size="xs" fw={700} c="slate.7">
                {new Date(endDate).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
              </Text>
          </Group>
        </Stack>

        {/* PARALLASSE LATO DESTRO */}
        <Stack align="flex-end" gap={8} style={{ transform: "translateZ(15px)", flexShrink: 0 }}>
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

      {/* PULSANTE INTEGRATO NEL FLUSSO DELLA CARD IN BASSO */}
      {!alreadyApplied && (
        <Button
          fullWidth
          radius="xl"
          mt="lg"
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
          style={{ 
            height: 42, 
            fontWeight: 700,
            transform: "translateZ(8px)",
          }}
          className="active:scale-[0.98] transition-transform"
        >
          Candidati Ora
        </Button>
      )}
    </Paper>
  );
}

function Title({ children, style, order }: any) {
    return <h3 style={{ margin: 0, ...style }}>{children}</h3>;
}