import { LookbookCard } from "@/components/admin/lookbook-card";
import { listLookbook } from "@/lib/admin-queries";

export const metadata = { title: "Lookbook" };

export default async function LookbookPage() {
  const items = await listLookbook();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Lookbook</h1>
        <p className="text-sm text-muted-foreground">
          The horizontal editorial strip near the foot of the homepage. It scrubs sideways as the
          page scrolls.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <LookbookCard
            key={item.id}
            item={{
              id: item.id,
              url: item.url,
              alt: item.alt,
              width: item.width,
              height: item.height,
              size: item.size,
              position: item.position,
              active: item.active,
            }}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Add a frame</h2>
        <LookbookCard />
      </div>
    </div>
  );
}
