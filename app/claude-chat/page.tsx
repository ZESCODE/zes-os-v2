"use client";

import React, { useState, useEffect } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import { MessageSquare, Bot, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/dashboard/card";
import IFramePage from "@/components/dashboard/iframe";
import ZesIcon from "@/components/icons/zes-icon";

export default function ClaudeChatPage() {
  const [mode, setMode] = useState<"iframe" | "info">("info");

  return (
    <DashboardPageLayout
      header={{
        title: "Claude Chat",
        description: "Claude Code via 9Router proxy",
        icon: ZesIcon,
      }}
    >
      {mode === "iframe" ? (
        <div className="flex flex-col gap-3">
          <Button onClick={() => setMode("info")} variant="outline" size="sm" className="w-fit gap-1">
            ← Back to info
          </Button>
          <IFramePage url="http://localhost:5900" title="Codex Web UI" />
        </div>
      ) : (
        <div className="space-y-4">
          <DashboardCard title="CLAUDE CODE" intent="default">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Bot className="size-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-display">Claude Code</h3>
                  <p className="text-sm text-muted-foreground">Anthropic's CLI coding agent</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Claude Code replaces OpenClaude. It runs via 9Router proxy (:5905)
                and is managed through <strong>amux</strong> for parallel sessions.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setMode("iframe")} variant="default" size="sm" className="gap-1">
                  <MessageSquare className="h-4 w-4" /> Web Interface
                </Button>
                <Button onClick={() => window.open("http://localhost:8822", "_blank")} variant="outline" size="sm" className="gap-1">
                  <ExternalLink className="h-4 w-4" /> amux Dashboard
                </Button>
              </div>
              <div className="bg-accent/20 rounded-lg p-3 text-xs font-mono space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">CLI:</span><span>claude</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Proxy:</span><span>http://localhost:5905</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">amux:</span><span>http://localhost:8822</span></div>
              </div>
            </div>
          </DashboardCard>
        </div>
      )}
    </DashboardPageLayout>
  );
}
