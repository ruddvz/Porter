"use client";

import type { ConversationListRow } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { ConversationMessage, Seller } from "@/types";
import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const QUICK_REPLIES = [
  "Your order is ready ✅",
  "Out of delivery area",
  "What's your address?",
];

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return phone;
  const last4 = digits.slice(-4);
  if (digits.length === 10) return `+91 •••• ${last4}`;
  if (digits.length > 10) {
    const cc = digits.slice(0, digits.length - 10);
    return `+${cc} •••• ${last4}`;
  }
  return `•••• ${last4}`;
}

function formatThreadTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  if (sameDay) return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return (
    d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
    " " +
    d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
  );
}

export default function ConversationsClient({
  seller,
  initialRows,
}: {
  seller: Seller;
  initialRows: ConversationListRow[];
}) {
  const supabase = createSupabaseBrowserClient();
  const { push: toast } = useToast();
  const [rows, setRows] = useState(initialRows);
  const [activeId, setActiveId] = useState<string | null>(initialRows[0]?.id ?? null);
  const [mobileThread, setMobileThread] = useState(false);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const active = useMemo(() => rows.find((r) => r.id === activeId) ?? null, [rows, activeId]);

  const loadMessages = useCallback(
    async (conversationId: string) => {
      setLoadingMsgs(true);
      const { data, error } = await supabase
        .from("conversation_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      setLoadingMsgs(false);
      if (error) {
        toast(error.message, "error");
        setMessages([]);
        return;
      }
      setMessages((data as ConversationMessage[]) ?? []);
    },
    [supabase, toast],
  );

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    void loadMessages(activeId);
  }, [activeId, loadMessages]);

  useEffect(() => {
    const filter = `seller_id=eq.${seller.id}`;
    const channel = supabase
      .channel(`conversation-messages-${seller.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "conversation_messages", filter },
        (payload) => {
          const row = payload.new as ConversationMessage;
          setRows((prev) => {
            const idx = prev.findIndex((r) => r.id === row.conversation_id);
            if (idx < 0) return prev;
            const next = [...prev];
            next[idx] = { ...next[idx], last_message_at: row.created_at };
            const [hit] = next.splice(idx, 1);
            return [hit, ...next];
          });
          if (row.conversation_id === activeId) {
            setMessages((prev) => [...prev, row]);
          }
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, seller.id, activeId]);

  async function send() {
    const text = draft.trim();
    if (!activeId || !text) return;
    setSending(true);
    try {
      const res = await fetch("/api/wa/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeId, message: text }),
      });
      const json = (await res.json()) as { data: unknown; error: { message?: string } | null };
      if (!res.ok || json.error) {
        toast(json.error?.message ?? "Send failed", "error");
        return;
      }
      setDraft("");
      toast("Message sent", "success");
    } finally {
      setSending(false);
    }
  }

  function openThread(id: string) {
    setActiveId(id);
    setMobileThread(true);
  }

  return (
    <div className="flex min-h-[calc(100dvh-6rem)] flex-col gap-3 md:flex-row md:gap-0">
      <aside
        className={`flex w-full shrink-0 flex-col border-porter-bg-border md:w-96 md:border-r ${
          mobileThread ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="border-b border-porter-bg-border px-3 py-3">
          <h1 className="text-heading text-porter-text-primary">Chats</h1>
          <p className="mt-1 text-xs text-porter-text-muted">WhatsApp threads for your store</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {rows.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-porter-text-muted">No conversations yet.</p>
          ) : (
            <ul className="divide-y divide-porter-bg-border">
              {rows.map((r) => {
                const selected = r.id === activeId;
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => openThread(r.id)}
                      className={`flex w-full items-start gap-3 px-3 py-3 text-left transition-colors ${
                        selected ? "bg-porter-green-500/10" : "hover:bg-porter-bg-raised"
                      }`}
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-porter-green-500/20 text-sm font-bold text-porter-green-400">
                        {(r.customer_name || r.customer_phone).slice(0, 1).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-porter-text-primary">
                          {r.customer_name?.trim() || "Customer"}
                        </span>
                        <span className="text-mono block truncate text-xs text-porter-text-muted">{maskPhone(r.customer_phone)}</span>
                        <span className="mt-1 line-clamp-2 text-xs text-porter-text-secondary">
                          {r.last_message_at ? "Last activity " + formatThreadTime(r.last_message_at) : "New"}
                        </span>
                      </span>
                      <span className="rounded border border-porter-bg-border px-1.5 py-0.5 text-[10px] font-semibold uppercase text-porter-text-muted">
                        {r.state.replace(/_/g, " ")}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      <section
        className={`flex min-h-[50dvh] flex-1 flex-col border-porter-bg-border md:border-0 ${
          mobileThread ? "flex" : "hidden md:flex"
        }`}
      >
        {active ? (
          <>
            <div className="flex items-center gap-2 border-b border-porter-bg-border px-3 py-2 md:hidden">
              <Button type="button" variant="ghost" size="sm" className="min-h-11 px-2" onClick={() => setMobileThread(false)}>
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-porter-text-primary">{active.customer_name || "Customer"}</p>
                <p className="text-mono truncate text-xs text-porter-text-muted">{maskPhone(active.customer_phone)}</p>
              </div>
            </div>
            <div className="hidden border-b border-porter-bg-border px-4 py-3 md:block">
              <h2 className="text-title text-porter-text-primary">{active.customer_name || "Customer"}</h2>
              <p className="text-mono text-sm text-porter-text-muted">{maskPhone(active.customer_phone)}</p>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-4 md:px-4">
              {loadingMsgs ? (
                <p className="text-sm text-porter-text-muted">Loading messages…</p>
              ) : messages.length === 0 ? (
                <Card padding="md" variant="default" className="border-dashed border-porter-bg-border">
                  <p className="text-sm text-porter-text-secondary">
                    No stored messages yet for this chat. Apply migration{" "}
                    <code className="text-mono text-xs text-porter-green-400">013_conversation_messages.sql</code>, then new
                    WhatsApp traffic will appear here.
                  </p>
                </Card>
              ) : (
                <ul className="flex flex-col gap-3">
                  {messages.map((m) => (
                    <li key={m.id} className={`flex ${m.direction === "out" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                          m.direction === "out"
                            ? "border border-porter-green-500/25 bg-porter-green-500/10 text-porter-text-primary"
                            : "border border-porter-bg-border bg-porter-bg-surface text-porter-text-secondary"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words text-porter-text-primary">{m.body}</p>
                        <p className="mt-1 text-mono text-[10px] uppercase tracking-wide text-porter-text-muted">
                          {formatThreadTime(m.created_at)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="shrink-0 border-t border-porter-bg-border bg-porter-bg-base/80 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:px-4">
              <div className="mb-2 flex flex-wrap gap-2">
                {QUICK_REPLIES.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className="rounded-full border border-porter-bg-border bg-porter-bg-raised px-2.5 py-1 text-xs text-porter-text-secondary hover:border-porter-green-500/40 hover:text-porter-text-primary"
                    onClick={() => setDraft((d) => (d ? `${d} ${q}` : q))}
                  >
                    {q}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input.Textarea
                  id="wa-reply"
                  label="Message"
                  className="min-h-[88px] flex-1"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a WhatsApp message…"
                  rows={3}
                />
                <Button
                  type="button"
                  variant="primary"
                  className="self-end"
                  loading={sending}
                  disabled={!draft.trim()}
                  onClick={() => void send()}
                  aria-label="Send WhatsApp"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              <p className="mt-2 text-[11px] text-porter-text-muted">
                Sends via your connected Meta WhatsApp number. Meta may block sends outside the customer service window.
              </p>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center text-porter-text-muted">
            <MessageCircle className="h-10 w-10 opacity-40" aria-hidden />
            <p className="text-sm">Select a conversation</p>
          </div>
        )}
      </section>
    </div>
  );
}
