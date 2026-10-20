import React, { useMemo } from "react";
import { Clock } from "lucide-react";
import { calculateReadingTime } from "../utils/markdownHelpers";

export default function ReadingStatsBadge({ content = "", className = "" }) {
  const stats = useMemo(() => {
    return calculateReadingTime(content);
  }, [content]);

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all ${className}`}
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        color: "var(--text-muted)",
      }}
      title={`${stats.words.toLocaleString()} words · ${stats.chars.toLocaleString()} characters · ${stats.text}`}
    >
      <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--accent)" }} />
      <span className="flex items-center gap-1.5 flex-wrap">
        <span>
          <strong className="font-semibold" style={{ color: "var(--text-primary)" }}>
            {stats.words.toLocaleString()}
          </strong>{" "}
          words
        </span>
        <span className="opacity-40">•</span>
        <span>
          <strong className="font-semibold" style={{ color: "var(--text-primary)" }}>
            {stats.chars.toLocaleString()}
          </strong>{" "}
          chars
        </span>
        <span className="opacity-40">•</span>
        <span className="font-semibold" style={{ color: "var(--accent-light)" }}>
          {stats.text}
        </span>
      </span>
    </div>
  );
}
