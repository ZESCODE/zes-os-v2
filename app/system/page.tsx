"use client";

import React, { useState, useEffect } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import DashboardStat from "@/components/dashboard/stat";
import DashboardCard from "@/components/dashboard/card";
import ProcessorIcon from "@/components/icons/proccesor";
import GearIcon from "@/components/icons/gear";
import BoomIcon from "@/components/icons/boom";
import mockDataJson from "@/mock.json";
import type { MockData } from "@/types/dashboard";
import { getSystemInfo, type SystemInfo } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Bullet } from "@/components/ui/bullet";

const mockData = mockDataJson as MockData;

const iconMap = {
  gear: GearIcon,
  proccesor: ProcessorIcon,
  boom: BoomIcon,
};

export default function SystemPage() {
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null);

  useEffect(() => {
    getSystemInfo().then(setSysInfo);
    const interval = setInterval(() => getSystemInfo().then(setSysInfo), 15000);
    return () => clearInterval(interval);
  }, []);

  const memPercent = sysInfo ? sysInfo.memory.percent : 61;
  const diskPercent = sysInfo ? sysInfo.disk.percent : 41;

  return (
    <DashboardPageLayout
      header={{
        title: "System",
        description: "Hardware & resource monitoring",
        icon: ProcessorIcon,
      }}
    >
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {mockData.dashboardStats.map((stat, index) => (
          <DashboardStat
            key={index}
            label={stat.label}
            value={sysInfo ? `${sysInfo.load[0]?.toFixed(1) ?? stat.value}` : stat.value}
            description={stat.description}
            icon={iconMap[stat.icon as keyof typeof iconMap]}
            tag={stat.tag}
            intent={stat.intent}
            direction={stat.direction}
          />
        ))}
      </div>

      {/* System Resources Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Memory Card */}
        <DashboardCard title="MEMORY" intent="default">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Used</span>
              <span className="font-mono font-bold">{sysInfo?.memory.used ?? "4.6G"}</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-sidebar-primary rounded-full transition-all duration-500"
                style={{ width: `${memPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-mono">{sysInfo?.memory.total ?? "7.5G"}</span>
            </div>
          </div>
        </DashboardCard>

        {/* Disk Card */}
        <DashboardCard title="DISK" intent="default">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Used</span>
              <span className="font-mono font-bold">{sysInfo?.disk.used ?? "90G"}</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-warning rounded-full transition-all duration-500"
                style={{ width: `${diskPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-mono">{sysInfo?.disk.total ?? "223G"}</span>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* System Info */}
      <DashboardCard title="SYSTEM INFO" intent="default" className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Hostname", value: sysInfo?.hostname ?? "localhost" },
            { label: "Kernel", value: "5.10.209-android" },
            { label: "Uptime", value: sysInfo?.uptime ?? "4d 15h" },
            { label: "Arch", value: "aarch64" },
          ].map((item) => (
            <div key={item.label} className="bg-accent/30 rounded p-3">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{item.label}</div>
              <div className="font-mono text-sm font-bold">{item.value}</div>
            </div>
          ))}
        </div>
      </DashboardCard>
    </DashboardPageLayout>
  );
}
