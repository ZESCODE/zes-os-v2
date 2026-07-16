"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import DashboardCard from "@/components/dashboard/card";
import {
  Plus, X, Circle, ArrowRight, Trash2, User, Edit3,
  Loader2, GitBranch, GripVertical
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import BracketsIcon from "@/components/icons/brackets";

const API = "http://localhost:5002";

const COLUMNS = [
  { id: "triage", label: "Triage", color: "bg-gray-500" },
  { id: "todo", label: "To Do", color: "bg-blue-500" },
  { id: "scheduled", label: "Scheduled", color: "bg-purple-500" },
  { id: "ready", label: "Ready", color: "bg-emerald-500" },
  { id: "running", label: "Running", color: "bg-amber-500" },
  { id: "blocked", label: "Blocked", color: "bg-red-500" },
  { id: "review", label: "Review", color: "bg-cyan-500" },
  { id: "done", label: "Done", color: "bg-green-600" },
];

const PRIORITY_LABELS = { 0: "Low", 1: "Medium", 2: "High", 3: "Urgent" };
const PRIORITY_COLORS = { 0: "text-slate-400", 1: "text-blue-400", 2: "text-amber-400", 3: "text-red-400" };

function TaskCard({ task, onStatusChange, onDelete, onEdit }) {
  const age = task.created_at ? Math.floor((Date.now() / 1000 - task.created_at) / 3600) : 0;

  return (
    <div className="bg-card border border-border/50 rounded-lg p-3 hover:border-primary/30 transition-all group cursor-pointer">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <GripVertical className="h-3 w-3 text-muted-foreground/40 shrink-0" />
            <span className={cn("text-xs font-medium", PRIORITY_COLORS[task.priority] || "text-muted-foreground")}>
              {PRIORITY_LABELS[task.priority] || "?"}
            </span>
            {task.tenant && (
              <Badge variant="outline" className="text-[9px] h-4 px-1">{task.tenant}</Badge>
            )}
          </div>
          <h4 className="text-sm font-medium leading-tight line-clamp-2">{task.title}</h4>
          {task.body && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.body}</p>
          )}
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={() => onEdit(task)} className="p-1 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-opacity">
            <Edit3 className="h-3 w-3 text-muted-foreground" />
          </button>
          <button onClick={() => onDelete(task.id)} className="p-1 hover:bg-destructive/20 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            <Trash2 className="h-3 w-3 text-destructive/60" />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          {task.assignee && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" /> {task.assignee}
            </span>
          )}
          {age > 0 && <span>{age}h ago</span>}
        </div>
        <div className="flex gap-0.5">
          {COLUMNS.filter(c => c.id !== task.status).slice(0, 3).map(col => (
            <button key={col.id} onClick={() => onStatusChange(task.id, task.status, col.id)}
              className="h-5 w-5 rounded flex items-center justify-center text-[9px] opacity-0 group-hover:opacity-100 hover:bg-muted text-muted-foreground transition-opacity"
              title={`Move to ${col.label}`}>
              <ArrowRight className="h-3 w-3" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({ column, tasks, onStatusChange, onDelete, onEdit, onDrop }) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      className={cn(
        "flex flex-col w-72 shrink-0 rounded-lg border border-border/40 bg-accent/10",
        dragOver && "border-primary/50 bg-accent/20"
      )}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        try {
          const data = JSON.parse(e.dataTransfer.getData("text/plain"));
          if (data.from !== column.id) onDrop(data.id, data.from, column.id);
        } catch {}
      }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <span className={cn("w-2.5 h-2.5 rounded-full", column.color)} />
          <span className="text-sm font-display">{column.label}</span>
        </div>
        <Badge variant="secondary" className="text-[10px]">{tasks.length}</Badge>
      </div>
      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[500px]">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onStatusChange={onStatusChange} onDelete={onDelete} onEdit={onEdit} />
        ))}
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-muted-foreground/50">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}

