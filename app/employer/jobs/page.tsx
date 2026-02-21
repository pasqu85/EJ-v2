"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

import {
  Box,
  Title,
  Text,
  Paper,
  Stack,
  Group,
  Badge,
  ThemeIcon,
  ActionIcon,
  Button,
  Avatar,
} from "@mantine/core";

import {
  IconMapPin,
  IconCalendarEvent,
  IconChevronRight,
  IconPlus,
  IconCurrencyEuro,
  IconUsers,
  IconBrandWhatsapp,
  IconX,
} from "@tabler/icons-react";

import { AnimatePresence, motion } from "framer-motion";

// --------------------
// TYPES
// --------------------
type Job = {
  id: string;
  employer_id: string;
  role: string;
  location: string;
  pay: string;
  start_date: string;
  end_date: string;
  business_name?: string | null;
  business_address?: string | null;
};

type Applicant = {
  application_id: string;
  created_at: string;
  worker: {
    id: string;
    name: string | null;
    surname: string | null;
    phone: string | null;
    avatar_url: string | null;
  } | null;
};

// --------------------
// HELPERS
// --------------------
function waLink(phone: string, text?: string) {
  const clean = phone.replace(/[^\d]/g, ""); // wa.me vuole solo numeri
  const msg = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${clean}${msg}`;
}

function fullName(w: Applicant["worker"]) {
  const n = `${w?.name ?? ""} ${w?.surname ?? ""}`.trim();
  if (n) return n;

  // fallback: mostra ID corto
  const short = w?.id ? w.id.slice(0, 8) : "";
  return short ? `Utente • ${short}` : "Candidato";
}

// --------------------
// SHEET CANDIDATI
// --------------------
function ApplicantsSheet({
  open,
  job,
  applicants,
  loading,
  onClose,
}: {
  open: boolean;
  job: Job | null;
  applicants: Applicant[];
  loading: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && job && (
        <>
          {/* overlay */}
          <motion.div
            className="fixed inset-0 z-[80] bg-black/35 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* sheet */}
          <motion.div
            className="fixed left-0 right-0 bottom-0 z-[90] mx-auto w-full max-w-xl"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "tween", duration: 0.18 }}
          >
            <div className="mx-3 mb-3 rounded-3xl bg-white shadow-2xl border overflow-hidden">
              {/* handle */}
              <div className="flex justify-center pt-3">
                <div className="w-10 h-1.5 rounded-full bg-gray-300" />
              </div>

              <div className="p-4 space-y-4">
                {/* header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xl font-bold flex items-center gap-2">
                      <IconUsers size={20} />
                      Candidati
                    </div>
                    <div className="text-sm text-gray-600">
                      {job.role} • {job.business_name ?? job.location}
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600"
                    aria-label="Chiudi"
                  >
                    <IconX size={18} />
                  </button>
                </div>

                {/* content */}
                {loading && (
                  <div className="bg-white rounded-2xl border p-4 shadow-sm">
                    Caricamento...
                  </div>
                )}

                {!loading && applicants.length === 0 && (
                  <div className="bg-white rounded-2xl border p-4 shadow-sm">
                    Nessuna candidatura per questo lavoro.
                  </div>
                )}

                {!loading && applicants.length > 0 && (
                  <Stack gap="sm">
                    {applicants.map((a) => {
                      const w = a.worker;
                      const phoneOk =
                        !!w?.phone && w.phone.replace(/[^\d]/g, "").length >= 8;

                      return (
                        <div
                          key={a.application_id}
                          className="bg-white rounded-2xl border p-4 shadow-sm flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar radius="xl" src={w?.avatar_url ?? undefined}>
                              {(w?.name?.[0] ?? "U").toUpperCase()}
                            </Avatar>

                            <div className="min-w-0">
                              <div className="font-bold truncate">
                                {fullName(w)}
                              </div>
                              <div className="text-xs text-gray-500">
                                Candidato:{" "}
                                {new Date(a.created_at).toLocaleString("it-IT")}
                              </div>
                              {w?.phone && (
                                <div className="text-sm text-gray-700 truncate">
                                  {w.phone}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0">
                            {phoneOk ? (
                              <Button
                                radius="xl"
                                leftSection={<IconBrandWhatsapp size={18} />}
                                color="green"
                                onClick={() => {
                                  const url = waLink(
                                    w!.phone!,
                                    `Ciao! Ti contatto per il lavoro "${job.role}" su extraJob 👋`
                                  );
                                  window.open(url, "_blank", "noopener,noreferrer");
                                }}
                              >
                                WhatsApp
                              </Button>
                            ) : (
                              <Button radius="xl" variant="light" disabled>
                                No numero
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </Stack>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function EmployerJobsPage() {
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  // ✅ Load jobs dal DB (solo employer)
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoadingJobs(true);

      const {
        data: { user },
        error: uErr,
      } = await supabase.auth.getUser();

      if (!alive) return;

      if (uErr) {
        console.error(uErr);
        setJobs([]);
        setLoadingJobs(false);
        return;
      }

      if (!user) {
        router.replace("/");
        return;
      }

      const { data: prof, error: pErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!alive) return;

      if (pErr) {
        console.error(pErr);
        router.replace("/");
        return;
      }

      if (prof?.role !== "employer") {
        router.replace("/");
        return;
      }

      const { data, error } = await supabase
        .from("jobs")
        .select(
          "id, employer_id, role, location, pay, start_date, end_date, business_name, business_address, created_at"
        )
        .eq("employer_id", user.id)
        .order("created_at", { ascending: false });

      if (!alive) return;

      if (error) {
        console.error(error);
        setJobs([]);
      } else {
        setJobs((data as Job[]) ?? []);
      }

      setLoadingJobs(false);
    })();

    return () => {
      alive = false;
    };
  }, [router]);

  async function openApplicants(job: Job) {
    setSelectedJob(job);
    setApplicants([]);
    setLoadingApplicants(true);

    // ✅ Join robusto usando FK esplicita:
    // applications.worker_id -> profiles.id
const { data, error } = await supabase
  .from("employer_applicants")
  .select(
    "application_id, created_at, worker_id, name, surname, phone, avatar_url"
  )
  .eq("job_id", job.id)
  .order("created_at", { ascending: false });

const mapped: Applicant[] = ((data as any[]) ?? []).map((r) => ({
  application_id: r.application_id,
  created_at: r.created_at,
  worker: {
    id: r.worker_id,
    name: r.name,
    surname: r.surname,
    phone: r.phone,
    avatar_url: r.avatar_url,
  },
}));

    setApplicants(mapped);
    setLoadingApplicants(false);
  }

  return (
    <div className="px-4 pt-10 pb-28 max-w-xl mx-auto">
      <Group justify="space-between" mb={30} align="flex-end">
        <Box>
          <Title
            order={1}
            style={{
              fontSize: "2.2rem",
              fontWeight: 900,
              letterSpacing: "-1.5px",
            }}
          >
            I miei <span style={{ color: "#3b82f6" }}>Lavori</span>
          </Title>
          <Text c="dimmed" fw={500}>
            Gestisci le posizioni aperte per la tua attività
          </Text>
        </Box>

        <Button
          leftSection={<IconPlus size={18} />}
          radius="xl"
          color="blue"
          onClick={() => router.push("/employer")}
        >
          Pubblica
        </Button>
      </Group>

      {loadingJobs ? (
        <div className="bg-white rounded-2xl border p-4 shadow-sm">
          Caricamento...
        </div>
      ) : jobs.length === 0 ? (
        <p className="text-gray-500">Non hai ancora pubblicato lavori.</p>
      ) : (
        <Stack gap="md">
          {jobs.map((job) => (
            <Paper
              key={job.id}
              onClick={() => openApplicants(job)} // ✅ apre lista candidati
              p="lg"
              radius="20px"
              withBorder
              className="job-card"
              style={{
                cursor: "pointer",
                transition: "all 0.2s ease",
                backgroundColor: "white",
              }}
            >
              <Group justify="space-between" wrap="nowrap">
                <Stack gap={4} style={{ flex: 1 }}>
                  <Group gap="xs">
                    <Text fw={800} size="xl" style={{ letterSpacing: "-0.5px" }}>
                      {job.role}
                    </Text>
                    <Badge color="teal" variant="light" radius="sm" size="sm">
                      Attivo
                    </Badge>
                  </Group>

                  <Group gap="xs" c="dimmed">
                    <IconMapPin size={14} />
                    <Text size="sm" fw={500}>
                      {job.business_address || job.location}
                    </Text>
                    <Text size="xs" c="gray.4">
                      •
                    </Text>
                    <IconCurrencyEuro size={14} />
                    <Text size="sm" fw={600} c="blue.7">
                      {job.pay}
                    </Text>
                  </Group>

                  <Group gap="xs" mt={8}>
                    <ThemeIcon variant="light" color="gray" size="sm" radius="xl">
                      <IconCalendarEvent size={12} />
                    </ThemeIcon>
                    <Text size="xs" fw={600} c="gray.7">
                      {new Date(job.start_date).toLocaleDateString("it-IT", {
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      •{" "}
                      {new Date(job.start_date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </Group>
                </Stack>

                <ActionIcon variant="subtle" color="gray" radius="xl" size="lg">
                  <IconChevronRight size={20} />
                </ActionIcon>
              </Group>
            </Paper>
          ))}
        </Stack>
      )}

      {/* ✅ SHEET CANDIDATI */}
      <ApplicantsSheet
        open={!!selectedJob}
        job={selectedJob}
        applicants={applicants}
        loading={loadingApplicants}
        onClose={() => setSelectedJob(null)}
      />
    </div>
  );
}