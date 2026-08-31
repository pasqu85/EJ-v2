"use client";

import { useState } from "react";
import { 
  Container, 
  Title, 
  Text, 
  SimpleGrid, 
  Paper, 
  Avatar, 
  Group, 
  Badge, 
  Button, 
  Stack, 
  TextInput,
  Box,
  Divider
} from "@mantine/core";
import { 
  IconSearch, 
  IconChevronRight,
  IconArrowLeft,
  IconCertificate
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const MOCK_TRAINERS = [
  {
    id: "1",
    name: "Marco Rossi",
    specialization: "Head Barman",
    bio: "Esperto nella formazione di personale di sala e bancone per strutture di lusso. Ti aiuto a padroneggiare la mixology e la gestione degli ordini.",
    price: 45,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop"
  },
  {
    id: "2",
    name: "Sofia Bianchi",
    specialization: "Chef de Rang",
    bio: "Formazione intensiva su portamento, gestione dei reclami e tecniche di vendita in sala. Ideale per chi vuole entrare in ristoranti stellati.",
    price: 35,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
  }
];

export default function TrainerMarketplace() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  return (
    <Box className="bg-[#f8fafc] min-h-screen pb-32">
      {/* HEADER */}
      <Box className="bg-white border-b border-slate-100 sticky top-0 z-20">
        <Container size="sm" py="lg">
          <Group mb="md">
             <ActionIcon variant="subtle" color="gray" onClick={() => router.back()} radius="xl">
                <IconArrowLeft size={20} />
             </ActionIcon>
             <Title order={3} className="font-black tracking-tight">Mentoring & Training</Title>
          </Group>

          <TextInput
            placeholder="Cerca specializzazione o nome..."
            radius="xl"
            size="md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="shadow-sm"
          />
        </Container>
      </Box>

      <Container size="sm" py="xl">
        <Stack gap="md">
          {MOCK_TRAINERS.map((trainer) => (
            <Paper 
              key={trainer.id} 
              p="xl" 
              radius="32px" 
              className="border-none shadow-sm hover:shadow-md transition-all"
            >
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Group gap="lg">
                  <Avatar src={trainer.image} size={70} radius="20px" />
                  <Box>
                    <Text fw={900} size="lg" mb={2}>{trainer.name}</Text>
                    <Group gap={6}>
                       <IconCertificate size={14} className="text-blue-500" />
                       <Text fw={700} size="xs" color="blue" className="uppercase tracking-wider">
                          {trainer.specialization}
                       </Text>
                    </Group>
                  </Box>
                </Group>

                <Box className="text-right">
                   <Text fw={900} size="xl" color="dark">€{trainer.price}</Text>
                   <Text size="xs" color="dimmed" fw={600}>sessione</Text>
                </Box>
              </Group>

              <Text size="sm" color="slate.6" mt="xl" className="leading-relaxed font-medium">
                {trainer.bio}
              </Text>

              <Divider my="xl" color="slate.1" variant="dashed" />

              <Button 
                fullWidth
                size="md"
                variant="light" 
                radius="xl" 
                rightSection={<IconChevronRight size={14}/>}
                className="font-bold"
                onClick={() => router.push(`/trainers/${trainer.id}`)}
              >
                Visualizza Profilo e Prenota
              </Button>
            </Paper>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}

// Helper per l'ActionIcon di Mantine se non importata
function ActionIcon({ children, variant, color, onClick, radius }: any) {
    return (
        <button 
            onClick={onClick}
            className={`p-2 transition-colors rounded-full ${variant === 'subtle' ? 'hover:bg-slate-100 text-slate-500' : ''}`}
        >
            {children}
        </button>
    )
}