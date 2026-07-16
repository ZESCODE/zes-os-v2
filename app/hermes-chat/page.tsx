"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import {
  MessageSquare, Send, Plus, Trash2, Bot, User,
  Loader2, Terminal, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import EmailIcon from "@/components/icons/email";

const API = "http://localhost:5300";

function ChatMessage({ msg }) {
  const isUser = msg.role === "user";
  const isTool = msg.role === "tool";
  const isError = msg.role === "error";

  if (isTool) {
    return (
      <div className="flex gap-2 px-3 py-1.5">
        <div className="flex-shrink-0 mt-0.5">
          <Terminal className="h-4 w-4 text-yellow-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-medium text-yellow-500">Tool: {msg.toolName}</span>
          </div>
          <pre className="text-xs text-muted-foreground bg-accent/30 rounded p-2 overflow-x-auto whitespace-pre-wrap max-h-32 overflow-y-auto">
            {typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex gap-3 px-3 py-2", isUser ? "justify-end" : "")}>
      {!isUser && (
        <div className="flex-shrink-0 mt-1">
          <div className="size-7 rounded-full bg-sidebar-primary/20 flex items-center justify-center">
            <Bot className="h-4 w-4 text-sidebar-primary" />
          </div>
        </div>
      )}
      <div className={cn("max-w-[80%]", isUser && "order-first")}>
        <div className={cn(
          "rounded-xl px-3 py-2 text-sm",
          isUser ? "bg-sidebar-primary/20 text-foreground" :
          isError ? "bg-destructive/10 text-destructive" :
          "bg-accent/30"
        )}>
          {typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content)}
        </div>
        {msg.timestamp && (
          <p className="text-[10px] text-muted-foreground mt-0.5 px-1">
            {new Date(msg.timestamp * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 mt-1">
          <div className="size-7 rounded-full bg-accent/50 flex items-center justify-center">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      )}
    </div>
  );
}

export default function HermesChatPage() {
  const [bridgeConnected, setBridgeConnected] = useState<boolean | null>(null);
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const messagesEndRef = useRef(null);

  const checkConnection = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5300/health", { signal: AbortSignal.timeout(3000) });
      setBridgeConnected(res.ok);
    } catch {
      setBridgeConnected(false);
    }
  });

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch(`${API}/conversations`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    checkConnection();
    fetchConversations().finally(() => setInitializing(false));
  }, [fetchConversations]);

  useEffect(() => {
    checkConnection();
    if (activeConv) {
      fetch(`${API}/conversations/${activeConv}/messages`).then(r => r.json())
        .then(data => setMessages(data.messages || []))
        .catch(() => setMessages([]));
    }
  }, [activeConv]);

  useEffect(() => {
    checkConnection();
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeConv) return;
    const text = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: text, timestamp: Math.floor(Date.now() / 1000) }]);
    setLoading(true);
    try {
      const res = await fetch(`${API}/conversations/${activeConv}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, ...(data.messages || [data])]);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleNewConv = async () => {
    try {
      const res = await fetch(`${API}/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Chat" }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveConv(data.id || data.conversation?.id);
        fetchConversations();
      }
    } catch {}
  };

  const handleDeleteConv = async (id) => {
    try {
      await fetch(`${API}/conversations/${id}`, { method: "DELETE" });
      if (activeConv === id) { setActiveConv(null); setMessages([]); }
      fetchConversations();
    } catch {}
  };

  if (initializing) {
    return (
      <DashboardPageLayout header={{ title: "Hermes Chat", description: "Memory & conversation hub", icon: EmailIcon }}>
      {/* Connection Status */}
      {bridgeConnected !== null && (
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg mb-2 text-xs font-medium",
          bridgeConnected ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
        )}>
          <span className={cn("size-2 rounded-full", bridgeConnected ? "bg-success" : "bg-destructive")} />
          Bridge {bridgeConnected ? "Connected" : "Disconnected"}
        </div>
      )}
        <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </DashboardPageLayout>
    );
  }

  return (
    <DashboardPageLayout header={{ title: "Hermes Chat", description: "Memory & conversation hub", icon: EmailIcon }}>
      {/* Connection Status */}
      {bridgeConnected !== null && (
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg mb-2 text-xs font-medium",
          bridgeConnected ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
        )}>
          <span className={cn("size-2 rounded-full", bridgeConnected ? "bg-success" : "bg-destructive")} />
          Bridge {bridgeConnected ? "Connected" : "Disconnected"}
        </div>
      )}
      <div className="flex gap-4 h-[calc(100vh-16rem)] -mx-3 md:-mx-6 -mb-6">
        {/* Sidebar */}
        <div className="w-56 shrink-0 border-r border-border/40 p-3 space-y-2 overflow-y-auto">
          <Button onClick={handleNewConv} size="sm" className="w-full gap-1 mb-3">
            <Plus className="h-4 w-4" /> New Chat
          </Button>
          {conversations.map(conv => (
            <div key={conv.id} className={cn(
              "flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer text-sm transition-colors",
              activeConv === conv.id ? "bg-accent/50 text-foreground" : "text-muted-foreground hover:bg-accent/20"
            )}>
              <div className="flex-1 truncate" onClick={() => setActiveConv(conv.id)}>
                {conv.title || `Chat ${conv.id}`}
              </div>
              <button onClick={() => handleDeleteConv(conv.id)} className="p-1 hover:bg-destructive/20 rounded opacity-0 hover:opacity-100">
                <Trash2 className="h-3 w-3 text-destructive/60" />
              </button>
            </div>
          ))}
          {conversations.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No conversations yet</p>
          )}
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {activeConv ? (
            <>
              <div className="flex-1 overflow-y-auto space-y-1 py-2">
                {messages.map((msg, i) => (
                  <ChatMessage key={i} msg={msg} />
                ))}
                {loading && (
                  <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="border-t border-border/40 p-3">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                    placeholder="Type a message..."
                    className="flex-1 bg-accent/30 border border-border/50 rounded-lg px-3 py-2 text-sm"
                  />
                  <Button onClick={handleSend} disabled={loading || !input.trim()} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              Select or create a conversation
            </div>
          )}
        </div>
      </div>
    </DashboardPageLayout>
  );
}
