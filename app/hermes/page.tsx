"use client";

import React from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import IFramePage from "@/components/dashboard/iframe";
import ZesIcon from "@/components/icons/zes-icon";

export default function HermesPage() {
  return (
    <DashboardPageLayout
      header={{
        title: "Hermes Dashboard",
        description: "Hermes Agent FastAPI dashboard (:9119)",
        icon: ZesIcon,
      }}
    >
      <IFramePage url="http://localhost:9119" title="Hermes Dashboard" />
    </DashboardPageLayout>
  );
}
