import { deleteSubscriber } from "@/app/admin/_actions/content";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { CopyEmailsButton } from "@/components/admin/copy-emails-button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listSubscribers } from "@/lib/admin-queries";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Subscribers" };

export default async function SubscribersPage() {
  const subscribers = await listSubscribers();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Subscribers</h1>
          <p className="text-sm text-muted-foreground">
            {subscribers.length} address{subscribers.length === 1 ? "" : "es"} from the footer form.
          </p>
        </div>
        {subscribers.length > 0 && (
          <CopyEmailsButton emails={subscribers.map((s) => s.email)} />
        )}
      </div>

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Subscribed</TableHead>
              <TableHead className="w-28" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                  No one has signed up yet.
                </TableCell>
              </TableRow>
            )}

            {subscribers.map((subscriber) => (
              <TableRow key={subscriber.id}>
                <TableCell className="font-medium">{subscriber.email}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(subscriber.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <ConfirmButton
                    action={deleteSubscriber}
                    id={subscriber.id}
                    label="Remove"
                    title="Remove this subscriber?"
                    description={`${subscriber.email} will be deleted from the list.`}
                    confirmLabel="Remove"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
