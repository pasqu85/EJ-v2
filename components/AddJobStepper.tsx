"use client";

import { useState, useMemo } from "react";
import { Stepper, Button, Group, TextInput, Paper, Box, Text, Stack, Checkbox } from "@mantine/core";
import { DatePickerInput, TimeInput } from "@mantine/dates";
import {
  IconBuildingStore,
  IconClock,
  IconCash,
  IconCheck,
  IconArrowRight
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

interface FormDataState {
  role: string;
  businessName: string;
  location: string;
  startDay: Date;
  startTime: string;
  endDay: Date;
  endTime: string;
  pay: string;
  isIndeterminato: boolean;
  bubbleMessage: string;
}

interface Business { id: string; name: string; address: string; }
interface AddJobStepperProps { businesses: Business[]; onComplete: (data: any) => void; }

function combineDayAndTime(day: Date, hhmm: string) {
  const [hh, mm] = hhmm.split(":").map(Number);
  const out = new Date(day);
  out.setHours(hh || 0, mm || 0, 0, 0);
  return out;
}

export default function AddJobStepper({ businesses, onComplete }: AddJobStepperProps) {
  const [active, setActive] = useState(0);
  const [useBusiness, setUseBusiness] = useState(true);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(businesses[0]?.id || null);

  const [formData, setFormData] = useState<FormDataState>({
    role: "",
    businessName: "",
    location: "",
    startDay: new Date(),
    startTime: "09:00",
    endDay: new Date(),
    endTime: "11:00",
    pay: "",
    isIndeterminato: false,
    bubbleMessage: ""
  });

  const selectedBusiness = useMemo(
    () => businesses.find((b) => b.id === selectedBusinessId) || null,
    [businesses, selectedBusinessId]
  );

  // --- QUESTA È LA FUNZIONE MODIFICATA ---
  const handleFinalSubmit = () => {
    const startDate = combineDayAndTime(formData.startDay, formData.startTime);
    const endDate = formData.isIndeterminato
      ? startDate
      : combineDayAndTime(formData.endDay, formData.endTime);

    // Controlliamo se hai scritto TEST nel campo paga
    const isTestMode = formData.pay.trim().toUpperCase() === "TEST";

    onComplete({
      role: formData.role.trim(),
      location: useBusiness && selectedBusiness ? selectedBusiness.address : formData.location,
      pay: formData.pay.trim(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      businessName: useBusiness && selectedBusiness ? selectedBusiness.name : formData.businessName,
      employment_type: formData.isIndeterminato ? "indeterminato" : "extra",
      is_bubble: formData.isIndeterminato,
      bubble_message: formData.isIndeterminato ? formData.bubbleMessage : null,
      // Aggiungiamo questa istruzione per il componente EmployerPanel
      skipPayment: isTestMode
    });
  };

  return (
    <Box>
      <Stepper active={active} onStepClick={setActive} color="blue" radius="xl" size="sm" allowNextStepsSelect={false}>

        {/* STEP 0: Azienda */}
        <Stepper.Step label="Azienda" icon={<IconBuildingStore size={18} />}>
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 mt-5">
            <TextInput
              label="Che figura cerchi?"
              placeholder="Es: Cameriere..."
              radius="xl"
              variant="filled"
              size="md"
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
            />
            <div className="flex justify-between items-center mt-6">
              <Text size="xs" fw={900} c="dimmed">DOVE?</Text>
              <Button variant="subtle" size="compact-xs" onClick={() => setUseBusiness(!useBusiness)}>
                {useBusiness ? "Scrivi indirizzo" : "Scegli attività"}
              </Button>
            </div>
            {useBusiness ? (
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {businesses.map((b) => (
                  <Paper
                    key={b.id}
                    p="md"
                    radius="xl"
                    withBorder
                    onClick={() => setSelectedBusinessId(b.id)}
                    className={`cursor-pointer min-w-[180px] transition-all ${selectedBusinessId === b.id ? '!border-blue-500 !bg-blue-50/50' : '!border-slate-100'}`}
                  >
                    <Text fw={800} size="sm" className="truncate">{b.name}</Text>
                    <Text size="xs" c="dimmed" className="truncate">{b.address}</Text>
                  </Paper>
                ))}
              </div>
            ) : (
              <Stack gap="xs">
                <TextInput placeholder="Nome Attività" radius="xl" variant="filled" value={formData.businessName} onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))} />
                <TextInput placeholder="Indirizzo completo" radius="xl" variant="filled" value={formData.location} onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))} />
              </Stack>
            )}
          </motion.div>
        </Stepper.Step>

        {/* STEP 1: Inizio */}
        <Stepper.Step label="Inizio" icon={<IconClock size={18} />}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mt-5">
            <DatePickerInput
              label="Quando inizia?"
              radius="xl"
              variant="filled"
              size="md"
              value={formData.startDay}
              onChange={(value: any) => {
                // Verifichiamo se è una data valida, altrimenti usiamo oggi
                const d = (value && value instanceof Date) ? value : new Date();
                setFormData((prev) => ({ ...prev, startDay: d, endDay: d }));
              }}
            />
            <TimeInput
              label="Ora di inizio"
              radius="xl"
              variant="filled"
              value={formData.startTime}
              onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.currentTarget.value }))}
            />

            <div className="mt-8 p-5 bg-blue-50/50 rounded-[2rem] border border-blue-100 shadow-sm">
              <Checkbox
                label="Posizione a lungo termine"
                description="L'annuncio apparirà in una bollicina"
                checked={formData.isIndeterminato}
                onChange={(event) => {
                  const isChecked = event.currentTarget.checked;
                  setFormData(prev => ({ ...prev, isIndeterminato: isChecked }));
                }}
                radius="xl"
                size="md"
                styles={{
                  label: { fontWeight: 900, color: '#1e293b', fontSize: '14px' },
                  description: { color: '#2563eb', fontWeight: 600 }
                }}
              />
              <AnimatePresence>
                {formData.isIndeterminato && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <TextInput
                      label="Descrizione"
                      placeholder="Es: cerco figura anche senza esperienza..."
                      radius="xl"
                      variant="white"
                      size="sm"
                      value={formData.bubbleMessage}
                      onChange={(e) => setFormData(prev => ({ ...prev, bubbleMessage: e.target.value }))}
                      maxLength={50}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </Stepper.Step>

        {/* STEP 2: Fine */}
        <Stepper.Step label="Fine" icon={<IconCheck size={18} />} disabled={formData.isIndeterminato}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 mt-5">
            <DatePickerInput
              label="Quando finisce?"
              radius="xl"
              variant="filled"
              size="md"
              value={formData.endDay}
              minDate={formData.startDay}
              onChange={(value: any) => {
                const d = (value && value instanceof Date) ? value : formData.startDay;
                setFormData((prev) => ({ ...prev, endDay: d }));
              }}
            />
            <TimeInput
              label="Ora di fine"
              radius="xl"
              variant="filled"
              value={formData.endTime}
              onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.currentTarget.value }))}
            />
          </motion.div>
        </Stepper.Step>

        {/* STEP 3: Paga */}
        <Stepper.Step label="Paga" icon={<IconCash size={18} />}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 mt-5">
            <TextInput
              label={formData.isIndeterminato ? "RAL o Compenso mensile indicativo" : "Compenso totale netto"}
              placeholder="ES: 100 euro oppure 1500 euuro al mese"
              radius="xl"
              size="lg"
              variant="filled"
              value={formData.pay}
              onChange={(e) => setFormData(prev => ({ ...prev, pay: e.target.value }))}
            />
            <Paper p="xl" radius="2rem" className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
              <Stack gap={5}>
                <Text size="xl" fw={900}>{formData.role || "Ruolo"}</Text>
                <Text size="sm" c="slate.3" fw={700}>
                  {formData.isIndeterminato ? "✨ TEMPO INDETERMINATO" : `${formData.startDay.toLocaleDateString('it-IT')} • ${formData.startTime} - ${formData.endTime}`}
                </Text>
                <Text size="lg" fw={900} c="blue.4">{formData.pay || "0"} €</Text>
              </Stack>
            </Paper>
          </motion.div>
        </Stepper.Step>
      </Stepper>

      <Group justify="space-between" mt="2rem">
        <Button variant="subtle" onClick={() => setActive(active - 1)} disabled={active === 0} radius="xl">
          Indietro
        </Button>

        {active === 1 && formData.isIndeterminato ? (
          <Button
            onClick={() => setActive(3)}
            variant="filled"
            color="blue"
            radius="xl"
            rightSection={<IconArrowRight size={18} />}
          >
            Vai al Riepilogo
          </Button>
        ) : active < 3 ? (
          <Button
            onClick={() => setActive(active + 1)}
            disabled={active === 0 && !formData.role}
            variant="subtle"
            radius="xl"
            rightSection={<IconArrowRight size={18} />}
          >
            Continua
          </Button>
        ) : (
          <Button
            onClick={handleFinalSubmit}
            variant="subtle"
            radius="xl"
            leftSection={<IconCheck size={20} />}
            className="!bg-emerald-100 hover:!bg-emerald-400 !text-emerald-900 !font-black"
          >
            Pubblica
          </Button>
        )}
      </Group>
    </Box>
  );
}