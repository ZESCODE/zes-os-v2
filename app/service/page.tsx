"use client";

import React, { useState, useEffect } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import DashboardCard from "@/components/dashboard/card";
import CuteRobotIcon from "@/components/icons/cute-robot";
import { Badge } from "@/components/ui/badge";
import { Bullet } from "@/components/ui/bullet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getHealth, getServices, startService, stopService, type ServiceHealth, type ServiceStatus } from "@/lib/api-client";

interface ServiceDog {
  name: string;
  port: number;
  status: "running" | "stopped" | "error";
  description: string;
}

const defaultServices: ServiceDog[] = [
  { name: "Codex", port: 5900, status: "running", description: "Primary agent engine" },
  { name: "9Router", port: 20128, status: "running", description: "API gateway & routing" },
  { name: "Flask API", port: 5002, status: "running", description: "Backend REST API" },
  { name: "Dashboard", port: 5173, status: "running", description: "System status UI" },
  { name: "Hermes", port: 9119, status: "stopped", description: "Memory & conversation hub" },
  { name: "Bridge", port: 5300, status: "stopped", description: "gRPC ↔ REST bridge" },
  { name: "ZES User", port: 4000, status: "stopped", description: "User-facing dashboard" },
];

export default function ServicePage() {
  const [services, setServices] = useState<ServiceDog[]>(defaultServices);
  const [guardBotsOnline, setGuardBotsOnline] = useState(4);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const fetchStatus = async () => {
    const health = await getHealth();
    if (!health) return;

    setServices((prev) => {
      const updated = prev.map((svc) => {
        const match = health.find((h) => h.port === svc.port);
        return {
          ...svc,
          status: match ? (match.running ? "running" : "stopped") : svc.status,
        };
      });
      const online = updated.filter((s) => s.status === "running").length;
      setGuardBotsOnline(online);
      return updated;
    });
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async (svc: ServiceDog) => {
    setLoadingAction(svc.name);
    try {
      // Map service name to runsv name
      const svcMap: Record<string, string> = {
        "Flask API": "zes-flask-api",
        "Dashboard": "zes-dashboard",
        "Hermes": "hermes",
        "Bridge": "bridge",
        "9Router": "9router",
        "Codex": "codex",
      };
      const runsvName = svcMap[svc.name];
      if (!runsvName) return;

      if (svc.status === "running") {
        await stopService(runsvName);
      } else {
        await startService(runsvName);
      }
      // Wait a moment then refresh
      setTimeout(fetchStatus, 2000);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <DashboardPageLayout
      header={{
        title: "Services",
        description: "Guard Bots & service control",
        icon: CuteRobotIcon,
      }}
    >
      {/* GUARD BOTS Status */}
      <DashboardCard
        title="GUARD BOTS"
        intent={guardBotsOnline === services.length ? "success" : "default"}
        addon={
          <Badge variant={guardBotsOnline === services.length ? "default" : "secondary"}>
            {guardBotsOnline}/{services.length} ONLINE
          </Badge>
        }
        className="mb-6"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                guardBotsOnline === services.length
                  ? "bg-success"
                  : guardBotsOnline >= services.length / 2
                  ? "bg-warning"
                  : "bg-destructive"
              )}
              style={{ width: `${(guardBotsOnline / services.length) * 100}%` }}
            />
          </div>
          <span className="font-mono text-sm font-bold tabular-nums">
            {Math.round((guardBotsOnline / services.length) * 100)}%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {services.map((svc) => (
            <div
              key={svc.name}
              className={cn(
                "rounded-lg border p-4 transition-all duration-300",
                svc.status === "running"
                  ? "border-success/30 bg-success/5"
                  : svc.status === "error"
                  ? "border-destructive/30 bg-destructive/5"
                  : "border-border/50 bg-accent/20"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Bullet
                    variant={
                      svc.status === "running"
                        ? "success"
                        : svc.status === "error"
                        ? "destructive"
                        : "default"
                    }
                  />
                  <span className="font-display text-sm">{svc.name}</span>
                </div>
                <Badge
                  variant={
                    svc.status === "running" ? "default" : "secondary"
                  }
                  className="text-[10px]"
                >
                  :{svc.port}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {svc.description}
              </p>
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-xs font-mono uppercase",
                    svc.status === "running"
                      ? "text-success"
                      : svc.status === "error"
                      ? "text-destructive"
                      : "text-muted-foreground/50"
                  )}
                >
                  {svc.status === "running" ? "● ONLINE" : svc.status === "error" ? "● ERROR" : "○ OFFLINE"}
                </span>
                <Button
                  variant={svc.status === "running" ? "outline" : "default"}
                  size="sm"
                  className="h-7 text-xs"
                  disabled={loadingAction === svc.name}
                  onClick={() => handleToggle(svc)}
                >
                  {loadingAction === svc.name ? "..." : svc.status === "running" ? "STOP" : "START"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>

      {/* Auto-Restart Info */}
      <DashboardCard title="GUARD DOG PROTOCOL" intent="default">
        <div className="space-y-3">
          {[
            { label: "AUTO-RESTART", value: "ENABLED", variant: "success" as const },
            { label: "HEALTH CHECKS", value: "EVERY 10s", variant: "success" as const },
            { label: "MAX RETRIES", value: "3", variant: "warning" as const },
            { label: "NOTIFICATIONS", value: "ON FAILURE", variant: "info" as const },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between bg-accent/20 rounded px-3 py-2">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <Badge variant={item.variant === "info" ? "secondary" : item.variant === "success" ? "default" : "outline"}>
                {item.value}
              </Badge>
            </div>
          ))}
        </div>
      </DashboardCard>
    </DashboardPageLayout>
  );
}
