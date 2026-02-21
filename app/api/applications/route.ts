import { NextResponse } from "next/server";

type Job = {
  id: string;
  role: string;
  location: string;
  pay: string;
  startDate: string; // ISO
  endDate: string;   // ISO
};

type Application = {
  id: string;
  createdAt: string;
  job: Job;
};

// ✅ “DB” mock in memoria
let APPLICATIONS: Application[] = [];

function genId(prefix = "app") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export async function GET() {
  return NextResponse.json(APPLICATIONS);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // accettiamo uno "snapshot" del job (come farebbe un DB con join o snapshot)
    const job = body?.job as Job | undefined;

    if (
      !job ||
      !job.id ||
      !job.role ||
      !job.location ||
      !job.pay ||
      !job.startDate ||
      !job.endDate
    ) {
      return NextResponse.json(
        { error: "Payload non valido. Atteso { job: { ... } }" },
        { status: 400 }
      );
    }

    // evita doppie candidature allo stesso job (mock semplice)
    const already = APPLICATIONS.some((a) => a.job.id === job.id);
    if (already) {
      return NextResponse.json(
        { error: "Hai già applicato a questo lavoro." },
        { status: 409 }
      );
    }

    const app: Application = {
      id: genId("app"),
      createdAt: new Date().toISOString(),
      job,
    };

    APPLICATIONS = [app, ...APPLICATIONS];

    return NextResponse.json(app, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Errore server" }, { status: 500 });
  }
}
