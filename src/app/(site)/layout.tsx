import { MotionProvider } from "@/components/site/motion-provider";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getNavGroups, getSettings } from "@/lib/queries";

// The catalogue lives in Postgres, which is not reachable at build time; the
// query layer caches every read behind the "content" tag instead.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [groups, settings] = await Promise.all([getNavGroups(), getSettings()]);

  return (
    <>
      <SiteHeader
        groups={groups}
        phone={settings.phone ?? ""}
        instagram={settings.instagram ?? "AddedForms"}
      />
      <main>{children}</main>
      <SiteFooter settings={settings} />
      <MotionProvider />
    </>
  );
}
