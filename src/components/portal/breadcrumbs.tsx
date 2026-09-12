import { Fragment } from "react";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { MUSIC_EVENT_PATH, YEAR_PATH } from "@/lib/routes";

export type TrailItem = { label: string; href?: string };

export function PageTrail({ items }: { items: TrailItem[] }) {
  return <Breadcrumb className="page-trail" aria-label="Page location"><BreadcrumbList>
    {items.map((item, index) => <Fragment key={`${item.label}-${index}`}>
      {index > 0 && <BreadcrumbSeparator />}
      <BreadcrumbItem>{item.href ? <BreadcrumbLink asChild><Link href={item.href}>{item.label}</Link></BreadcrumbLink> : <BreadcrumbPage>{item.label}</BreadcrumbPage>}</BreadcrumbItem>
    </Fragment>)}
  </BreadcrumbList></Breadcrumb>;
}

export function MusicTrail({ current }: { current: string }) {
  return <PageTrail items={[{ label: "All hackathons", href: "/" }, { label: "2026", href: YEAR_PATH }, { label: "Music & AI", href: MUSIC_EVENT_PATH }, { label: current }]} />;
}
