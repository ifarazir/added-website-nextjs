"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { saveSettings } from "@/app/admin/_actions/content";
import { Field, FormMessage, SubmitButton } from "@/components/admin/form-parts";
import { useFormAction } from "@/components/admin/use-form-action";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type Values = {
  aboutEyebrow: string | null;
  aboutHeading: string | null;
  aboutBody: string | null;
  marqueeText: string | null;
  showMarquee: boolean;
  heroAutoplay: boolean;
  email: string | null;
  phone: string | null;
  instagram: string | null;
  pinterest: string | null;
  city: string | null;
};

export function SettingsForm({ settings }: { settings: Values }) {
  const { state, onSubmit, pending } = useFormAction(saveSettings);

  useEffect(() => {
    if (state.status === "ok") toast.success(state.message);
  }, [state]);

  return (
    <form onSubmit={onSubmit} className="flex max-w-3xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Manifesto</CardTitle>
          <CardDescription>The About block below the hero.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <Field label="Eyebrow" htmlFor="aboutEyebrow">
            <Input id="aboutEyebrow" name="aboutEyebrow" defaultValue={settings.aboutEyebrow ?? ""} />
          </Field>
          <Field label="Heading" htmlFor="aboutHeading" hint="Set in the display face, uppercase.">
            <Textarea
              id="aboutHeading"
              name="aboutHeading"
              rows={2}
              defaultValue={settings.aboutHeading ?? ""}
            />
          </Field>
          <Field label="Body" htmlFor="aboutBody">
            <Textarea id="aboutBody" name="aboutBody" rows={5} defaultValue={settings.aboutBody ?? ""} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Homepage behaviour</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="heroAutoplay">Hero autoplay</Label>
              <span className="text-xs text-muted-foreground">
                Ignored for visitors who ask for reduced motion.
              </span>
            </div>
            <Switch id="heroAutoplay" name="heroAutoplay" defaultChecked={settings.heroAutoplay} />
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="showMarquee">Show the marquee band</Label>
            <Switch id="showMarquee" name="showMarquee" defaultChecked={settings.showMarquee} />
          </div>

          <Field label="Marquee text" htmlFor="marqueeText" hint="Scrolls in the acid-yellow band above the index.">
            <Textarea
              id="marqueeText"
              name="marqueeText"
              rows={3}
              defaultValue={settings.marqueeText ?? ""}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
          <CardDescription>Used in the header menu, the footer and every enquiry link.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Email" htmlFor="email">
            <Input id="email" name="email" type="email" defaultValue={settings.email ?? ""} />
          </Field>
          <Field label="Phone" htmlFor="phone">
            <Input id="phone" name="phone" defaultValue={settings.phone ?? ""} />
          </Field>
          <Field label="Instagram handle" htmlFor="instagram">
            <Input id="instagram" name="instagram" defaultValue={settings.instagram ?? ""} />
          </Field>
          <Field label="Pinterest URL" htmlFor="pinterest">
            <Input id="pinterest" name="pinterest" defaultValue={settings.pinterest ?? ""} />
          </Field>
          <Field label="City" htmlFor="city">
            <Input id="city" name="city" defaultValue={settings.city ?? ""} />
          </Field>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <FormMessage state={state} />
        <SubmitButton pending={pending} className="w-fit">Save settings</SubmitButton>
      </div>
    </form>
  );
}
