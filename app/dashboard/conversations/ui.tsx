"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import type { Conversation, ConversationContext } from "@/types";
import { MessageCircle, Send } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

function previewFromContext(ctx: ConversationContext | null | undefined) {
  if (!ctx) return "—";
  if (ctx.items?.length) {
    const first = ctx.items[0];
    return `${ctx.items.length} item(s) · e.g. ${first?.product_name ?? "…"}`;
  }
  if (ctx.order_id) return `Order ${String(ctx.order_id).slice(0, 8)}…`;
  return "Active chat";
}

function formatPhone(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.length >= 10) return `+${d.length > 10 ? d : `91${d.slice(-10)}`}`;
  return phone;
}

export default function ConversationsClient({ initialConversations }: { initialConversations: Conversation[] }) {
  const { push: toast } = useToast();
  const conversations = initialConversations;
  const [selectedId, setSelectedId] = useState<string | null>(initialConversations[0]?.id ?? null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const selected = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId],
  );

  const quickReplies = [
    "Your order is ready ✅",
    "Out of delivery area",
    "What's your address?",
  ];

  const send = useCallback(async () => {
    if (!selected || !message.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/wa/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: selected.customer_phone, message: message.trim() }),
      });
      const j = (await res.json()) as { data?: unknown; error?: { message?: string } | null };
      if (!res.ok) {
        toast(j.error?.message ?? "Send failed", "error");
        return;
      }
      setMessage("");
      toast("Message sent", "success");
    } catch {
      toast("Network error", "error");
    } finally {
      setSending(false);
    }
  }, [message, selected, toast]);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-4 px-3 pb-24 md:px-6 lg:h-[calc(100vh-6rem)] lg:flex-row lg:pb-6">
      <div className="card flex max-h-80 w-full flex-shrink-0 flex-col overflow-hidden border-porter-bg-border lg:max-h-none lg:w-[360px]">
        <div className="border-b border-porter-bg-border px-4 py-3">
          <p className="text-label text-porter-text-muted">Conversations</p>
          <p className="text-mono text-sm text-porter-text-primary">{conversations.length} threads</p>
        </div>
        <ul className="max-h-64 flex-1 divide-y divide-porter-bg-border overflow-y-auto lg:max-h-none">
          {conversations.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-porter-text-muted">
              No WhatsApp conversations yet. When customers message your catalog bot, they appear here.
            </li>
          ) : (
            conversations.map((c) => {
              const active = c.id === selectedId;
              const initials = (c.customer_phone.slice(-2) || "?").toUpperCase();
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    className={cn(
                      "flex w-full gap-3 px-4 py-3 text-left transition-colors",
                      active ? "bg-porter-bg-raised" : "hover:bg-porter-bg-raised/60",
                    )}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[--accent]/20 font-mono text-sm font-semibold text-[--accent]">
                      {initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-sm text-porter-text-primary">{formatPhone(c.customer_phone)}</p>
                      <p className="truncate text-xs text-porter-text-muted">{previewFromContext(c.context)}</p>
                      <p className="text-mono text-[10px] uppercase tracking-wide text-porter-text-muted">
                        {c.state.replace(/_/g, " ")}
                        {c.last_message_at
                          ? ` · ${new Date(c.last_message_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}`
                          : ""}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>

      <Card padding="md" className="flex min-h-[320px] flex-1 flex-col border-porter-bg-border lg:min-h-0">
        {!selected ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-porter-text-muted">
            <MessageCircle className="h-10 w-10 opacity-40" aria-hidden />
            <p className="text-sm">Select a conversation</p>
          </div>
        ) : (
          <>
            <div className="border-b border-porter-bg-border pb-4">
              <p className="font-mono text-lg text-porter-text-primary">{formatPhone(selected.customer_phone)}</p>
              <p className="text-body text-porter-text-secondary">{previewFromContext(selected.context)}</p>
              <a
                href={`https://wa.me/${selected.customer_phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex text-mono text-xs text-[--accent] hover:underline"
              >
                Open in WhatsApp
              </a>
            </div>

            <div className="flex flex-1 flex-col overflow-hidden pt-4">
              <div className="flex-1 overflow-y-auto rounded-[var(--radius-md)] border border-dashed border-porter-bg-border bg-porter-bg-base/40 p-4">
                <p className="text-center text-xs text-porter-text-muted">
                  Full message history lives in WhatsApp. Bot state:{" "}
                  <span className="font-mono text-porter-text-secondary">{selected.state}</span>. Use quick replies or type
                  below to send from your business number via Meta API.
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {quickReplies.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className="rounded-full border border-porter-bg-border px-3 py-1.5 text-xs text-porter-text-secondary hover:bg-porter-bg-raised hover:text-porter-text-primary"
                    onClick={() => setMessage(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <label htmlFor="wa-reply" className="sr-only">
                  Message
                </label>
                <textarea
                  id="wa-reply"
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message…"
                  className="input min-h-[44px] flex-1 resize-none py-3"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                />
                <Button type="button" loading={sending} onClick={() => void send()} className="shrink-0">
                  <Send className="h-4 w-4" aria-hidden />
                  Send
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
