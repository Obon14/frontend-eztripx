import type { AdminUser, City, Country, DocumentGuide, Region } from "@/types/admin";

export const regions: Region[] = [
  { id: "r1", name: "Asia", code: "AS" },
  { id: "r2", name: "Europe", code: "EU" },
  { id: "r3", name: "America", code: "AM" },
];

export const countries: Country[] = [
  { id: "c1", name: "Indonesia", code: "ID", regionId: "r1" },
  { id: "c2", name: "Japan", code: "JP", regionId: "r1" },
  { id: "c3", name: "France", code: "FR", regionId: "r2" },
];

export const cities: City[] = [
  { id: "ct1", name: "Jakarta", countryId: "c1" },
  { id: "ct2", name: "Tokyo", countryId: "c2" },
  { id: "ct3", name: "Paris", countryId: "c3" },
];

export const adminUsers: AdminUser[] = [
  {
    id: "u1",
    name: "Olivia Admin",
    email: "olivia@extripx.com",
    role: "admin",
    status: "active",
  },
  {
    id: "u2",
    name: "Raka Editor",
    email: "raka@extripx.com",
    role: "editor",
    status: "active",
  },
];

export const documentGuides: DocumentGuide[] = [
  {
    id: "d1",
    title: "Tokyo Smart Travel Guide",
    priceIdr: 149000,
    priceUsd: 9.49,
    regionIds: ["r1"],
    countryIds: ["c2"],
    cityIds: ["ct2"],
    tags: ["food", "transport", "budget"],
    fileName: "tokyo-guide-v1.pdf",
    status: "published",
  },
  {
    id: "d2",
    title: "Paris Family Trip Guide",
    priceIdr: 199000,
    priceUsd: 12.49,
    regionIds: ["r2"],
    countryIds: ["c3"],
    cityIds: ["ct3"],
    tags: ["family", "museum", "itinerary"],
    fileName: "paris-family-guide.pdf",
    status: "draft",
  },
];

export const dashboardStats = {
  totalDocuments: documentGuides.length,
  totalRegions: regions.length,
  totalCountries: countries.length,
  totalCities: cities.length,
};
