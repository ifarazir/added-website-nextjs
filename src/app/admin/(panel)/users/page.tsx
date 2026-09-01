import { redirect } from "next/navigation";

import { deleteUser, listUsers } from "@/app/admin/_actions/users";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { UserDialog } from "@/components/admin/user-dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Accounts" };

export default async function UsersPage() {
  const actor = await getCurrentUser();
  // Editors have no business here; the nav hides it, this enforces it.
  if (actor?.role !== "admin") redirect("/admin");

  const accounts = await listUsers();
  const admins = accounts.filter((account) => account.role === "admin").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Accounts</h1>
          <p className="text-sm text-muted-foreground">
            {accounts.length} account{accounts.length === 1 ? "" : "s"} · {admins} admin
            {admins === 1 ? "" : "s"}.
          </p>
        </div>
        <UserDialog />
      </div>

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Last signed in</TableHead>
              <TableHead className="w-40" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => {
              const isSelf = account.id === actor.id;
              const isLastAdmin = account.role === "admin" && admins === 1;

              return (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">
                    {account.name}
                    {isSelf && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{account.email}</TableCell>
                  <TableCell>
                    <Badge variant={account.role === "admin" ? "default" : "secondary"}>
                      {account.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {account.lastLoginAt ? formatDate(account.lastLoginAt) : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <UserDialog
                        user={{
                          id: account.id,
                          name: account.name,
                          email: account.email,
                          role: account.role,
                        }}
                      />
                      {isSelf || isLastAdmin ? (
                        <span
                          className="px-3 py-1.5 text-sm text-muted-foreground"
                          title={
                            isSelf
                              ? "You cannot delete your own account."
                              : "The last admin cannot be removed."
                          }
                        >
                          Delete
                        </span>
                      ) : (
                        <ConfirmButton
                          action={deleteUser}
                          id={account.id}
                          title={`Remove ${account.name}?`}
                          description={`${account.email} will no longer be able to sign in. Nothing they created is deleted.`}
                          confirmLabel="Remove account"
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
