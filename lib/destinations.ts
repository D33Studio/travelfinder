export interface Destination {
  id: string;
  name: string;
  country: string;
  region: string;
  description: string;
  imageColor: string;
  emoji: string;
  rating: number;
  reviewCount: number;
  priceFrom: number;
  tags: string[];
  trending?: boolean;
}

export const destinations: Destination[] = [
  {
    id: "paris",
    name: "Paris",
    country: "France",
    region: "Europe",
    description: "The City of Light dazzles with iconic landmarks, world-class cuisine, and unmatched romance.",
    imageColor: "from-pink-400 to-rose-600",
    emoji: "🗼",
    rating: 4.8,
    reviewCount: 12840,
    priceFrom: 650,
    tags: ["Culture", "Romance", "Food", "Art"],
    trending: true,
  },
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    region: "Asia",
    description: "A neon-lit metropolis where ancient temples meet futuristic technology and incredible street food.",
    imageColor: "from-violet-400 to-purple-700",
    emoji: "🗾",
    rating: 4.9,
    reviewCount: 18320,
    priceFrom: 890,
    tags: ["Technology", "Food", "Culture", "Anime"],
    trending: true,
  },
  {
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    region: "Asia",
    description: "A tropical paradise of lush rice terraces, sacred temples, and stunning beach sunsets.",
    imageColor: "from-green-400 to-emerald-600",
    emoji: "🌴",
    rating: 4.7,
    reviewCount: 9450,
    priceFrom: 480,
    tags: ["Beach", "Wellness", "Culture", "Nature"],
    trending: true,
  },
  {
    id: "new-york",
    name: "New York",
    country: "USA",
    region: "Americas",
    description: "The city that never sleeps offers world-class arts, diverse neighborhoods, and endless energy.",
    imageColor: "from-sky-400 to-blue-700",
    emoji: "🗽",
    rating: 4.7,
    reviewCount: 22100,
    priceFrom: 720,
    tags: ["Urban", "Food", "Art", "Shopping"],
    trending: true,
  },
  {
    id: "rome",
    name: "Rome",
    country: "Italy",
    region: "Europe",
    description: "Walk through millennia of history among the Colosseum, Vatican, and cobblestone piazzas.",
    imageColor: "from-amber-400 to-orange-600",
    emoji: "🏛️",
    rating: 4.8,
    reviewCount: 15670,
    priceFrom: 580,
    tags: ["History", "Food", "Culture", "Architecture"],
  },
  {
    id: "cape-town",
    name: "Cape Town",
    country: "South Africa",
    region: "Africa",
    description: "Where mountains meet the ocean — vibrant culture, breathtaking scenery, and world-class wine.",
    imageColor: "from-teal-400 to-cyan-600",
    emoji: "🌊",
    rating: 4.6,
    reviewCount: 7320,
    priceFrom: 540,
    tags: ["Nature", "Adventure", "Food", "Wine"],
  },
  {
    id: "sydney",
    name: "Sydney",
    country: "Australia",
    region: "Oceania",
    description: "Stunning harbour, golden beaches, and a laid-back culture make Sydney utterly irresistible.",
    imageColor: "from-blue-400 to-indigo-600",
    emoji: "🦘",
    rating: 4.7,
    reviewCount: 11200,
    priceFrom: 990,
    tags: ["Beach", "Nature", "Urban", "Wildlife"],
  },
  {
    id: "machu-picchu",
    name: "Machu Picchu",
    country: "Peru",
    region: "Americas",
    description: "The legendary Incan citadel perched high in the Andes, shrouded in mist and mystery.",
    imageColor: "from-lime-400 to-green-700",
    emoji: "🏔️",
    rating: 4.9,
    reviewCount: 8940,
    priceFrom: 760,
    tags: ["History", "Adventure", "Nature", "Hiking"],
  },
  {
    id: "dubai",
    name: "Dubai",
    country: "UAE",
    region: "Middle East",
    description: "A city of superlatives — tallest towers, largest malls, and dazzling desert experiences.",
    imageColor: "from-yellow-400 to-amber-600",
    emoji: "🌆",
    rating: 4.6,
    reviewCount: 13800,
    priceFrom: 820,
    tags: ["Luxury", "Shopping", "Architecture", "Desert"],
  },
  {
    id: "santorini",
    name: "Santorini",
    country: "Greece",
    region: "Europe",
    description: "Iconic whitewashed villages, electric-blue domes, and spectacular caldera sunsets.",
    imageColor: "from-sky-300 to-blue-500",
    emoji: "🌅",
    rating: 4.8,
    reviewCount: 10650,
    priceFrom: 870,
    tags: ["Romance", "Beach", "Architecture", "Wine"],
  },
  {
    id: "kyoto",
    name: "Kyoto",
    country: "Japan",
    region: "Asia",
    description: "Traditional Japan at its finest — geisha districts, bamboo groves, and thousands of temples.",
    imageColor: "from-red-400 to-rose-700",
    emoji: "⛩️",
    rating: 4.9,
    reviewCount: 14300,
    priceFrom: 780,
    tags: ["Culture", "History", "Nature", "Temples"],
  },
  {
    id: "marrakech",
    name: "Marrakech",
    country: "Morocco",
    region: "Africa",
    description: "An intoxicating blend of colours, spices, and sounds in the heart of the medina.",
    imageColor: "from-orange-400 to-red-600",
    emoji: "🕌",
    rating: 4.5,
    reviewCount: 6780,
    priceFrom: 390,
    tags: ["Culture", "Food", "Shopping", "Architecture"],
  },
];

export const regions = ["All", "Europe", "Asia", "Americas", "Africa", "Oceania", "Middle East"];

export function filterDestinations(
  destinations: Destination[],
  query: string,
  region: string
): Destination[] {
  return destinations.filter((d) => {
    const matchesQuery =
      !query ||
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.country.toLowerCase().includes(query.toLowerCase()) ||
      d.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()));
    const matchesRegion = region === "All" || d.region === region;
    return matchesQuery && matchesRegion;
  });
}
