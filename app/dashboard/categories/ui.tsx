"use client";

import type { Category } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

export default function CategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const { push: toast } = useToast();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [busy, setBusy] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  function openCreate() {
    setEditing(null);
    setName("");
    setDescription("");
    setSortOrder(String(categories.length));
    setModalOpen(true);
  }

  function openEdit(c: Category) {
    setEditing(c);
    setName(c.name);
    setDescription(c.description ?? "");
    setSortOrder(String(c.sort_order ?? 0));
    setModalOpen(true);
  }

  const refresh = useCallback(async () => {
    const res = await fetch("/api/seller/categories");
    const json = (await res.json()) as { data?: Category[]; error?: { message?: string } };
    if (res.ok && json.data) setCategories(json.data);
  }, []);

  async function saveCategory() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast("Name is required", "error");
      return;
    }
    setBusy(true);
    const body = {
      name: trimmed,
      description: description.trim() || undefined,
      sort_order: parseInt(sortOrder, 10) || 0,
    };
    const url = editing ? `/api/seller/categories/${editing.id}` : "/api/seller/categories";
    const res = await fetch(url, {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as { data?: Category; error?: { message?: string } };
    setBusy(false);
    if (!res.ok) {
      toast(json.error?.message ?? "Save failed", "error");
      return;
    }
    toast(editing ? "Category updated" : "Category created", "success");
    setModalOpen(false);
    if (json.data) {
      setCategories((prev) => {
        if (editing) return prev.map((c) => (c.id === editing.id ? json.data! : c));
        return [...prev, json.data!].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      });
    } else {
      void refresh();
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    const res = await fetch(`/api/seller/categories/${deleteTarget.id}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      const json = (await res.json()) as { error?: { message?: string } };
      toast(json.error?.message ?? "Delete failed", "error");
      throw new Error("delete failed");
    }
    setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    toast("Category deleted", "success");
    setDeleteTarget(null);
  }

  return (
    <div className="px-3 pb-24 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-title text-porter-text-primary">Categories</h1>
          <p className="mt-1 text-body text-porter-text-secondary">
            Organize products for your storefront and bot.{" "}
            <Link href="/dashboard/inventory" className="text-porter-green-400 hover:underline">
              Inventory
            </Link>
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add category
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="No categories yet"
          description="Create categories to group products. Existing product category text was migrated automatically."
          action={
            <Button type="button" onClick={openCreate}>
              Add category
            </Button>
          }
        />
      ) : (
        <Card padding="md" className="mt-6 overflow-hidden p-0">
          <table className="w-full text-left text-body">
            <thead className="bg-porter-bg-surface text-label text-porter-text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="hidden px-4 py-3 sm:table-cell">Slug</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-t border-porter-bg-border">
                  <td className="px-4 py-3">
                    <p className="font-medium text-porter-text-primary">{c.name}</p>
                    {c.description ? <p className="text-sm text-porter-text-muted">{c.description}</p> : null}
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-sm text-porter-text-secondary sm:table-cell">{c.slug}</td>
                  <td className="px-4 py-3 text-mono text-porter-text-secondary">{c.sort_order ?? 0}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button type="button" size="sm" variant="secondary" onClick={() => openEdit(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button type="button" size="sm" variant="danger" onClick={() => setDeleteTarget(c)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit category" : "New category"}>
        <div className="space-y-4">
          <Input.Text id="cat-name" label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input.Textarea
            id="cat-desc"
            label="Description (optional)"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input.Text id="cat-sort" label="Sort order" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" loading={busy} onClick={() => void saveCategory()}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete category?"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" loading={busy} onClick={() => void confirmDelete()}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-body text-porter-text-secondary">
          Products in &ldquo;{deleteTarget?.name}&rdquo; will keep their category text but lose the link to this row.
        </p>
      </Modal>
    </div>
  );
}
