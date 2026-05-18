export type Destination = {
  id: string;
  image: string;
  rating: number;
  price: number;
  title: { id: string; en: string };
  location: { id: string; en: string };
};

export const destinations: Destination[] = [
  {
    id: "1",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
    rating: 4.8,
    price: 25,
    title: { id: "Arung Jeram Serayu", en: "Serayu Rafting" },
    location: { id: "Dieng, Indonesia", en: "Dieng, Indonesia" },
  },
  {
    id: "2",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop",
    rating: 4.6,
    price: 32,
    title: { id: "Trekking Gunung Bromo", en: "Mount Bromo Trek" },
    location: { id: "Jawa Timur, Indonesia", en: "East Java, Indonesia" },
  },
  {
    id: "3",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef245b470?w=600&h=400&fit=crop",
    rating: 4.5,
    price: 20,
    title: { id: "Sunrise Pantai Pink", en: "Pink Beach Sunrise" },
    location: { id: "Lombok, Indonesia", en: "Lombok, Indonesia" },
  },
];

export const mapPins = [
  { id: "a", top: "28%", left: "22%", label: "Americas" },
  { id: "b", top: "35%", left: "48%", label: "Europe" },
  { id: "c", top: "42%", left: "62%", label: "Asia" },
  { id: "d", top: "58%", left: "72%", label: "Oceania" },
  { id: "e", top: "52%", left: "38%", label: "Africa" },
];

export const footerLinks = {
  about: ["About Us", "Features", "News & Blog"],
  movement: ["What EzTripx", "Support Us"],
  company: ["Why EzTripx", "Capital", "Security"],
  support: ["FAQs", "Support Center", "Contact Us"],
};
