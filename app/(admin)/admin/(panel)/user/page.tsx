import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/table";
import { adminUsers } from "@/lib/mock/admin-data";

export default function UserPage() {
  return (
    <section className="space-y-5">
      <Card>
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="mt-1 text-sm text-slate-600">Kelola user admin/editor untuk operasional panel.</p>
      </Card>

      <DataTable
        data={adminUsers}
        getRowKey={(row) => row.id}
        columns={[
          { key: "name", header: "Name", render: (row) => row.name },
          { key: "email", header: "Email", render: (row) => row.email },
          { key: "role", header: "Role", render: (row) => <Badge variant="primary">{row.role}</Badge> },
          {
            key: "status",
            header: "Status",
            render: (row) => (
              <Badge variant={row.status === "active" ? "accent" : "danger"}>{row.status}</Badge>
            ),
          },
        ]}
      />
    </section>
  );
}
