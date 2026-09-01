import { SettingsForm } from "@/components/admin/settings-form";
import { getSettingsRow } from "@/lib/admin-queries";
import { DEFAULT_SETTINGS } from "@/lib/queries";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const row = await getSettingsRow();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Homepage copy, the marquee band and the studio's contact details.
        </p>
      </div>

      <SettingsForm
        settings={{
          aboutEyebrow: row?.aboutEyebrow ?? DEFAULT_SETTINGS.aboutEyebrow,
          aboutHeading: row?.aboutHeading ?? DEFAULT_SETTINGS.aboutHeading,
          aboutBody: row?.aboutBody ?? DEFAULT_SETTINGS.aboutBody,
          marqueeText: row?.marqueeText ?? DEFAULT_SETTINGS.marqueeText,
          showMarquee: row?.showMarquee ?? DEFAULT_SETTINGS.showMarquee,
          heroAutoplay: row?.heroAutoplay ?? DEFAULT_SETTINGS.heroAutoplay,
          email: row?.email ?? DEFAULT_SETTINGS.email,
          phone: row?.phone ?? DEFAULT_SETTINGS.phone,
          instagram: row?.instagram ?? DEFAULT_SETTINGS.instagram,
          pinterest: row?.pinterest ?? "",
          city: row?.city ?? DEFAULT_SETTINGS.city,
        }}
      />
    </div>
  );
}
