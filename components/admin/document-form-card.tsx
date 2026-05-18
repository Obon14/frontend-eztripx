"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cities, countries, regions } from "@/lib/mock/admin-data";

export function DocumentFormCard() {
  const [title, setTitle] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTitle("");
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-900">Upload Document Guide (Frontend Only)</h2>
      <p className="mt-1 text-sm text-slate-600">
        Form ini simulasi untuk alur input dokumen, tag lokasi, dan harga.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Document Title</label>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} required />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Region</label>
          <Select defaultValue="">
            <option value="" disabled>
              Select region
            </option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Country</label>
          <Select defaultValue="">
            <option value="" disabled>
              Select country
            </option>
            {countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">City</label>
          <Select defaultValue="">
            <option value="" disabled>
              Select city
            </option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Price (IDR)</label>
          <Input type="number" min={0} placeholder="149000" required />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Tags</label>
          <Input placeholder="budget, itinerary, family" />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">File Name / URL</label>
          <Input placeholder="tokyo-guide-v1.pdf or https://..." />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
          <Textarea placeholder="Describe the guide content..." />
        </div>

        <div className="md:col-span-2 flex justify-end">
          <Button type="submit">Save Document</Button>
        </div>
      </form>
    </Card>
  );
}
