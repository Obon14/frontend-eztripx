export type ListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type RegionListItem = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type CountryListItem = {
  id: number;
  name: string;
  region: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
};

export type CityListItem = {
  id: number;
  name: string;
  country: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: ListMeta;
};
