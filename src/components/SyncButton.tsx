"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Check, AlertCircle } from "lucide-react";

export function SyncButton() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function handleSync() {
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Sync failed");
      }
      setStatus("success");
      setMessage(`Imported ${data.highlights ?? 0} highlights from ${data.books ?? 0} books.`);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Sync failed");
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        size="lg"
        onClick={handleSync}
        disabled={status === "loading"}
        className="gap-2"
      >
        {status === "loading" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <RefreshCw className="size-4" />
        )}
        {status === "loading" ? "Syncing..." : "Sync from Kindle"}
      </Button>

      {status === "success" && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <Check className="size-4" />
          {message}
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="size-4" />
          {message}
        </div>
      )}
    </div>
  );
}
