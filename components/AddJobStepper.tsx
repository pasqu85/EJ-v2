"use client";

import { useState, useMemo } from "react";
import { Stepper, Button, Group, TextInput, Paper, Box, Text, Stack } from "@mantine/core";
import { DatePickerInput, TimeInput } from "@mantine/dates";
import { 
  IconBuildingStore, 
  IconCalendar, 
  IconClock, 
  IconCash, 
  IconBriefcase, 
  IconCheck,
  IconArrowRight
} from "@tabler/icons-react";
import { motion } from "framer-motion";

// Helper per combinare data e stringa "HH:mm"
function combineDayAndTime(day: Date, hhmm: string) {
  const [hh, mm] = hhmm.split(":").map(Number);
  const out = new Date(day);
  out.setHours(hh || 0, mm || 0, 0, 0);
  return out;
}

interface Business {
  id: string;
  name: string;
  address: string;
}

interface AddJobStepperProps {
  businesses: Business[];
  onComplete: (data: any) => void;
}

export default function AddJobStepper({ businesses, onComplete }: AddJobStepperProps) {
  const [active, setActive] = useState(0);
  const [useBusiness, setUseBusiness] = useState(true);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(businesses[0]?.id || null);

  const [formData, setFormData] = useState({
    role: "",
    businessName: "",
    location: "",
    startDay: new Date(),
    startTime: "09:00",
    endDay: new Date(),
    endTime: "11:00",
    pay: ""
  });

  const selectedBusiness = useMemo(
    () => businesses.find((b) => b.id === selectedBusinessId) || null,
    [businesses, selectedBusinessId]
  );

  const handleFinalSubmit = () => {
    const startDate = combineDayAndTime(formData.startDay, formData.startTime);
    const endDate = combineDayAndTime(formData.endDay, formData.endTime);

    if (endDate <= startDate) {
      alert("La fine deve essere successiva all'inizio!");
      return;
    }

    const finalData = {
      role: formData.role.trim(),
      location: useBusiness && selectedBusiness ? selectedBusiness.address : formData.location,
      pay: formData.pay.trim(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      business: useBusiness && selectedBusiness ? selectedBusiness : null,
      businessName: useBusiness && selectedBusiness ? selectedBusiness.name : formData.businessName,
    };

    onComplete(finalData);
  };

  return (
    <Box>
      <Stepper active={active} onStepClick={setActive} color="blue" radius="xl" size="sm" allowNextStepsSelect={false}>
        
        {/* STEP 1: AZIENDA E RUOLO */}
        <Stepper.Step label="Azienda" icon={<IconBuildingStore size={18} />}>
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 mt-5">
            <TextInput 
              label="Che figura cerchi?" placeholder="Es: Cameriere, Barman..." radius="xl" variant="filled" size="md"
              value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}
            />
            
            <div className="flex justify-between items-center mt-6">
              <Text size="xs" fw={900} c="dimmed" className="tracking-widest">DOVE?</Text>
              <Button variant="subtle" size="compact-xs" onClick={() => setUseBusiness(!useBusiness)}>
                {useBusiness ? "Scrivi indirizzo" : "Scegli attività"}
              </Button>
            </div>

            {useBusiness && businesses.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {businesses.map((b) => (
                  <Paper 
                    key={b.id} p="md" radius="xl" withBorder
                    onClick={() => setSelectedBusinessId(b.id)}
                    className={`cursor-pointer min-w-[180px] transition-all ${selectedBusinessId === b.id ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-100' : 'border-slate-100'}`}
                  >
                    <Text fw={800} size="sm" className="truncate">{b.name}</Text>
                    <Text size="xs" c="dimmed" className="truncate">{b.address}</Text>
                  </Paper>
                ))}
              </div>
            ) : (
              <Stack gap="xs">
                <TextInput placeholder="Nome Attività" radius="xl" variant="filled" value={formData.businessName} onChange={(e) => setFormData({...formData, businessName: e.target.value})} />
                <TextInput placeholder="Indirizzo completo" radius="xl" variant="filled" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
              </Stack>
            )}
          </motion.div>
        </Stepper.Step>

        {/* STEP 2: INIZIO TURNO */}
        <Stepper.Step label="Inizio" icon={<IconClock size={18} />}>
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 mt-5">
             <DatePickerInput 
              label="Quando inizia il turno?" placeholder="Scegli data" radius="xl" variant="filled" size="md"
              value={formData.startDay} onChange={(d) => setFormData({...formData, startDay: d || new Date(), endDay: d || new Date()})} 
            />
            <TimeInput 
              label="Ora di inizio" radius="xl" variant="filled" size="md"
              value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})}
            />
          </motion.div>
        </Stepper.Step>

        {/* STEP 3: FINE TURNO */}
        <Stepper.Step label="Fine" icon={<IconCheck size={18} />}>
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 mt-5">
            <DatePickerInput 
              label="Quando finisce?" placeholder="Scegli data" radius="xl" variant="filled" size="md"
              value={formData.endDay} onChange={(d) => setFormData({...formData, endDay: d || new Date()})}
              minDate={formData.startDay}
            />
            <TimeInput 
              label="Ora di fine" radius="xl" variant="filled" size="md"
              value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})}
            />
          </motion.div>
        </Stepper.Step>

        {/* STEP 4: PAGA E RECAP */}
        <Stepper.Step label="Paga" icon={<IconCash size={18} />}>
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 mt-5">
            <TextInput 
              label="Compenso totale netto" placeholder="Es: 100€" radius="xl" size="lg" variant="filled"
              value={formData.pay} onChange={(e) => setFormData({...formData, pay: e.target.value})}
            />
            
            <Paper p="xl" radius="2rem" className="bg-slate-900 text-black shadow-2xl">
               <div className="flex justify-between items-center mb-4">
                  <Text size="xs" fw={900} className="text-slate-500 uppercase tracking-[0.2em]">Riepilogo</Text>
                  <IconCheck size={20} className="text-emerald-400" />
               </div>
               <Stack gap={5}>
                  <Text size="xl" fw={900}>{formData.role || "Ruolo"}</Text>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <span>{formData.startDay.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}</span>
                    <IconArrowRight size={12} />
                    <span className="font-bold text-black">{formData.startTime} - {formData.endTime}</span>
                  </div>
                  <Text size="lg" fw={900} className="text-emerald-400 mt-2">{formData.pay || "0€"} €</Text>
               </Stack>
            </Paper>
          </motion.div>
        </Stepper.Step>
      </Stepper>

      <Group justify="space-between" mt="2rem">
        <Button 
          variant="subtle" 
          color="gray"
          onClick={() => setActive(active - 1)} 
          disabled={active === 0}
          radius="xl"
        >
          Indietro
        </Button>

        {active < 3 ? (
          <Button 
            onClick={() => setActive(active + 1)} 
            radius="xl" 
            size="md"
            px={40}
            disabled={active === 0 && !formData.role}
          >
            Continua
          </Button>
        ) : (
          <Button 
            color="blue" 
            radius="xl" 
            size="md"
            px={40} 
            onClick={handleFinalSubmit}
            className="bg-blue-600 shadow-lg shadow-blue-200"
          >
            Paga e Pubblica
          </Button>
        )}
      </Group>
    </Box>
  );
}