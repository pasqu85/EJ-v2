'use client';

import { Container, Title, Text, Button, Card, Badge, Group, Paper, Box, Stack } from '@mantine/core';
import { IconClock, IconMapPin, IconBolt } from '@tabler/icons-react';

export default function TestPage() {
  return (
    <Box style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f1f5f9',
      backgroundImage: 'radial-gradient(at 0% 0%, rgba(20, 184, 166, 0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(59, 130, 246, 0.05) 0px, transparent 50%)',
    }}>
      
      {/* --- HEADER --- */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        padding: '12px 0'
      }}>
        <Container size="md">
          <Group justify="space-between">
            <Title order={3} style={{ letterSpacing: '-1px', fontWeight: 900 }}>
              EXTRA<span style={{ color: '#0d9488' }}>JOB</span>
            </Title>
            <Group gap="xs" visibleFrom="sm">
              <Button variant="subtle" color="gray" size="xs">Cerca</Button>
              <Button variant="subtle" color="gray" size="xs">I miei turni</Button>
              <Button color="dark" radius="xl" size="xs">Profilo</Button>
            </Group>
            <Box hiddenFrom="sm" style={{ width: 35, height: 35, borderRadius: '50%', background: 'linear-gradient(45deg, #0d9488, #3b82f6)' }} />
          </Group>
        </Container>
      </header>

      <Container size="sm" py="xl">
        
        {/* --- HERO --- */}
        <Box py={40} style={{ textAlign: 'center' }}>
          <Badge color="teal" variant="light" mb="md" size="lg" radius="sm">
            Novità: Pagamenti istantanei attivi ⚡
          </Badge>
          <Title order={1} style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.1 }}>
            Trova il tuo prossimo <br />
            <span style={{ color: '#3b82f6' }}>Extra in pochi secondi.</span>
          </Title>
          <Text c="dimmed" mt="md" size="lg">
            Sfoglia le offerte disponibili stasera nella tua città.
          </Text>
        </Box>

        {/* --- JOB CARD --- */}
        <Card shadow="xl" padding="xl" radius="lg" withBorder>
          <Group justify="space-between" mb="lg">
            <Stack gap={0}>
                <Badge color="blue" variant="filled" mb={5} w="fit-content">HOT JOB</Badge>
                <Title order={3}>Chef de Rang</Title>
                <Group gap={5} mt={5}>
                    <IconMapPin size={14} color="gray" />
                    <Text size="sm" c="dimmed">Milano, Zona Duomo</Text>
                </Group>
            </Stack>
            <Box style={{ textAlign: 'right' }}>
                <Text fw={900} size="xl" c="teal.7">€85</Text>
                <Text size="xs" c="dimmed" fw={700}>NETTI / 6H</Text>
            </Box>
          </Group>

          <Paper withBorder p="sm" radius="md" mb="lg" bg="gray.0">
            <Group grow>
                <Stack gap={0}>
                    <Text size="xs" fw={700} c="dimmed">DATA</Text>
                    <Text size="sm" fw={600}>Oggi, 18 Gen</Text>
                </Stack>
                <Stack gap={0}>
                    <Text size="xs" fw={700} c="dimmed">ORARIO</Text>
                    <Text size="sm" fw={600}>17:30 - 23:30</Text>
                </Stack>
            </Group>
          </Paper>

          <Button 
            fullWidth 
            size="lg" 
            radius="md" 
            color="teal"
            leftSection={<IconBolt size={18} />}
          >
            Candidatura Rapida
          </Button>
        </Card>
                <Card shadow="xl" padding="xl" radius="lg" withBorder>
          <Group justify="space-between" mb="lg">
            <Stack gap={0}>
                <Badge color="blue" variant="filled" mb={5} w="fit-content">HOT JOB</Badge>
                <Title order={3}>Chef de Rang</Title>
                <Group gap={5} mt={5}>
                    <IconMapPin size={14} color="gray" />
                    <Text size="sm" c="dimmed">Milano, Zona Duomo</Text>
                </Group>
            </Stack>
            <Box style={{ textAlign: 'right' }}>
                <Text fw={900} size="xl" c="teal.7">€85</Text>
                <Text size="xs" c="dimmed" fw={700}>NETTI / 6H</Text>
            </Box>
          </Group>

          <Paper withBorder p="sm" radius="md" mb="lg" bg="gray.0">
            <Group grow>
                <Stack gap={0}>
                    <Text size="xs" fw={700} c="dimmed">DATA</Text>
                    <Text size="sm" fw={600}>Oggi, 18 Gen</Text>
                </Stack>
                <Stack gap={0}>
                    <Text size="xs" fw={700} c="dimmed">ORARIO</Text>
                    <Text size="sm" fw={600}>17:30 - 23:30</Text>
                </Stack>
            </Group>
          </Paper>

          <Button 
            fullWidth 
            size="lg" 
            radius="md" 
            color="teal"
            leftSection={<IconBolt size={18} />}
          >
            Candidatura Rapida
          </Button>
        </Card>


      </Container>
    </Box>
  );
}