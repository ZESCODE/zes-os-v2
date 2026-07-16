import React from "react";
import { ExternalLink } from "lucide-react";

interface IFramePageProps {
  url: string;
  title?: string;
}

export default function IFramePage({ url, title }: IFramePageProps) {
  return (
    <div className="flex flex-col h-[calc(100vh-16rem)] -mx-3 md:-mx-6 -mb-6 rounded-lg overflow-hidden border border-border/50">
      <div className="flex items-center justify-between px-4 py-2 bg-accent/30 border-b border-border/40 text-xs text-muted-foreground shrink-0">
        <span className="truncate font-mono text-[10px]">{url}</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          <span>Open</span>
        </a>
      </div>
      <iframe
        src={url}
        title={title || url}
        className="w-full flex-1 border-0"
        style={{ background: "#0a0a0f" }}
      />
    </div>
  );
}
