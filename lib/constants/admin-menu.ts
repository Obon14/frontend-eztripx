import { BookOpen, Globe2, Home, Map, MapPinned, Users } from "lucide-react";

export const adminMenu = [
  { label: "Home", href: "/admin/home", icon: Home },
  { label: "Region", href: "/admin/region", icon: Globe2 },
  { label: "Country", href: "/admin/country", icon: Map },
  { label: "City", href: "/admin/city", icon: MapPinned },
  { label: "Document Guide", href: "/admin/document-guide", icon: BookOpen },
  { label: "User", href: "/admin/user", icon: Users },
];
