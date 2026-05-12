import { redirect } from "next/navigation";
import { UserManagementSection } from "@/components/users/user-management-section";
import { getSession } from "@/lib/auth";
import { UserService } from "@/services/user-service";

export const metadata = {
  title: "Pengguna | POS Multi Cabang",
};

export default async function UsersPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.roleName !== "admin" && session.roleId !== 1) {
    redirect("/dashboard");
  }

  const userService = new UserService();
  const [users, roles, branches] = await Promise.all([
    userService.listUsers(),
    userService.listRoles(),
    userService.listBranches(),
  ]);

  return (
    <UserManagementSection
      initialUsers={users}
      roles={roles}
      branches={branches}
      session={session}
    />
  );
}
