export type PillColor = "blue" | "green" | "amber" | "teal" | "olive" | "dim";

export interface Property {
  id: string;
  name: string;
  location: string;
  price: number;
  guests: number;
  bedrooms: number;
  pills: { label: string; color: PillColor }[];
  image: string;
}

export const properties: Property[] = [
  {
    id: "frosted-valley",
    name: "Frosted Valley Estate",
    location: "Norway",
    price: 1350,
    guests: 5,
    bedrooms: 3,
    pills: [
      { label: "Free Wifi", color: "blue" },
      { label: "City Views", color: "green" },
      { label: "Pool", color: "teal" },
      { label: "Fireplace", color: "olive" },
    ],
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&q=80",
  },
  {
    id: "coral-horizon",
    name: "Coral Horizon Villa",
    location: "Maldives",
    price: 2800,
    guests: 8,
    bedrooms: 5,
    pills: [
      { label: "Private Beach", color: "teal" },
      { label: "Overwater Deck", color: "blue" },
      { label: "Butler", color: "amber" },
    ],
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80",
  },
  {
    id: "alpine-noir",
    name: "Alpine Noir Chalet",
    location: "Switzerland",
    price: 4100,
    guests: 10,
    bedrooms: 6,
    pills: [
      { label: "Ski-in/out", color: "blue" },
      { label: "Hot Tub", color: "olive" },
      { label: "Chef", color: "amber" },
    ],
    image: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=600&q=80",
  },
  {
    id: "shinjuku-sky",
    name: "Shinjuku Sky Penthouse",
    location: "Tokyo",
    price: 1900,
    guests: 4,
    bedrooms: 2,
    pills: [
      { label: "Panoramic Views", color: "green" },
      { label: "Rooftop", color: "teal" },
      { label: "Concierge", color: "dim" },
    ],
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80",
  },
  {
    id: "ubud-jungle",
    name: "Ubud Jungle Retreat",
    location: "Bali",
    price: 980,
    guests: 6,
    bedrooms: 3,
    pills: [
      { label: "Infinity Pool", color: "olive" },
      { label: "Rice Fields", color: "green" },
      { label: "Spa", color: "amber" },
    ],
    image: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=600&q=80",
  },
  {
    id: "caldera-cliffside",
    name: "Caldera Cliffside Villa",
    location: "Santorini",
    price: 3200,
    guests: 6,
    bedrooms: 3,
    pills: [
      { label: "Sea Views", color: "blue" },
      { label: "Plunge Pool", color: "teal" },
      { label: "Breakfast", color: "dim" },
    ],
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80",
  },
  {
    id: "positano-sea",
    name: "Positano Sea Estate",
    location: "Amalfi",
    price: 2450,
    guests: 8,
    bedrooms: 4,
    pills: [
      { label: "Private Dock", color: "teal" },
      { label: "Ocean Terrace", color: "blue" },
      { label: "Wine Cellar", color: "olive" },
    ],
    image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600&q=80",
  },
  {
    id: "palm-skyline",
    name: "Palm Skyline Penthouse",
    location: "Dubai",
    price: 5500,
    guests: 10,
    bedrooms: 5,
    pills: [
      { label: "Burj Views", color: "amber" },
      { label: "Rooftop Pool", color: "blue" },
      { label: "Butler", color: "dim" },
    ],
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80",
  },
  {
    id: "queenstown-lake",
    name: "Queenstown Lake Lodge",
    location: "New Zealand",
    price: 1750,
    guests: 8,
    bedrooms: 4,
    pills: [
      { label: "Lake Views", color: "green" },
      { label: "Boat Access", color: "teal" },
      { label: "Fire Pit", color: "olive" },
    ],
    image: "https://images.unsplash.com/photo-1469521669194-babb45599def?w=600&q=80",
  },
  {
    id: "marrakech-riad",
    name: "Marrakech Riad Palace",
    location: "Morocco",
    price: 1100,
    guests: 12,
    bedrooms: 6,
    pills: [
      { label: "Courtyard Pool", color: "amber" },
      { label: "Rooftop", color: "dim" },
    ],
    image: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=600&q=80",
  },
  {
    id: "cap-ferrat",
    name: "Cap Ferrat Mansion",
    location: "Côte d'Azur",
    price: 8200,
    guests: 16,
    bedrooms: 8,
    pills: [
      { label: "Med Views", color: "blue" },
      { label: "Private Pool", color: "teal" },
      { label: "Tennis", color: "green" },
    ],
    image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600&q=80",
  },
  {
    id: "maasai-mara",
    name: "Maasai Mara Safari Lodge",
    location: "Kenya",
    price: 3800,
    guests: 4,
    bedrooms: 2,
    pills: [
      { label: "Game Drives", color: "amber" },
      { label: "Bush Dining", color: "olive" },
      { label: "All-Inclusive", color: "dim" },
    ],
    image: "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=600&q=80",
  },
];
