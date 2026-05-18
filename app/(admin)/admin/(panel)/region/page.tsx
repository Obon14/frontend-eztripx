import { GeoListPage } from "@/components/admin/geo-list-page";

export default function RegionPage() {
  return (
    <GeoListPage
      title="Region"
      description="Kelola data benua untuk tagging document guide traveler."
      kind="region"
      enableMutations
    />
  );
}
