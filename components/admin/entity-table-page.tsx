"use client";

import { Pencil, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { DataTable } from "@/components/ui/table";

type Entity = {
  id: string;
  name: string;
};

type EntityTablePageProps = {
  title: string;
  description: string;
  entities: Entity[];
};

export function EntityTablePage({ title, description, entities }: EntityTablePageProps) {
  const [rows, setRows] = useState<Entity[]>(entities);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => row.name.toLowerCase().includes(q));
  }, [rows, search]);

  const columns = useMemo(
    () => [
      { key: "name", header: "Name", render: (row: Entity) => row.name },
      {
        key: "action",
        header: "Action",
        className: "w-[120px]",
        render: (row: Entity) => (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-9 w-9 shrink-0 p-0 text-slate-600 hover:text-admin-primary-700"
              aria-label={`Edit ${row.name}`}
              onClick={() => {
                setEditingId(row.id);
                setName(row.name);
                setOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-9 w-9 shrink-0 p-0 text-slate-600 hover:text-red-600"
              aria-label={`Delete ${row.name}`}
              onClick={() => setRows((prev) => prev.filter((r) => r.id !== row.id))}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  function openCreate() {
    setEditingId(null);
    setName("");
    setOpen(true);
  }

  function handleSave() {
    if (!name.trim()) return;

    if (editingId) {
      setRows((prev) =>
        prev.map((row) => (row.id === editingId ? { ...row, name: name.trim() } : row)),
      );
    } else {
      setRows((prev) => [
        ...prev,
        {
          id: `${title}-${Date.now()}`,
          name: name.trim(),
        },
      ]);
    }
    setName("");
    setEditingId(null);
    setOpen(false);
  }

  function handleModalClose() {
    setOpen(false);
    setName("");
    setEditingId(null);
  }

  return (
    <section>
      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          </div>
          <Button onClick={openCreate}>Add {title}</Button>
        </div>

        <div className="p-5">
          <div className="relative mb-4 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder={`Search ${title.toLowerCase()}...`}
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={`Search ${title}`}
            />
          </div>

          <DataTable
            columns={columns}
            data={filteredRows}
            emptyMessage={`No ${title.toLowerCase()} data`}
            getRowKey={(row) => row.id}
          />
        </div>
      </Card>

      <Modal
        open={open}
        onClose={handleModalClose}
        title={editingId ? `Edit ${title}` : `Create ${title}`}
        description={
          editingId
            ? `Update ${title.toLowerCase()} name.`
            : `Add a new ${title.toLowerCase()} for document classification.`
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        }
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
          <Input value={name} onChange={(event) => setName(event.target.value)} autoFocus />
        </div>
      </Modal>
    </section>
  );
}
