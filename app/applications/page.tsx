"use client";

import ApplicationsPage from "../../components/ApplicationsPage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ApplicationsPage />;
    </Suspense>
  ) 
}