export default function KanbanPage() {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailTask, setDetailTask] = useState(null);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("1");

  const fetchBoard = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/board`);
      if (res.ok) setBoard(await res.json());
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBoard(); const i = setInterval(fetchBoard, 15000); return () => clearInterval(i); }, [fetchBoard]);

  const handleStatusChange = async (id, from, to) => {
    try {
      await fetch(`${API}/api/pact/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: to }),
      });
      fetchBoard();
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API}/api/pact/${id}`, { method: "DELETE" });
      fetchBoard();
    } catch {}
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    try {
      await fetch(`${API}/api/pact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), priority: parseInt(priority), status: "triage" }),
      });
      setTitle("");
      setCreateOpen(false);
      fetchBoard();
    } catch {}
  };

  const handleDrop = async (id, from, to) => {
    handleStatusChange(id, from, to);
  };

  const allTasks = board?.columns?.flatMap(c => c.tasks) || [];
  const totalTasks = allTasks.length;
  const doneTasks = board?.columns?.find(c => c.name === "done")?.tasks.length || 0;

  if (loading) {
    return (
      <DashboardPageLayout header={{ title: "Kanban", description: "Task management board", icon: BracketsIcon }}>
        <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </DashboardPageLayout>
    );
  }

  return (
    <DashboardPageLayout header={{ title: "Kanban", description: "Task management board", icon: BracketsIcon }}>
      {/* Stats & Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <DashboardCard title="TASKS" intent="default" className="!p-3">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-display font-bold">{totalTasks}</div>
                <div className="text-[10px] text-muted-foreground uppercase">Total</div>
              </div>
              <div className="w-px h-8 bg-border/50" />
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-success">{doneTasks}</div>
                <div className="text-[10px] text-muted-foreground uppercase">Done</div>
              </div>
              <div className="w-px h-8 bg-border/50" />
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-warning">{totalTasks - doneTasks}</div>
                <div className="text-[10px] text-muted-foreground uppercase">Active</div>
              </div>
            </div>
          </DashboardCard>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-1">
          <Plus className="h-4 w-4" /> New Task
        </Button>
      </div>

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {board?.columns?.map(col => (
          <KanbanColumn
            key={col.name}
            column={COLUMNS.find(c => c.id === col.name) || { id: col.name, label: col.name, color: "bg-gray-500" }}
            tasks={col.tasks}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onEdit={setDetailTask}
            onDrop={handleDrop}
          />
        ))}
      </div>

      {/* Create Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setCreateOpen(false)}>
          <div className="bg-card border border-border/50 rounded-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display">New Task</h3>
              <button onClick={() => setCreateOpen(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full bg-accent/30 border border-border/50 rounded-lg px-3 py-2 text-sm"
                  placeholder="Task title..." autoFocus />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Priority</label>
                <select value={priority} onChange={e => setPriority(e.target.value)}
                  className="w-full bg-accent/30 border border-border/50 rounded-lg px-3 py-2 text-sm">
                  {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <Button onClick={handleCreate} className="w-full">Create Task</Button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDetailTask(null)}>
          <div className="bg-card border border-border/50 rounded-xl p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display">{detailTask.title}</h3>
              <button onClick={() => setDetailTask(null)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              {detailTask.body && <p className="text-sm text-muted-foreground">{detailTask.body}</p>}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Priority: {PRIORITY_LABELS[detailTask.priority]}</Badge>
                <Badge variant="outline">Status: {detailTask.status}</Badge>
                {detailTask.assignee && <Badge variant="secondary">👤 {detailTask.assignee}</Badge>}
                {detailTask.tenant && <Badge variant="outline">{detailTask.tenant}</Badge>}
              </div>
              <div className="flex gap-2 pt-2">
                {COLUMNS.filter(c => c.id !== detailTask.status).map(col => (
                  <Button key={col.id} size="sm" variant="outline" className="text-xs"
                    onClick={() => { handleStatusChange(detailTask.id, detailTask.status, col.id); setDetailTask(null); }}>
                    Move to {col.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardPageLayout>
  );
}
