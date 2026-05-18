import { GeoListPage } from "@/components/admin/geo-list-page";

export default function CountryPage() {
  return (
    <GeoListPage
      title="Country"
      description="Kelola data negara untuk klasifikasi e-book panduan liburan."
      kind="country"
      enableMutations
    />
  );
}
