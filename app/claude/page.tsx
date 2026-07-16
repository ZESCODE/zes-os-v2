"use client";

import React from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import IFramePage from "@/components/dashboard/iframe";
import CuteRobotIcon from "@/components/icons/cute-robot";

export default function ClaudePage() {
  return (
    <DashboardPageLayout
      header={{
        title: "Claude",
        description: "AI assistant terminal",
        icon: CuteRobotIcon,
      }}
    >
      <IFramePage url="http://localhost:5900" title="Claude" />
    </DashboardPageLayout>
  );
}
