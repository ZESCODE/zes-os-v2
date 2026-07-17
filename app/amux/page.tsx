"use client";

import React from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import IFramePage from "@/components/dashboard/iframe";
import GearIcon from "@/components/icons/gear";

export default function AmuxPage() {
  return (
    <DashboardPageLayout
      header={{
        title: "amux",
        description: "Agent Control Plane — run, monitor & orchestrate parallel sessions",
        icon: GearIcon,
      }}
    >
      <IFramePage url="http://localhost:8822" title="amux Dashboard" />
    </DashboardPageLayout>
  );
}
