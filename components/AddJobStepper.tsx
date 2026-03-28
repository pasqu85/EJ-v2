"use client";

import { useState, useMemo } from "react";
import { Stepper, Button, Group, TextInput, Paper, Box, Text, Stack } from "@mantine/core";
import { DatePickerInput, TimeInput } from "@mantine/dates";
import {
  IconBuildingStore,
  IconClock,
  IconCash,
  IconCheck,
  IconArrowRight
} from "@tabler/icons-react";
import { motion } from "framer-motion";

// Helper
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

const [formData, setFormData] = useState<{
  role: string;
  businessName: string;
  location: string;
  startDay: Date;    // <-- Deve essere Date
  startTime: string;
  endDay: Date;      // <-- Deve essere Date
  endTime: string;
  pay: string;
}>({
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
    if (!formData.startDay || !formData.endDay) return;

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

        {/* STEP 1 */}
        <Stepper.Step label="Azienda" icon={<IconBuildingStore size={18} />}>
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 mt-5">
            <TextInput
              label="Che figura cerchi?"
              placeholder="Es: Cameriere, Barman..."
              radius="xl"
              variant="filled"
              size="md"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
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
                    key={b.id}
                    p="md"
                    radius="xl"
                    withBorder
                    onClick={() => setSelectedBusinessId(b.id)}
                    className={`cursor-pointer min-w-[180px] transition-all ${selectedBusinessId === b.id
                      ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-100'
                      : 'border-slate-100'
                      }`}
                  >
                    <Text fw={800} size="sm" className="truncate">{b.name}</Text>
                    <Text size="xs" c="dimmed" className="truncate">{b.address}</Text>
                  </Paper>
                ))}
              </div>
            ) : (
              <Stack gap="xs">
                <TextInput
                  placeholder="Nome Attività"
                  radius="xl"
                  variant="filled"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                />
                <TextInput
                  placeholder="Indirizzo completo"
                  radius="xl"
                  variant="filled"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </Stack>
            )}
          </motion.div>
        </Stepper.Step>

        {/* STEP 2 */}
        <Stepper.Step label="Inizio" icon={<IconClock size={18} />}>
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 mt-5">
<DatePickerInput 
  label="Quando inizia il turno?" 
  placeholder="Scegli data" 
  radius="xl" 
  variant="filled" 
  size="md"
  value={formData.startDay} 
  onChange={(d) => {
    // Verifichiamo che d sia effettivamente un oggetto Date
    const validatedDate = d instanceof Date ? d : new Date();
    setFormData({
      ...formData, 
      startDay: validatedDate,
      endDay: validatedDate // Imposta la stessa data per la fine come default
    });
  }} 
/>
            <TimeInput
              label="Ora di inizio"
              radius="xl"
              variant="filled"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.currentTarget.value })}
            />
          </motion.div>
        </Stepper.Step>

        {/* STEP 3 */}
        <Stepper.Step label="Fine" icon={<IconCheck size={18} />}>
          <motion.div className="space-y-4 mt-5">
<DatePickerInput 
  label="Quando finisce?" 
  placeholder="Scegli data" 
  radius="xl" 
  variant="filled" 
  size="md"
  value={formData.endDay} 
  minDate={formData.startDay}
  onChange={(d) => {
    const validatedDate = d instanceof Date ? d : new Date();
    setFormData({ ...formData, endDay: validatedDate });
  }} 
/>
            <TimeInput
              label="Ora di fine"
              radius="xl"
              variant="filled"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.currentTarget.value })}
            />
          </motion.div>
        </Stepper.Step>

        {/* STEP 4 */}
        <Stepper.Step label="Paga" icon={<IconCash size={18} />}>
          <motion.div className="space-y-6 mt-5">
            <TextInput
              label="Compenso totale netto"
              placeholder="Es: 100€"
              radius="xl"
              size="lg"
              variant="filled"
              value={formData.pay}
              onChange={(e) => setFormData({ ...formData, pay: e.target.value })}
            />

            <Paper p="xl" radius="2rem" className="bg-slate-900 text-black shadow-2xl">
              <Stack gap={5}>
                <Text size="xl" fw={900}>{formData.role || "Ruolo"}</Text>
                <div className="flex gap-2 text-sm">
                  <span>
                    {formData.startDay?.toLocaleDateString('it-IT') || ""}
                  </span>
                  <IconArrowRight size={12} />
                  <span>{formData.startTime} - {formData.endTime}</span>
                </div>
                <Text size="lg" fw={900}>{formData.pay || "0€"} €</Text>
              </Stack>
            </Paper>
          </motion.div>
        </Stepper.Step>
      </Stepper>

      <Group justify="space-between" mt="2rem">
        <Button onClick={() => setActive(active - 1)} disabled={active === 0}
          radius="xl"
          size="md"
          className="!bg-transparent hover:!bg-blue-50 !text-blue-600 font-black tracking-tight transition-all active:scale-95 disabled:opacity-30"
        >
          Indietro
        </Button>

        {active < 3 ? (
          <Button
            onClick={() => setActive(active + 1)}
            disabled={active === 0 && !formData.role}
            variant="subtle"
            color="blue"
            radius="xl"
            size="md"
            rightSection={<IconArrowRight size={18} />} // Aggiunge dinamismo
            className="!bg-transparent hover:!bg-blue-50 !text-blue-600 font-black tracking-tight transition-all active:scale-95 disabled:opacity-30"
          >
            Continua
          </Button>
        ) : (
          <Button
            onClick={handleFinalSubmit}
            variant="subtle"
            color="emerald" // Verde per il pagamento/conferma
            radius="xl"
            size="lg"
            leftSection={<IconCheck size={20} />}
            className="!bg-transparent hover:!bg-emerald-50 !text-emerald-600 font-black tracking-tighter transition-all active:scale-95 shadow-none"
          >
            Paga e Pubblica
          </Button>
        )}
      </Group>
    </Box>
  );
}