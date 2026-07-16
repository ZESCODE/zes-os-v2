"use client";

import React from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import IFramePage from "@/components/dashboard/iframe";
import RouterIcon from "@/components/icons/brackets";

export default function NinerouterPage() {
  return (
    <DashboardPageLayout
      header={{
        title: "9Router",
        description: "API gateway & routing console",
        icon: RouterIcon,
      }}
    >
      <IFramePage url="http://localhost:20128/dashboard" title="9Router Dashboard" />
    </DashboardPageLayout>
  );
}
