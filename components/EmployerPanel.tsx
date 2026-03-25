// "use client";

// import { useRef, useState } from "react";
// import { TextInput, ActionIcon, Button, Stack, Title, Paper, Text, Group } from "@mantine/core";
// import { DatePickerInput } from "@mantine/dates";
// import { IconClock, IconMapPin, IconBriefcase, IconCash, IconBuilding } from "@tabler/icons-react";

// // Definiamo il tipo locale per evitare errori se l'import principale fallisce
// export type Job = {
//   id: string;
//   role: string;
//   location: string;
//   startDate: Date;
//   endDate: Date;
//   pay: string;
//   businessName?: string;
// };

// // --- COMPONENTE PER L'ORA IBRIDO (MANUALE + PICKER) ---
// function ModernTimeInput({ 
//   label, 
//   value, 
//   onChange 
// }: { 
//   label: string; 
//   value: string; 
//   onChange: (val: string) => void 
// }) {
//   const nativeInputRef = useRef<HTMLInputElement>(null);

//   return (
//     <div className="relative w-full">
//       <TextInput
//         label={label}
//         placeholder="00:00"
//         value={value}
//         onChange={(e) => {
//           // Permette solo numeri e : e limita a 5 caratteri
//           const val = e.currentTarget.value.replace(/[^0-9:]/g, "");
//           if (val.length <= 5) onChange(val);
//         }}
//         radius="xl"
//         size="md"
//         variant="filled"
//         rightSection={
//           <ActionIcon 
//             variant="subtle" 
//             color="blue" 
//             radius="xl"
//             onClick={() => {
//               if (nativeInputRef.current) {
//                 // @ts-ignore - showPicker è standard ma TS a volte non lo vede
//                 if (typeof nativeInputRef.current.showPicker === 'function') {
//                   nativeInputRef.current.showPicker();
//                 } else {
//                   nativeInputRef.current.click();
//                 }
//               }
//             }}
//           >
//             <IconClock size={18} stroke={1.5} />
//           </ActionIcon>
//         }
//       />
//       {/* Input nativo invisibile per attivare il selettore di sistema su Safari/iOS */}
//       <input
//         type="time"
//         ref={nativeInputRef}
//         value={value.includes(':') ? value : "09:00"}
//         onChange={(e) => onChange(e.target.value)}
//         className="sr-only"
//         style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }}
//       />
//     </div>
//   );
// }

// // --- HELPER PER COMBINARE DATA E ORA ---
// function combineDateAndTime(date: Date | null, timeStr: string) {
//   if (!date) return new Date();
//   const [hh, mm] = timeStr.split(":").map(Number);
//   const out = new Date(date);
//   out.setHours(hh || 0, mm || 0, 0, 0);
//   return out;
// }

// export default function EmployerPanel({
//   jobs,
//   onAddJob,
// }: {
//   jobs: Job[];
//   onAddJob: (job: Omit<Job, "id">) => void;
// }) {
//   const [role, setRole] = useState("");
//   const [location, setLocation] = useState("");
//   const [pay, setPay] = useState("");
//   const [businessName, setBusinessName] = useState("");

//   const [startDate, setStartDate] = useState<Date | null>(new Date());
//   const [startTime, setStartTime] = useState("09:00");

//   const [endDate, setEndDate] = useState<Date | null>(new Date());
//   const [endTime, setEndTime] = useState("11:00");

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!role || !location || !pay || !businessName || !startDate || !endDate) {
//       alert("Compila tutti i campi richiesti.");
//       return;
//     }

//     const startFull = combineDateAndTime(startDate, startTime);
//     const endFull = combineDateAndTime(endDate, endTime);

//     if (endFull <= startFull) {
//       alert("L'orario di fine deve essere successivo a quello di inizio.");
//       return;
//     }

//     onAddJob({
//       role,
//       location,
//       startDate: startFull,
//       endDate: endFull,
//       pay,
//       businessName,
//     });

//     // Reset campi
//     setRole("");
//     setLocation("");
//     setPay("");
//     setBusinessName("");
//   };

//   return (
//     <Stack gap="xl" className="pb-32">
//       <header>
//         <Title order={2} className="text-2xl font-black text-slate-800">
//           Pubblica un lavoro
//         </Title>
//         <Text size="sm" c="dimmed">Compila i dettagli per trovare il tuo staff</Text>
//       </header>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* SEZIONE TEMPORALE */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <Paper p="md" radius="24px" withBorder className="bg-white shadow-sm space-y-4">
//             {/* <DatePickerInput
//               label="Inizio Lavoro"
//               placeholder="Scegli giorno"
//               value={startDate}
//               onChange={setStartDate}
//               radius="xl"
//               size="md"
//               dropdownType="modal"
//               required
//             />
//             <ModernTimeInput label="Ora Inizio" value={startTime} onChange={setStartTime} /> */}
//           </Paper>

//           <Paper p="md" radius="24px" withBorder className="bg-white shadow-sm space-y-4">
//             {/* <DatePickerInput
//               label="Fine Lavoro"
//               placeholder="Scegli giorno"
//               value={endDate}
//               onChange={setEndDate}
//               radius="xl"
//               size="md"
//               dropdownType="modal"
//               required
//             />
//             <ModernTimeInput label="Ora Fine" value={endTime} onChange={setEndTime} /> */}
//           </Paper>
//         </div>

//         {/* SEZIONE DETTAGLI */}
//         <Paper p="xl" radius="24px" withBorder className="bg-white shadow-sm space-y-4">
//           <TextInput
//             label="Nome Attività"
//             placeholder="Es: Ristorante Da Mario"
//             leftSection={<IconBuilding size={18} />}
//             radius="xl"
//             size="md"
//             value={businessName}
//             onChange={(e) => setBusinessName(e.target.value)}
//             required
//           />
//           <TextInput
//             label="Ruolo Cercato"
//             placeholder="Es: Cameriere ai tavoli"
//             leftSection={<IconBriefcase size={18} />}
//             radius="xl"
//             size="md"
//             value={role}
//             onChange={(e) => setRole(e.target.value)}
//             required
//           />
//           <TextInput
//             label="Luogo"
//             placeholder="Es: Milano, Via Roma 12"
//             leftSection={<IconMapPin size={18} />}
//             radius="xl"
//             size="md"
//             value={location}
//             onChange={(e) => setLocation(e.target.value)}
//             required
//           />
//           <TextInput
//             label="Compenso Totale"
//             placeholder="Es: 80€"
//             leftSection={<IconCash size={18} />}
//             radius="xl"
//             size="md"
//             value={pay}
//             onChange={(e) => setPay(e.target.value)}
//             required
//           />
//         </Paper>

//         <Button
//           type="submit"
//           fullWidth
//           size="xl"
//           radius="24px"
//           className="bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-transform active:scale-95"
//         >
//           PAGA E PUBBLICA
//         </Button>
//       </form>

//       {/* LISTA LAVORI ESISTENTI */}
//       {jobs.length > 0 && (
//         <Stack gap="md">
//           <Title order={3} size="h4" className="px-2">I tuoi annunci attivi</Title>
//           {jobs.map((job) => (
//             <Paper key={job.id} p="md" radius="xl" withBorder className="bg-slate-50 border-slate-100">
//               <Group justify="space-between">
//                 <div>
//                   <Text fw={900} size="lg">{job.role}</Text>
//                   <Text size="xs" c="dimmed">{job.location}</Text>
//                 </div>
//                 <Text fw={700} c="emerald.7">{job.pay}</Text>
//               </Group>
//             </Paper>
//           ))}
//         </Stack>
//       )}
//     </Stack>
//   );
// }