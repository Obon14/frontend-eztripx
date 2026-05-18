import { GeoListPage } from "@/components/admin/geo-list-page";

export default function CityPage() {
  return (
    <GeoListPage
      title="City"
      description="Kelola data kota untuk kebutuhan detail destination guide."
      kind="city"
      enableMutations
    />
  );
}
