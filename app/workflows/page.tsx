"use client";

import React from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import IFramePage from "@/components/dashboard/iframe";
import GearIcon from "@/components/icons/gear";

export default function WorkflowsPage() {
  return (
    <DashboardPageLayout
      header={{
        title: "Workflows",
        description: "Automation pipeline builder",
        icon: GearIcon,
      }}
    >
      <IFramePage url="http://localhost:8082/workflow-builder" title="Workflow Builder" />
    </DashboardPageLayout>
  );
}
