"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import {
  MessageSquare, Send, Plus, Trash2, Bot, User,
  Loader2, Terminal, ChevronLeft, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import EmailIcon from "@/components/icons/email";

const BRIDGE_URL = "http://localhost:5300";
const MAX_HISTORY = 50;

function ChatMessage({ msg, isLast }) {
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
    <div className={cn("flex gap-3 px-4 py-2", isUser ? "justify-end" : "")}>
      {!isUser && (
        <div className="flex-shrink-0 mt-1">
          <div className="size-8 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Bot className="h-4 w-4 text-purple-400" />
          </div>
        </div>
      )}
      <div className={cn("max-w-[75%]", isUser && "order-first")}>
        <div className={cn(
          "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser ? "bg-sidebar-primary/20 text-foreground" :
          isError ? "bg-destructive/10 text-destructive" :
          "bg-accent/30 border border-border/30"
        )}>
          {msg.content}
        </div>
        <div className="flex items-center gap-2 mt-1 px-1">
          {msg.model && <span className="text-[10px] text-muted-foreground/50">{msg.model}</span>}
          {msg.timestamp && (
            <span className="text-[10px] text-muted-foreground/50">
              {new Date(msg.timestamp * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
      </div>
      {isUser && (
        <div className="flex-shrink-0 mt-1">
          <div className="size-8 rounded-full bg-accent/50 flex items-center justify-center">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      )}
    </div>
  );
}

export default function OCChatPage() {
  const [bridgeConnected, setBridgeConnected] = useState<boolean | null>(null);
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef(null);

  const checkConnection = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5300/health", { signal: AbortSignal.timeout(3000) });
      setBridgeConnected(res.ok);
    } catch {
      setBridgeConnected(false);
    }
  });

  const fetchConvs = useCallback(async () => {
    try {
      const res = await fetch(`${BRIDGE_URL}/conversations`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { checkConnection(); fetchConvs(); }, [fetchConvs]);

  useEffect(() => {
    if (activeId) {
      fetch(`${BRIDGE_URL}/conversations/${activeId}/messages`).then(r => r.json())
        .then(d => setMessages((d.messages || []).slice(-MAX_HISTORY)))
        .catch(() => setMessages([]));
    }
  }, [activeId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeId) return;
    const text = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: text, timestamp: Math.floor(Date.now() / 1000) }]);
    setSending(true);
    try {
      const res = await fetch(`${BRIDGE_URL}/conversations/${activeId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, ...(data.messages || [data]).filter(m => m.role !== "user")]);
      }
    } catch {} finally { setSending(false); }
  };

  const handleNew = async () => {
    try {
      const res = await fetch(`${BRIDGE_URL}/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New OC Chat" }),
      });
      if (res.ok) {
        const d = await res.json();
        setActiveId(d.id || d.conversation?.id);
        setMessages([]);
        fetchConvs();
      }
    } catch {}
  };

  return (
    <DashboardPageLayout header={{ title: "OC Chat", description: "OpenClaude bridge chat", icon: EmailIcon }}>
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
      <div className="flex gap-0 h-[calc(100vh-16rem)] -mx-3 md:-mx-6 -mb-6">
        {/* Sidebar */}
        <div className={cn(
          "w-56 shrink-0 border-r border-border/40 flex flex-col transition-all",
          !showSidebar && "w-0 overflow-hidden"
        )}>
          <div className="p-3 border-b border-border/40">
            <Button onClick={handleNew} size="sm" className="w-full gap-1">
              <Plus className="h-4 w-4" /> New Chat
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.map(conv => (
              <div key={conv.id} onClick={() => setActiveId(conv.id)}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-sm transition-colors",
                  activeId === conv.id ? "bg-accent/50 text-foreground" : "text-muted-foreground hover:bg-accent/20"
                )}>
                <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{conv.title || `Chat ${conv.id}`}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col">
          {activeId ? (
            <>
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40">
                <button onClick={() => setShowSidebar(!showSidebar)} className="p-1 hover:bg-accent/30 rounded">
                  <ChevronLeft className={cn("h-4 w-4 text-muted-foreground transition-transform", !showSidebar && "rotate-180")} />
                </button>
                <span className="text-xs text-muted-foreground">
                  {messages.length} messages
                </span>
              </div>
              <div className="flex-1 overflow-y-auto py-2">
                {messages.map((msg, i) => (
                  <ChatMessage key={i} msg={msg} isLast={i === messages.length - 1} />
                ))}
                {sending && (
                  <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
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
                    placeholder="Message OC..."
                    className="flex-1 bg-accent/30 border border-border/50 rounded-lg px-3 py-2 text-sm"
                  />
                  <Button onClick={handleSend} disabled={sending || !input.trim()} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-sm text-muted-foreground gap-3">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30" />
              <p>Select or create a conversation</p>
              <Button onClick={handleNew} size="sm" variant="outline" className="gap-1">
                <Plus className="h-4 w-4" /> New Chat
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardPageLayout>
  );
}
