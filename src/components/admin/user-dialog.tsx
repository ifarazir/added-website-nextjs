"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { createUser, updateUser } from "@/app/admin/_actions/users";
import { Field, FormMessage, SubmitButton } from "@/components/admin/form-parts";
import { useFormAction } from "@/components/admin/use-form-action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type UserValues = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor";
};

export function UserDialog({ user }: { user?: UserValues }) {
  const [open, setOpen] = useState(false);
  const { state, pending, formProps } = useFormAction(user ? updateUser : createUser);

  useEffect(() => {
    if (state.status === "ok") {
      toast.success(state.message);
      setOpen(false);
    }
  }, [state]);

  const key = user?.id ?? "new";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {user ? (
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        ) : (
          <Button>
            <Plus /> New account
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? `Edit ${user.name}` : "New account"}</DialogTitle>
          <DialogDescription>
            Editors manage the catalogue. Admins can also add and remove accounts.
          </DialogDescription>
        </DialogHeader>

        <form {...formProps} className="flex flex-col gap-5">
          {user && <input type="hidden" name="id" value={user.id} />}

          <Field label="Name" htmlFor={`name-${key}`} error={state.errors?.name}>
            <Input id={`name-${key}`} name="name" required defaultValue={user?.name ?? ""} />
          </Field>

          <Field label="Email" htmlFor={`email-${key}`} error={state.errors?.email}>
            <Input
              id={`email-${key}`}
              name="email"
              type="email"
              required
              autoComplete="off"
              defaultValue={user?.email ?? ""}
            />
          </Field>

          <Field label="Role" htmlFor={`role-${key}`} error={state.errors?.role}>
            <Select name="role" defaultValue={user?.role ?? "editor"}>
              <SelectTrigger id={`role-${key}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field
            label={user ? "New password" : "Password"}
            htmlFor={`password-${key}`}
            hint={user ? "Leave blank to keep the current one." : "At least 10 characters."}
            error={state.errors?.password}
          >
            <Input
              id={`password-${key}`}
              name="password"
              type="password"
              autoComplete="new-password"
              required={!user}
            />
          </Field>

          <FormMessage state={state} />
          <SubmitButton pending={pending}>{user ? "Save" : "Create account"}</SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
