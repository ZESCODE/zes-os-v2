"use client";

import React, { useState } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import DashboardCard from "@/components/dashboard/card";
import {
  Monitor, Server, Database, Shield, Cpu, Globe, Lock, Wifi,
  ArrowRight, Zap, Bot, Router, Terminal, HardDrive, Cloud
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import GearIcon from "@/components/icons/gear";

const nodes = [
  { id: "codex", label: "Codex Agent", icon: Bot, port: 5900, color: "from-blue-500 to-indigo-600", tier: 0 },
  { id: "router", label: "9Router", icon: Router, port: 20128, color: "from-cyan-500 to-blue-600", tier: 0 },
  { id: "flask", label: "Flask API", icon: Terminal, port: 5002, color: "from-emerald-500 to-teal-600", tier: 0 },
  { id: "dashboard1", label: "Dashboard v1", icon: Monitor, port: 5173, color: "from-violet-500 to-fuchsia-600", tier: 1 },
  { id: "dashboard2", label: "ZES OS", icon: Monitor, port: 7070, color: "from-purple-500 to-pink-600", tier: 1 },
  { id: "hermes", label: "Hermes", icon: Bot, port: 9119, color: "from-amber-500 to-orange-600", tier: 1 },
  { id: "bridge", label: "Bridge", icon: Server, port: 5300, color: "from-sky-500 to-blue-600", tier: 1 },
  { id: "zes", label: "ZES System", icon: Cpu, port: 4000, color: "from-green-500 to-emerald-600", tier: 2 },
  { id: "db", label: "Database", icon: Database, port: 5432, color: "from-red-500 to-rose-600", tier: 2 },
  { id: "storage", label: "Object Store", icon: HardDrive, port: 9000, color: "from-yellow-500 to-amber-600", tier: 2 },
];

const connections = [
  ["codex", "router"], ["codex", "flask"], ["router", "flask"],
  ["router", "dashboard1"], ["router", "dashboard2"],
  ["flask", "hermes"], ["flask", "bridge"],
  ["hermes", "bridge"], ["router", "zes"],
  ["zes", "db"], ["zes", "storage"],
];

const ZES_COLORS = [
  { gradient: "from-blue-500 to-indigo-600", glow: "rgba(99,102,241,0.25)" },
  { gradient: "from-cyan-500 to-blue-600", glow: "rgba(6,182,212,0.25)" },
  { gradient: "from-emerald-500 to-teal-600", glow: "rgba(16,185,129,0.2)" },
  { gradient: "from-violet-500 to-fuchsia-600", glow: "rgba(139,92,246,0.2)" },
  { gradient: "from-purple-500 to-pink-600", glow: "rgba(168,85,247,0.2)" },
  { gradient: "from-amber-500 to-orange-600", glow: "rgba(245,158,11,0.2)" },
  { gradient: "from-sky-500 to-blue-600", glow: "rgba(14,165,233,0.2)" },
  { gradient: "from-green-500 to-emerald-600", glow: "rgba(16,185,129,0.2)" },
  { gradient: "from-red-500 to-rose-600", glow: "rgba(239,68,68,0.2)" },
  { gradient: "from-yellow-500 to-amber-600", glow: "rgba(234,179,8,0.2)" },
];

const TIER_LABELS = ["Core Services", "Interface Layer", "Data Layer"];

function NetworkNode({ node, index }) {
  const Icon = node.icon;
  return (
    <div className="flex flex-col items-center gap-2 group">
      <div className={cn(
        "relative size-16 rounded-2xl bg-gradient-to-br p-0.5",
        node.color,
        "shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl"
      )}
        style={{ boxShadow: `0 0 20px ${ZES_COLORS[index % ZES_COLORS.length].glow}` }}>
        <div className="size-full rounded-2xl bg-background flex items-center justify-center">
          <Icon className="size-7 opacity-80" />
        </div>
      </div>
      <span className="text-xs font-medium text-center">{node.label}</span>
      <Badge variant="outline" className="text-[9px]">:{node.port}</Badge>
    </div>
  );
}

export default function TopologyPage() {
  const [selectedNode, setSelectedNode] = useState(null);

  return (
    <DashboardPageLayout header={{ title: "Topology", description: "ZES system architecture", icon: GearIcon }}>
      {/* Topology Visualization */}
      <DashboardCard title="SYSTEM TOPOLOGY" intent="default" className="mb-6">
        <div className="relative py-8 px-4">
          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" style={{ zIndex: 0 }}>
            {connections.map(([from, to], i) => {
              const fNode = nodes.find(n => n.id === from);
              const tNode = nodes.find(n => n.id === to);
              if (!fNode || !tNode) return null;
              return (
                <line key={i}
                  x1={`${15 + fNode.tier * 35 + nodes.filter(n => n.tier === fNode.tier).indexOf(fNode) * 18}%`}
                  y1={`${25 + fNode.tier * 30}%`}
                  x2={`${15 + tNode.tier * 35 + nodes.filter(n => n.tier === tNode.tier).indexOf(tNode) * 18}%`}
                  y2={`${25 + tNode.tier * 30}%`}
                  stroke="currentColor" strokeWidth="1" strokeDasharray="4 4"
                  className="text-muted-foreground/30" />
              );
            })}
          </svg>

          {/* Tiers */}
          {[0, 1, 2].map(tier => (
            <div key={tier} className="relative z-10 mb-8 last:mb-0">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-border/30" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {TIER_LABELS[tier]}
                </span>
                <div className="h-px flex-1 bg-border/30" />
              </div>
              <div className="flex justify-around gap-4 flex-wrap">
                {nodes.filter(n => n.tier === tier).map((node, i) => (
                  <button key={node.id} onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
                    className="transition-all">
                    <NetworkNode node={node} index={nodes.indexOf(node)} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>

      {/* Selected Node Detail */}
      {selectedNode && (
        <DashboardCard title={selectedNode.label} intent="default" className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-accent/20 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Port</div>
              <div className="font-mono text-lg font-bold">{selectedNode.port}</div>
            </div>
            <div className="bg-accent/20 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Status</div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                <span className="text-sm font-medium text-success">Online</span>
              </div>
            </div>
            <div className="bg-accent/20 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Tier</div>
              <div className="text-sm font-medium">{TIER_LABELS[selectedNode.tier]}</div>
            </div>
            <div className="bg-accent/20 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Connections</div>
              <div className="text-sm font-medium">
                {connections.filter(([f, t]) => f === selectedNode.id || t === selectedNode.id).length}
              </div>
            </div>
          </div>
        </DashboardCard>
      )}

      {/* Legend */}
      <DashboardCard title="SERVICE LEGEND" intent="default">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {nodes.map((node, i) => {
            const Icon = node.icon;
            return (
              <div key={node.id} className="flex items-center gap-2 bg-accent/10 rounded-lg px-3 py-2">
                <div className={cn("size-6 rounded-lg bg-gradient-to-br flex items-center justify-center", node.color)}>
                  <Icon className="size-3.5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium truncate">{node.label}</div>
                  <div className="text-[9px] text-muted-foreground">:{node.port}</div>
                </div>
              </div>
            );
          })}
        </div>
      </DashboardCard>
    </DashboardPageLayout>
  );
}
