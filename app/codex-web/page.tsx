"use client";

import React from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import IFramePage from "@/components/dashboard/iframe";
import BracketsIcon from "@/components/icons/brackets";

export default function CodexWebPage() {
  return (
    <DashboardPageLayout
      header={{
        title: "Codex Web",
        description: "Codex agent web interface",
        icon: BracketsIcon,
      }}
    >
      <IFramePage url="http://localhost:5900" title="Codex Web" />
    </DashboardPageLayout>
  );
}
