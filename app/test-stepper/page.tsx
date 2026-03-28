"use client";

import { useState, useMemo } from "react";
import { Stepper, Button, Group, TextInput, Paper, ActionIcon, Box, Modal, Title } from "@mantine/core";
import { DatePickerInput, TimeInput } from "@mantine/dates";
import { IconBuildingStore, IconCalendar, IconClock, IconCash, IconBriefcase, IconCheck, IconPlus } from "@tabler/icons-react";
import { motion } from "framer-motion";

// --- IL COMPONENTE DELLO STEPPER (Spostato qui dentro) ---
function AddJobStepper({ businesses, onComplete }: { businesses: any[], onComplete: (data: any) => void }) {
  const [active, setActive] = useState(0);
  const [useBusiness, setUseBusiness] = useState(true);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(businesses[0]?.id || null);

  const [formData, setFormData] = useState({
    businessName: "", role: "", location: "",
    startDay: new Date(), startTime: "09:00",
    endDay: new Date(), endTime: "11:00", pay: ""
  });

  const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  return (
    <Box>
      <Stepper active={active} onStepClick={setActive} breakpoint="sm" color="blue" radius="xl">
        <Stepper.Step label="Azienda" icon={<IconBuildingStore size={18} />}>
            <div className="space-y-4 mt-4">
                <TextInput label="Ruolo" placeholder="Es. Cameriere" radius="xl" variant="filled" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} />
                <TextInput label="Azienda" placeholder="Nome attività" radius="xl" variant="filled" value={formData.businessName} onChange={(e) => setFormData({...formData, businessName: e.target.value})} />
            </div>
        </Stepper.Step>
        <Stepper.Step label="Inizio" icon={<IconCalendar size={18} />}>
            <div className="space-y-4 mt-4">
                <DatePickerInput label="Data" radius="xl" variant="filled" value={formData.startDay} onChange={(d) => setFormData({...formData, startDay: d || new Date()})} />
                <TimeInput label="Ora" radius="xl" variant="filled" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} />
            </div>
        </Stepper.Step>
        <Stepper.Step label="Fine" icon={<IconCheck size={18} />}>
             <div className="space-y-4 mt-4">
                <DatePickerInput label="Data Fine" radius="xl" variant="filled" value={formData.endDay} onChange={(d) => setFormData({...formData, endDay: d || new Date()})} minDate={formData.startDay} />
                <TimeInput label="Ora Fine" radius="xl" variant="filled" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} />
            </div>
        </Stepper.Step>
        <Stepper.Step label="Salario" icon={<IconCash size={18} />}>
            <div className="space-y-4 mt-4">
                <TextInput label="Paga Totale" placeholder="Es. 80€" radius="xl" variant="filled" value={formData.pay} onChange={(e) => setFormData({...formData, pay: e.target.value})} />
            </div>
        </Stepper.Step>
      </Stepper>

      <Group justify="center" mt="xl">
        {active !== 0 && <Button variant="default" onClick={prevStep} radius="xl">Indietro</Button>}
        {active < 3 ? (
          <Button onClick={nextStep} radius="xl">Continua</Button>
        ) : (
          <Button color="green" radius="xl" onClick={() => onComplete(formData)}>Conferma e Paga</Button>
        )}
      </Group>
    </Box>
  );
}

// --- LA PAGINA PRINCIPALE ---
export default function TestPage() {
  const [opened, setOpened] = useState(false);

  const fakeBusinesses = [
    { id: '1', name: 'Bar Centrale', address: 'Via Roma 10' }
  ];

  const handleFinalSubmit = (data: any) => {
    alert("Dati inviati! Ruolo: " + data.role);
    setOpened(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <Title className="font-black">Test Stepper</Title>
      
      <ActionIcon 
        size={60} radius="xl" variant="filled" color="blue"
        className="fixed bottom-10 right-10 shadow-2xl z-50"
        onClick={() => setOpened(true)}
      >
        <IconPlus size={32} />
      </ActionIcon>

      <Modal 
        opened={opened} 
        onClose={() => setOpened(false)} 
        title="Nuovo Lavoro"
        size="lg"
        radius="2rem"
        padding="xl"
      >
        <AddJobStepper businesses={fakeBusinesses} onComplete={handleFinalSubmit} />
      </Modal>
    </div>
  );
}