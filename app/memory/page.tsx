"use client";

import React, { useState, useEffect } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import DashboardCard from "@/components/dashboard/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Database, RefreshCw, BrainCircuit, Hash, Braces, Combine } from "lucide-react";
import { cn } from "@/lib/utils";
import BracketsIcon from "@/components/icons/brackets";

interface Memory {
  id: number;
  type: string;
  content: string;
  priority: string;
  scope: string;
  tags: string[];
  source: string;
  created_at: string;
}

export default function MemoryPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState("fts5");
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [writeContent, setWriteContent] = useState("");
  const [status, setStatus] = useState<any>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch("http://localhost:5002/api/zes/memory/status");
      if (res.ok) setStatus(await res.json());
    } catch {}
  };

  const fetchMemories = async (searchQuery = "") => {
    setLoading(true);
    try {
      const url = searchQuery
        ? `http://localhost:5002/api/zes/memory/search?q=${encodeURIComponent(searchQuery)}&mode=${searchMode}`
        : "http://localhost:5002/api/zes/memory/list?limit=20";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMemories(data.results || data.memories || []);
        setTotal(data.count || data.total || 0);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchStatus();
    fetchMemories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMemories(query);
  };

  const typeColors: Record<string, string> = {
    preference: "bg-blue-500/20 text-blue-400",
    decision: "bg-amber-500/20 text-amber-400",
    pattern: "bg-purple-500/20 text-purple-400",
    fact: "bg-emerald-500/20 text-emerald-400",
    feedback: "bg-rose-500/20 text-rose-400",
  };

  return (
    <DashboardPageLayout
      header={{
        title: "Memory Hub",
        description: "ZES cross-agent memory browser",
        icon: BracketsIcon,
      }}
    >
      {status && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
          {[
            { label: "Status", value: status.healthy ? "Healthy" : "Unhealthy" },
            { label: "Memories", value: status.memories ?? total },
            { label: "DB Path", value: status.db_path?.split("/").pop() },
            { label: "Provider", value: status.provider },
            { label: "Embeddings", value: status.embeddings ?? "—" },
            { label: "Modes", value: (status.search_modes ?? ["fts5"]).join(", ") },
          ].map(s => (
            <div key={s.label} className="bg-accent/20 rounded-lg p-3">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
              <div className="text-sm font-mono font-bold truncate">{String(s.value ?? "—")}</div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search memories (${searchMode})...`}
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="default" size="sm">Search</Button>
        <div className="flex gap-0.5 border border-border/40 rounded-lg overflow-hidden">
          {(["fts5", "vector", "hybrid"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => { setSearchMode(mode); if(query) fetchMemories(query); }}
              className={cn(
                "px-2 py-1 text-[10px] font-mono uppercase transition-colors",
                searchMode === mode ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {mode[0].toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={() => { setQuery(""); fetchMemories(""); }}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </form>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading memories...</div>
      ) : memories.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No memories found{query ? ` for "${query}"` : ""}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {memories.map((m, i) => (
            <div key={m.id || i} className="bg-accent/10 rounded-lg p-3 border border-border/40">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={cn("text-[10px] font-mono", typeColors[m.type] || "")}>
                    {m.type}
                  </Badge>
                  <Badge variant="ghost" className="text-[10px] text-muted-foreground">{m.scope}</Badge>
                  {m.tags?.map((t: string) => (
                    <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-1">
                  {m._score && <span className="text-[9px] text-primary/60 font-mono">{m._score}</span>}
                  {m._rrf_score && <span className="text-[9px] text-amber-400/60 font-mono">{m._rrf_score}</span>}
                  {m.priority} · {m.source}
                </span>
              </div>
              <p className="text-sm leading-relaxed">{m.content}</p>
            </div>
          ))}
        </div>
      )}
    </DashboardPageLayout>
  );
}
