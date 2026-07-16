"use client";

import React, { useState, useEffect } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import DashboardStat from "@/components/dashboard/stat";
import DashboardChart from "@/components/dashboard/chart";
import RebelsRanking from "@/components/dashboard/rebels-ranking";
import SecurityStatus from "@/components/dashboard/security-status";
import BracketsIcon from "@/components/icons/brackets";
import GearIcon from "@/components/icons/gear";
import ProcessorIcon from "@/components/icons/proccesor";
import BoomIcon from "@/components/icons/boom";
import mockDataJson from "@/mock.json";
import type { MockData } from "@/types/dashboard";
import { getHealth } from "@/lib/api-client";

const mockData = mockDataJson as MockData;

const iconMap = {
  gear: GearIcon,
  proccesor: ProcessorIcon,
  boom: BoomIcon,
};

export default function DashboardOverview() {
  const [onlineCount, setOnlineCount] = useState(4);

  useEffect(() => {
    const fetchHealth = async () => {
      const health = await getHealth();
      if (health) {
        const online = health.filter((h) => h.running).length;
        setOnlineCount(online);
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardPageLayout
      header={{
        title: "Overview",
        description: "The ultimate OS for rebels",
        icon: BracketsIcon,
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {mockData.dashboardStats.map((stat, index) => (
          <DashboardStat
            key={index}
            label={stat.label}
            value={index === 0 ? `${onlineCount}/${mockData.dashboardStats[0].value.split("/")[1]}` : stat.value}
            description={stat.description}
            icon={iconMap[stat.icon as keyof typeof iconMap]}
            tag={stat.tag}
            intent={stat.intent}
            direction={stat.direction}
          />
        ))}
      </div>

      <div className="mb-6">
        <DashboardChart />
      </div>

      {/* Main 2-column grid section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RebelsRanking rebels={mockData.rebelsRanking} />
        <SecurityStatus statuses={mockData.securityStatus} />
      </div>
    </DashboardPageLayout>
  );
}
