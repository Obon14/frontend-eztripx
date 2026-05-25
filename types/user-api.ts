export type AdminUserRole = "USER" | "ADMIN";

export type AdminUserRow = {
  id: string;
  email: string;
  role: AdminUserRole;
  createdAt: string;
  updatedAt: string;
};
