"use client";

import { useState, useMemo } from "react";
import { 
  Stepper, 
  Button, 
  Group, 
  TextInput, 
  Paper, 
  ActionIcon, 
  Box, 
  Transition,
  rem 
} from "@mantine/core";
import { DatePickerInput, TimeInput } from "@mantine/dates";
import { 
  IconBuildingStore, 
  IconCalendar, 
  IconClock, 
  IconCash, 
  IconBriefcase, 
  IconCheck,
  IconPlus
} from "@tabler/icons-react";
import { motion } from "framer-motion";

// --- COMPONENTE STEPPER SEPARATO ---
export default function AddJobStepper({ 
  businesses, 
  onComplete 
}: { 
  businesses: any[], 
  onComplete: (data: any) => void 
}) {
  const [active, setActive] = useState(0);
  const [useBusiness, setUseBusiness] = useState(true);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(businesses[0]?.id || null);

  // Form State
  const [formData, setFormData] = useState({
    businessName: "",
    role: "",
    location: "",
    startDay: new Date(),
    startTime: "09:00",
    endDay: new Date(),
    endTime: "11:00",
    pay: ""
  });

  const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const selectedBusiness = useMemo(
    () => businesses.find((b) => b.id === selectedBusinessId) || null,
    [businesses, selectedBusinessId]
  );

  const isStepDisabled = () => {
    if (active === 0 && (!formData.role || (useBusiness && !selectedBusinessId) || (!useBusiness && !formData.businessName))) return true;
    if (active === 3 && !formData.pay) return true;
    return false;
  };

  return (
    <Box className="max-w-xl mx-auto p-4">
<Stepper 
  active={active} 
  onStepClick={setActive} 
  color="blue"
  radius="xl"
  size="sm"
  allowNextStepsSelect={false} // Impedisce di saltare avanti se i campi non sono pronti
>
  {/* STEP 1: AZIENDA */}
  <Stepper.Step 
    label="Azienda" 
    description="Chi cerca?"
    icon={<IconBuildingStore size={18} />}
  >
    <div className="space-y-4 mt-4">
      <TextInput 
        label="Ruolo" 
        placeholder="Es. Cameriere" 
        radius="xl" 
        variant="filled" 
        value={formData.role} 
        onChange={(e) => setFormData({...formData, role: e.target.value})} 
      />
      <TextInput 
        label="Azienda" 
        placeholder="Nome attività" 
        radius="xl" 
        variant="filled" 
        value={formData.businessName} 
        onChange={(e) => setFormData({...formData, businessName: e.target.value})} 
      />
    </div>
  </Stepper.Step>

  {/* STEP 2: DATA E ORA INIZIO */}
  <Stepper.Step 
    label="Inizio" 
    description="Quando inizia"
    icon={<IconCalendar size={18} />}
  >
    <div className="space-y-4 mt-4">
      <DatePickerInput 
        label="Giorno" 
        radius="xl" 
        variant="filled" 
        value={formData.startDay} 
        onChange={(d) => setFormData({...formData, startDay: d || new Date()})} 
      />
      <TimeInput 
        label="Ora" 
        radius="xl" 
        variant="filled" 
        value={formData.startTime} 
        onChange={(e) => setFormData({...formData, startTime: e.target.value})} 
      />
    </div>
  </Stepper.Step>

  {/* STEP 3: FINE */}
  <Stepper.Step 
    label="Fine" 
    description="Quando finisce"
    icon={<IconCheck size={18} />}
  >
    <div className="space-y-4 mt-4">
      <DatePickerInput 
        label="Data Fine" 
        radius="xl" 
        variant="filled" 
        value={formData.endDay} 
        onChange={(d) => setFormData({...formData, endDay: d || new Date()})} 
        minDate={formData.startDay} 
      />
      <TimeInput 
        label="Ora Fine" 
        radius="xl" 
        variant="filled" 
        value={formData.endTime} 
        onChange={(e) => setFormData({...formData, endTime: e.target.value})} 
      />
    </div>
  </Stepper.Step>

  {/* STEP 4: SALARIO */}
  <Stepper.Step 
    label="Paga" 
    description="Quanto offri"
    icon={<IconCash size={18} />}
  >
    <div className="space-y-4 mt-4">
      <TextInput 
        label="Paga Totale" 
        placeholder="Es. 80€" 
        radius="xl" 
        variant="filled" 
        value={formData.pay} 
        onChange={(e) => setFormData({...formData, pay: e.target.value})} 
      />
    </div>
  </Stepper.Step>

  <Stepper.Completed>
    <div className="text-center py-4">
      <h3 className="font-bold">Ottimo! Recap completato.</h3>
      <p className="text-sm text-slate-500">Puoi procedere al pagamento ora.</p>
    </div>
  </Stepper.Completed>
</Stepper>

      <Group justify="center" mt="xl">
        {active !== 0 && (
          <Button variant="default" onClick={prevStep} radius="xl">
            Indietro
          </Button>
        )}
        {active < 4 ? (
          <Button onClick={nextStep} radius="xl" disabled={isStepDisabled()}>
            Continua
          </Button>
        ) : (
          <Button 
            color="blue" 
            radius="xl" 
            fullWidth 
            size="md" 
            onClick={() => onComplete(formData)}
            className="bg-blue-600"
          >
            Paga e Pubblica (1.00€)
          </Button>
        )}
      </Group>
    </Box>
  );
}