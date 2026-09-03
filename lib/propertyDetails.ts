import { Property, PillColor, properties, popularDestinations } from "./properties";
import type { IconName } from "@/components/Icon";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type PropertyKind =
  | "alpine"
  | "beach"
  | "city"
  | "jungle"
  | "coastal"
  | "safari"
  | "heritage"
  | "countryside";

export interface Highlight {
  icon: IconName;
  title: string;
  text: string;
}

export interface AmenityGroup {
  title: string;
  items: { icon: IconName; label: string }[];
}

export interface RoomRate {
  id: string;
  name: string;
  price: number;
  perks: { label: string; included: boolean }[];
  note?: string;
}

export interface Room {
  id: string;
  name: string;
  size: number; // m²
  bed: string;
  sleeps: number;
  view: string;
  image: string;
  features: { label: string; color: PillColor }[];
  rates: RoomRate[];
  left?: number;
}

export interface Review {
  name: string;
  from: string;
  date: string;
  score: number;
  title: string;
  text: string;
  stay: string;
}

export interface NearbyPlace {
  icon: IconName;
  name: string;
  distance: string;
}

export interface PropertyDetail extends Property {
  kind: PropertyKind;
  kindLabel: string;
  tagline: string;
  rating: number;
  reviewCount: number;
  stars: number;
  bathrooms: number;
  sizeSqm: number;
  description: string[];
  highlights: Highlight[];
  gallery: string[];
  amenities: AmenityGroup[];
  rooms: Room[];
  reviews: Review[];
  scores: { label: string; value: number }[];
  address: string;
  nearby: NearbyPlace[];
  locationBlurb: string;
  checkIn: string;
  checkOut: string;
  policies: { title: string; text: string }[];
  goodToKnow: string[];
  fees: string[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80`;

/** Small deterministic hash so ratings/counts vary per property but stay stable across renders. */
function seed(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

const round5 = (n: number) => Math.round(n / 5) * 5;

/* ------------------------------------------------------------------ */
/*  Per-kind content                                                   */
/* ------------------------------------------------------------------ */

interface KindContent {
  label: string;
  highlights: Highlight[];
  amenities: AmenityGroup[];
  gallery: string[];
  roomImages: string[];
  rooms: Omit<Room, "id" | "image" | "rates">[];
  reviews: Review[];
  checkIn: string;
  checkOut: string;
  policies: { title: string; text: string }[];
}

const shared = {
  services: [
    { icon: "concierge" as IconName, label: "24-hour concierge" },
    { icon: "key" as IconName, label: "Private check-in" },
    { icon: "car" as IconName, label: "Airport transfers" },
    { icon: "laundry" as IconName, label: "Laundry & pressing" },
  ],
  inRoom: [
    { icon: "wifi" as IconName, label: "High-speed WiFi" },
    { icon: "coffee" as IconName, label: "Espresso machine" },
    { icon: "safe" as IconName, label: "In-room safe" },
    { icon: "bath" as IconName, label: "Rain shower & tub" },
    { icon: "tv" as IconName, label: "65\" smart TV" },
    { icon: "bed" as IconName, label: "Pillow menu" },
  ],
};

const kinds: Record<PropertyKind, KindContent> = {
  alpine: {
    label: "Mountain lodge",
    highlights: [
      { icon: "mountain", title: "Ski-in, ski-out", text: "Step straight from the boot room onto groomed pistes each morning." },
      { icon: "flame", title: "Open-hearth fireplace", text: "A stone hearth anchors the great room, lit by staff every afternoon." },
      { icon: "spa", title: "Alpine spa", text: "Cedar sauna, outdoor hot tub and a plunge pool fed by mountain water." },
      { icon: "chef", title: "Private chef on request", text: "Regional tasting menus built around the day's market haul." },
    ],
    amenities: [
      { title: "Wellness", items: [{ icon: "spa", label: "Cedar sauna" }, { icon: "hottub", label: "Outdoor hot tub" }, { icon: "gym", label: "Fitness studio" }, { icon: "spa", label: "In-villa massage" }] },
      { title: "Dining", items: [{ icon: "chef", label: "Private chef" }, { icon: "wine", label: "Curated wine cellar" }, { icon: "restaurant", label: "Fondue kitchen" }, { icon: "coffee", label: "Breakfast served daily" }] },
      { title: "Outdoors", items: [{ icon: "mountain", label: "Ski room & boot warmers" }, { icon: "tree", label: "Guided snowshoe trails" }, { icon: "sun", label: "South-facing terrace" }, { icon: "car", label: "Heated garage" }] },
      { title: "Services", items: shared.services },
      { title: "In-room", items: shared.inRoom },
    ],
    gallery: ["1502784444187-359ac186c5bb", "1548777123-e216912df7d8", "1520250497591-112f2f40a3f4", "1571896349842-33c89424de2d", "1584132967334-10e028bd69f7", "1560448204-e02f11c3d0e2"],
    roomImages: ["1611892440504-42a792e24d32", "1618773928121-c32242e63f39", "1631049307264-da0ec4d70f1f"],
    rooms: [
      { name: "Larch Room", size: 38, bed: "1 king bed", sleeps: 2, view: "Forest view", features: [{ label: "Balcony", color: "green" }, { label: "Fireplace", color: "amber" }, { label: "Heated floors", color: "olive" }] },
      { name: "Glacier Suite", size: 64, bed: "1 king bed + sofa bed", sleeps: 3, view: "Peak view", features: [{ label: "Separate lounge", color: "blue" }, { label: "Soaking tub", color: "teal" }, { label: "Fireplace", color: "amber" }] },
      { name: "Summit Residence", size: 128, bed: "2 king beds + 2 twins", sleeps: 6, view: "Panoramic valley", features: [{ label: "Private sauna", color: "teal" }, { label: "Full kitchen", color: "olive" }, { label: "Wraparound terrace", color: "green" }, { label: "Butler", color: "dim" }] },
    ],
    reviews: [
      { name: "Mara Lindqvist", from: "Stockholm, Sweden", date: "Feb 2026", score: 5, title: "Silence, snow and a very good fire", text: "We came for the skiing and stayed in most afternoons because the great room was too good to leave. The chef's raclette night was the highlight of the trip.", stay: "5 nights · Glacier Suite" },
      { name: "Tom Ashcroft", from: "Manchester, UK", date: "Jan 2026", score: 5, title: "Ski-in really means ski-in", text: "Boots warm every morning, lifts a two-minute glide away. The hot tub after a long day with the peaks going pink is something I'll be thinking about for a while.", stay: "7 nights · Summit Residence" },
      { name: "Aiko Tanaka", from: "Osaka, Japan", date: "Dec 2025", score: 4, title: "Beautiful, if a little far from town", text: "Everything inside the lodge is impeccable. You'll want the transfer service for dinners in the village, but the quiet up here is exactly the point.", stay: "4 nights · Larch Room" },
    ],
    checkIn: "From 15:00",
    checkOut: "Until 11:00",
    policies: [
      { title: "Cancellation", text: "Free cancellation up to 14 days before arrival. Later cancellations are charged at 50% of the stay; no-shows at 100%." },
      { title: "Children", text: "Children of all ages are welcome. Cots and high chairs are provided free of charge; the spa is for guests 16 and over." },
      { title: "Pets", text: "Well-behaved dogs are welcome in the Larch and Glacier rooms for a cleaning fee. Please let us know in advance." },
    ],
  },
  beach: {
    label: "Beachfront villa",
    highlights: [
      { icon: "waves", title: "Private beach", text: "A protected stretch of white sand reserved exclusively for guests." },
      { icon: "pool", title: "Infinity pool", text: "A 22-metre pool that seems to pour straight into the lagoon." },
      { icon: "sun", title: "Sunset deck", text: "Over-water lounging with a champagne cart that arrives at golden hour." },
      { icon: "chef", title: "Chef & butler", text: "Barefoot dining anywhere on the property, any time of day." },
    ],
    amenities: [
      { title: "Wellness", items: [{ icon: "spa", label: "Over-water spa" }, { icon: "pool", label: "Infinity pool" }, { icon: "gym", label: "Open-air gym" }, { icon: "leaf", label: "Sunrise yoga" }] },
      { title: "Dining", items: [{ icon: "chef", label: "Private chef" }, { icon: "restaurant", label: "Beachside grill" }, { icon: "wine", label: "Champagne bar" }, { icon: "coffee", label: "Floating breakfast" }] },
      { title: "Outdoors", items: [{ icon: "waves", label: "Snorkelling reef" }, { icon: "boat", label: "Kayaks & paddleboards" }, { icon: "sun", label: "Daybeds & cabanas" }, { icon: "boat", label: "Sunset dhoni cruise" }] },
      { title: "Services", items: shared.services },
      { title: "In-room", items: shared.inRoom },
    ],
    gallery: ["1520250497591-112f2f40a3f4", "1540541338287-41700207dee6", "1573843981267-be1999ff37cd", "1582719508461-905c673771fd", "1615874959474-d609969a20ed", "1596394516093-501ba68a0ba6"],
    roomImages: ["1578683010236-d716f9a3f461", "1551882547-ff40c63fe5fa", "1616594039964-ae9021a400a0"],
    rooms: [
      { name: "Lagoon Villa", size: 92, bed: "1 king bed", sleeps: 2, view: "Lagoon view", features: [{ label: "Plunge pool", color: "teal" }, { label: "Outdoor shower", color: "blue" }, { label: "Daybed", color: "amber" }] },
      { name: "Over-water Suite", size: 140, bed: "1 king bed", sleeps: 3, view: "Ocean, over-water", features: [{ label: "Glass floor", color: "blue" }, { label: "Private deck", color: "teal" }, { label: "Sunset facing", color: "amber" }, { label: "Butler", color: "dim" }] },
      { name: "Beach Residence", size: 260, bed: "2 king beds + 1 twin", sleeps: 6, view: "Beachfront", features: [{ label: "20m pool", color: "teal" }, { label: "Private beach", color: "green" }, { label: "Chef's kitchen", color: "olive" }, { label: "Butler", color: "dim" }] },
    ],
    reviews: [
      { name: "Priya Raman", from: "Singapore", date: "Mar 2026", score: 5, title: "Genuinely private", text: "We never saw another guest on the beach. The floating breakfast is a gimmick until you have it, and then it isn't. Staff anticipated things we hadn't thought to ask for.", stay: "6 nights · Over-water Suite" },
      { name: "Daniel & Sofia Reyes", from: "Mexico City, Mexico", date: "Feb 2026", score: 5, title: "Honeymoon done right", text: "The over-water suite is the best room we've stayed in anywhere. Reef right under the deck, sunset straight ahead. Worth every cent.", stay: "8 nights · Over-water Suite" },
      { name: "Hannah Wills", from: "Sydney, Australia", date: "Nov 2025", score: 4, title: "Perfect beach, long transfer", text: "Plan for the seaplane leg — it's part of the adventure but it's a full afternoon. Once you arrive, nothing to fault. The snorkelling is superb.", stay: "5 nights · Lagoon Villa" },
    ],
    checkIn: "From 14:00",
    checkOut: "Until 12:00",
    policies: [
      { title: "Cancellation", text: "Free cancellation up to 30 days before arrival. Later cancellations are charged at 50% of the stay; no-shows at 100%." },
      { title: "Children", text: "Children are welcome in the Lagoon Villa and Beach Residence. Over-water suites are reserved for guests aged 12 and over for safety." },
      { title: "Pets", text: "Pets are not permitted on the island." },
    ],
  },
  city: {
    label: "City penthouse",
    highlights: [
      { icon: "city", title: "Skyline views", text: "Floor-to-ceiling glass on three sides, with the city lit up below every night." },
      { icon: "key", title: "Private elevator", text: "Keyed access straight from the lobby into your own foyer." },
      { icon: "restaurant", title: "Rooftop dining", text: "A chef's counter and terrace grill on the top floor, guests only." },
      { icon: "concierge", title: "Concierge that delivers", text: "Restaurant tables, gallery access and late-night reservations, handled." },
    ],
    amenities: [
      { title: "Wellness", items: [{ icon: "pool", label: "Rooftop pool" }, { icon: "gym", label: "24-hour gym" }, { icon: "spa", label: "Spa treatment room" }, { icon: "hottub", label: "Steam room" }] },
      { title: "Dining", items: [{ icon: "restaurant", label: "Rooftop restaurant" }, { icon: "wine", label: "Cocktail bar" }, { icon: "coffee", label: "Espresso bar" }, { icon: "chef", label: "In-residence dining" }] },
      { title: "Building", items: [{ icon: "key", label: "Private elevator" }, { icon: "car", label: "Valet parking" }, { icon: "shield", label: "24-hour security" }, { icon: "briefcase", label: "Meeting suite" }] },
      { title: "Services", items: shared.services },
      { title: "In-room", items: shared.inRoom },
    ],
    gallery: ["1540959733332-eab4deabeeaf", "1512453979798-5ea266f8880c", "1600210492486-724fe5c67fb0", "1502672260266-1c1ef2d93688", "1598928506311-c55ded91a20c", "1512918728675-ed5a9ecdebfd"],
    roomImages: ["1590490360182-c33d57733427", "1493809842364-78817add7ffc", "1522771739844-6a9f6d5f14af"],
    rooms: [
      { name: "Skyline Studio", size: 54, bed: "1 king bed", sleeps: 2, view: "City view", features: [{ label: "Corner glass", color: "blue" }, { label: "Kitchenette", color: "olive" }, { label: "Work desk", color: "dim" }] },
      { name: "Terrace Suite", size: 96, bed: "1 king bed", sleeps: 2, view: "Skyline & terrace", features: [{ label: "Private terrace", color: "green" }, { label: "Soaking tub", color: "teal" }, { label: "Dining for 6", color: "amber" }] },
      { name: "Penthouse Residence", size: 210, bed: "2 king beds", sleeps: 4, view: "360° panorama", features: [{ label: "Private elevator", color: "blue" }, { label: "Chef's kitchen", color: "olive" }, { label: "Rooftop terrace", color: "green" }, { label: "Butler", color: "dim" }] },
    ],
    reviews: [
      { name: "Jonas Weber", from: "Berlin, Germany", date: "Apr 2026", score: 5, title: "The view does the talking", text: "Woke up above the clouds on the first morning. The elevator straight into the foyer makes it feel like your own apartment rather than a hotel. Concierge found us a table we'd been refused twice.", stay: "3 nights · Terrace Suite" },
      { name: "Léa Fontaine", from: "Lyon, France", date: "Mar 2026", score: 4, title: "Polished, central, slightly corporate", text: "Immaculate rooms and the rooftop pool at night is a proper moment. It can feel a little business-hotel on weekdays, but the location is unbeatable.", stay: "2 nights · Skyline Studio" },
      { name: "Marcus Oyelaran", from: "Lagos, Nigeria", date: "Jan 2026", score: 5, title: "Best rooftop in the city", text: "We hosted dinner for eight on the terrace with the in-residence chef and it was flawless. Service was quiet, quick and never in the way.", stay: "4 nights · Penthouse Residence" },
    ],
    checkIn: "From 15:00",
    checkOut: "Until 12:00",
    policies: [
      { title: "Cancellation", text: "Free cancellation up to 72 hours before arrival. Later cancellations are charged the first night; no-shows at 100%." },
      { title: "Children", text: "Children are welcome. One child under 12 stays free using existing bedding; cots available on request." },
      { title: "Pets", text: "Dogs under 15 kg are welcome in the Terrace Suite and Penthouse for a nightly fee." },
    ],
  },
  jungle: {
    label: "Jungle retreat",
    highlights: [
      { icon: "leaf", title: "Canopy setting", text: "Pavilions sit among mature teak and palms, with the river audible from every bed." },
      { icon: "pool", title: "Infinity pool over the valley", text: "A cantilevered pool that hangs above the rice terraces." },
      { icon: "spa", title: "Riverside spa", text: "Open-air treatment bales and a sound-bath pavilion by the water." },
      { icon: "leaf", title: "Farm-to-table", text: "Most of what you eat is grown on the property's own terraces." },
    ],
    amenities: [
      { title: "Wellness", items: [{ icon: "spa", label: "Riverside spa" }, { icon: "leaf", label: "Yoga shala" }, { icon: "pool", label: "Infinity pool" }, { icon: "spa", label: "Balinese massage" }] },
      { title: "Dining", items: [{ icon: "restaurant", label: "Open-air restaurant" }, { icon: "leaf", label: "Organic garden" }, { icon: "coffee", label: "Breakfast in the pool" }, { icon: "chef", label: "Cooking classes" }] },
      { title: "Outdoors", items: [{ icon: "tree", label: "Rice terrace walks" }, { icon: "waves", label: "River tubing" }, { icon: "bike", label: "E-bikes" }, { icon: "sun", label: "Sunrise volcano trek" }] },
      { title: "Services", items: shared.services },
      { title: "In-room", items: shared.inRoom },
    ],
    gallery: ["1537953773345-d172ccf13cf1", "1518509562904-e7ef99cdcc86", "1595576508898-0ad5c879a061", "1571896349842-33c89424de2d", "1560185893-a55cbc8c57e8", "1602343168117-bb8ffe3e2e9f"],
    roomImages: ["1505693416388-ac5ce068fe85", "1631049307264-da0ec4d70f1f", "1618773928121-c32242e63f39"],
    rooms: [
      { name: "Garden Pavilion", size: 58, bed: "1 king bed", sleeps: 2, view: "Garden view", features: [{ label: "Outdoor bath", color: "teal" }, { label: "Daybed", color: "amber" }, { label: "Netted canopy bed", color: "olive" }] },
      { name: "River Pool Villa", size: 110, bed: "1 king bed", sleeps: 2, view: "River view", features: [{ label: "Private pool", color: "teal" }, { label: "River deck", color: "blue" }, { label: "Outdoor shower", color: "green" }] },
      { name: "Canopy Residence", size: 240, bed: "2 king beds + 1 queen", sleeps: 6, view: "Valley panorama", features: [{ label: "20m pool", color: "teal" }, { label: "Private chef", color: "amber" }, { label: "Media room", color: "dim" }, { label: "Spa bale", color: "olive" }] },
    ],
    reviews: [
      { name: "Chloe Bennett", from: "London, UK", date: "Mar 2026", score: 5, title: "Fell asleep to the river every night", text: "The pavilions are open to the jungle in a way that feels brave until you're in it. Nothing polished-over; just very good hospitality and food that tasted like it was picked that morning, because it was.", stay: "5 nights · River Pool Villa" },
      { name: "Ravi Menon", from: "Bangalore, India", date: "Feb 2026", score: 5, title: "Best pool I have ever swum in", text: "The infinity edge over the terraces is absurd. Breakfast floated out to us on the second morning without asking. Staff remembered how we took our coffee after one day.", stay: "4 nights · Canopy Residence" },
      { name: "Emma Sørensen", from: "Copenhagen, Denmark", date: "Jan 2026", score: 4, title: "Bring insect repellent, leave everything else", text: "It's the jungle and it behaves like one, so pack accordingly. The spa is extraordinary and the sunrise trek is worth the 3am start.", stay: "3 nights · Garden Pavilion" },
    ],
    checkIn: "From 14:00",
    checkOut: "Until 12:00",
    policies: [
      { title: "Cancellation", text: "Free cancellation up to 21 days before arrival. Later cancellations are charged at 50% of the stay; no-shows at 100%." },
      { title: "Children", text: "Families are welcome in the Canopy Residence. Pavilions and pool villas are best suited to guests aged 12 and over." },
      { title: "Pets", text: "Pets are not permitted due to local wildlife." },
    ],
  },
  coastal: {
    label: "Clifftop villa",
    highlights: [
      { icon: "waves", title: "Sea from every room", text: "Built into the cliff so each terrace looks straight out over the water." },
      { icon: "boat", title: "Private mooring", text: "A stone jetty below the villa with a tender on call for coves and lunch spots." },
      { icon: "pool", title: "Cliff-edge pool", text: "A saltwater pool cut into the rock, warmed from late spring." },
      { icon: "wine", title: "Cellar & sommelier", text: "Regional wines chosen for the house, poured on the terrace at dusk." },
    ],
    amenities: [
      { title: "Wellness", items: [{ icon: "pool", label: "Saltwater pool" }, { icon: "spa", label: "Massage terrace" }, { icon: "gym", label: "Fitness room" }, { icon: "hottub", label: "Cliff hot tub" }] },
      { title: "Dining", items: [{ icon: "chef", label: "Private chef" }, { icon: "wine", label: "Wine cellar" }, { icon: "restaurant", label: "Terrace dining" }, { icon: "coffee", label: "Breakfast on the terrace" }] },
      { title: "Outdoors", items: [{ icon: "boat", label: "Private jetty & tender" }, { icon: "waves", label: "Sea access" }, { icon: "sun", label: "Sun terraces" }, { icon: "car", label: "Driver on request" }] },
      { title: "Services", items: shared.services },
      { title: "In-room", items: shared.inRoom },
    ],
    gallery: ["1570077188670-e3a8d69ac5ff", "1516483638261-f4dbaf036963", "1499793983690-e29da59ef1c2", "1566073771259-6a8506099945", "1582719508461-905c673771fd", "1600585154340-be6161a56a0c"],
    roomImages: ["1616594039964-ae9021a400a0", "1578683010236-d716f9a3f461", "1582719508461-905c673771fd"],
    rooms: [
      { name: "Terrace Room", size: 42, bed: "1 queen bed", sleeps: 2, view: "Sea view", features: [{ label: "Sea terrace", color: "blue" }, { label: "Rain shower", color: "teal" }, { label: "Linen bedding", color: "dim" }] },
      { name: "Cliff Suite", size: 78, bed: "1 king bed", sleeps: 2, view: "Caldera & sea", features: [{ label: "Private hot tub", color: "teal" }, { label: "Indoor–outdoor lounge", color: "green" }, { label: "Sunset facing", color: "amber" }] },
      { name: "Villa Entire", size: 320, bed: "3 king beds + 2 queens", sleeps: 10, view: "Whole villa", features: [{ label: "Cliff pool", color: "teal" }, { label: "Chef & sommelier", color: "amber" }, { label: "Private jetty", color: "blue" }, { label: "Staff of 4", color: "dim" }] },
    ],
    reviews: [
      { name: "Isabella Conti", from: "Milan, Italy", date: "Jun 2026", score: 5, title: "Every meal on that terrace", text: "The tender took us to a cove for lunch each day and the sommelier had something new waiting when we got back. We didn't leave the villa for four days and regretted nothing.", stay: "7 nights · Villa Entire" },
      { name: "George Papadakis", from: "Athens, Greece", date: "May 2026", score: 5, title: "The pool in the rock", text: "Warm saltwater, a cliff drop and the sea below. The Cliff Suite hot tub at sunset is the shot everyone tries to get, and it's better in person.", stay: "4 nights · Cliff Suite" },
      { name: "Natalie Brooks", from: "Toronto, Canada", date: "Sep 2025", score: 4, title: "Steep, stunning, not for bad knees", text: "It's a lot of stairs — that's the cliff — so pack light. The rooms and views are extraordinary and the staff carried more than they should have.", stay: "3 nights · Terrace Room" },
    ],
    checkIn: "From 15:00",
    checkOut: "Until 11:00",
    policies: [
      { title: "Cancellation", text: "Free cancellation up to 30 days before arrival. Later cancellations are charged at 50% of the stay; no-shows at 100%." },
      { title: "Children", text: "Children are welcome across the villa. The cliff pool is unfenced, so young children must be supervised at all times." },
      { title: "Pets", text: "Small dogs are welcome for a cleaning fee. Please advise us at the time of booking." },
    ],
  },
  safari: {
    label: "Safari lodge",
    highlights: [
      { icon: "binoculars", title: "Twice-daily game drives", text: "Private vehicle and guide, with dawn and dusk drives into the reserve." },
      { icon: "sun", title: "Bush dinners", text: "Lantern-lit tables set out on the plains, with the sky doing the rest." },
      { icon: "leaf", title: "All-inclusive", text: "Drives, meals, drinks and conservation levies, all included in the rate." },
      { icon: "tent", title: "Tented suites", text: "Canvas and timber suites on raised decks above a well-trodden waterhole." },
    ],
    amenities: [
      { title: "Wellness", items: [{ icon: "spa", label: "Bush spa" }, { icon: "pool", label: "Plains-view pool" }, { icon: "gym", label: "Open-air gym" }, { icon: "leaf", label: "Sunrise yoga deck" }] },
      { title: "Dining", items: [{ icon: "restaurant", label: "All meals included" }, { icon: "wine", label: "Sundowner bar" }, { icon: "sun", label: "Bush dinners" }, { icon: "coffee", label: "Pre-drive coffee at 5:30" }] },
      { title: "Safari", items: [{ icon: "binoculars", label: "Private 4×4 & guide" }, { icon: "tree", label: "Guided bush walks" }, { icon: "sun", label: "Hot-air balloon (extra)" }, { icon: "shield", label: "Conservation levy included" }] },
      { title: "Services", items: shared.services },
      { title: "In-room", items: shared.inRoom },
    ],
    gallery: ["1547970810-dc1eac37d174", "1516426122078-c23e76319801", "1523805009345-7448845a9e53", "1571896349842-33c89424de2d", "1584132967334-10e028bd69f7", "1560448204-e02f11c3d0e2"],
    roomImages: ["1505693416388-ac5ce068fe85", "1631049307264-da0ec4d70f1f", "1611892440504-42a792e24d32"],
    rooms: [
      { name: "Tented Suite", size: 70, bed: "1 king bed", sleeps: 2, view: "Waterhole view", features: [{ label: "Private deck", color: "green" }, { label: "Outdoor shower", color: "teal" }, { label: "All-inclusive", color: "amber" }] },
      { name: "Family Tent", size: 120, bed: "1 king bed + 2 twins", sleeps: 4, view: "Plains view", features: [{ label: "Two bedrooms", color: "blue" }, { label: "Plunge pool", color: "teal" }, { label: "All-inclusive", color: "amber" }] },
      { name: "Private Villa", size: 200, bed: "2 king beds", sleeps: 4, view: "Riverbank", features: [{ label: "Private vehicle", color: "olive" }, { label: "Own chef", color: "amber" }, { label: "Heated pool", color: "teal" }, { label: "Butler", color: "dim" }] },
    ],
    reviews: [
      { name: "William Hartley", from: "Cape Town, South Africa", date: "Aug 2026", score: 5, title: "Leopard on the first drive", text: "Our guide knew the reserve like a back garden. Elephants at the waterhole from the bath. The bush dinner under the Milky Way was the kind of thing you don't forget.", stay: "4 nights · Tented Suite" },
      { name: "Sarah & Ben Cole", from: "Melbourne, Australia", date: "Jul 2026", score: 5, title: "Effortless with kids", text: "The family tent gave us space and the kids' bush tracking walk kept them buzzing for days. All-inclusive means nobody's counting anything, which is the point of a holiday.", stay: "5 nights · Family Tent" },
      { name: "Yuki Hashimoto", from: "Tokyo, Japan", date: "Feb 2026", score: 4, title: "Early mornings, worth it", text: "Coffee at 5:30 and out by six. It's tiring in the best way. The camp itself is beautiful and very quiet between drives.", stay: "3 nights · Tented Suite" },
    ],
    checkIn: "From 13:00",
    checkOut: "Until 10:30",
    policies: [
      { title: "Cancellation", text: "Free cancellation up to 45 days before arrival. Later cancellations are charged at 75% of the stay; no-shows at 100%." },
      { title: "Children", text: "Children aged 6 and over are welcome. Game drives for children under 12 are private-vehicle only." },
      { title: "Pets", text: "Pets are not permitted in the reserve." },
    ],
  },
  heritage: {
    label: "Heritage house",
    highlights: [
      { icon: "home", title: "Restored original", text: "A century-old house restored by hand, with its bones and craft intact." },
      { icon: "leaf", title: "Courtyard garden", text: "A walled inner garden with a fountain, planted for shade and scent." },
      { icon: "restaurant", title: "Rooftop terrace", text: "Breakfast and evening drinks above the old town's rooftops." },
      { icon: "concierge", title: "Local host", text: "A resident host who books tables, arranges guides and knows the shortcuts." },
    ],
    amenities: [
      { title: "Wellness", items: [{ icon: "spa", label: "Hammam" }, { icon: "pool", label: "Courtyard plunge pool" }, { icon: "spa", label: "In-house massage" }, { icon: "leaf", label: "Garden terrace" }] },
      { title: "Dining", items: [{ icon: "restaurant", label: "Rooftop restaurant" }, { icon: "coffee", label: "Breakfast in the courtyard" }, { icon: "chef", label: "Cooking classes" }, { icon: "wine", label: "Evening aperitif" }] },
      { title: "Experiences", items: [{ icon: "map", label: "Private old-town guide" }, { icon: "bike", label: "Bicycles" }, { icon: "car", label: "Driver on request" }, { icon: "key", label: "Late check-out" }] },
      { title: "Services", items: shared.services },
      { title: "In-room", items: shared.inRoom },
    ],
    gallery: ["1539020140153-e479b8c22e70", "1493976040374-85c8e12f0c0e", "1583531352515-8884af319dc1", "1522771739844-6a9f6d5f14af", "1560185893-a55cbc8c57e8", "1505693416388-ac5ce068fe85"],
    roomImages: ["1505693416388-ac5ce068fe85", "1616594039964-ae9021a400a0", "1590490360182-c33d57733427"],
    rooms: [
      { name: "Courtyard Room", size: 30, bed: "1 queen bed", sleeps: 2, view: "Courtyard view", features: [{ label: "Original tilework", color: "amber" }, { label: "Garden access", color: "green" }, { label: "Rain shower", color: "teal" }] },
      { name: "Garden Suite", size: 55, bed: "1 king bed", sleeps: 2, view: "Garden & fountain", features: [{ label: "Private terrace", color: "green" }, { label: "Soaking tub", color: "teal" }, { label: "Sitting room", color: "blue" }] },
      { name: "Rooftop Suite", size: 85, bed: "1 king bed + sofa bed", sleeps: 3, view: "Old-town rooftops", features: [{ label: "Private roof terrace", color: "green" }, { label: "Outdoor bath", color: "teal" }, { label: "Sunset facing", color: "amber" }, { label: "Butler", color: "dim" }] },
    ],
    reviews: [
      { name: "Olivia Marsh", from: "Bristol, UK", date: "Apr 2026", score: 5, title: "Like staying with a well-connected friend", text: "The host booked us into three places we'd never have found and walked us there the first night. Breakfast in the courtyard with the fountain going is the calmest start to a day I've had in years.", stay: "4 nights · Garden Suite" },
      { name: "Mateo Álvarez", from: "Buenos Aires, Argentina", date: "Mar 2026", score: 5, title: "Craft everywhere you look", text: "Nothing here is off a shelf. The tilework, the carved doors, the linen — it's all been chosen by someone who cares. The rooftop at dusk is the reason to book.", stay: "3 nights · Rooftop Suite" },
      { name: "Grace Kim", from: "Seoul, South Korea", date: "Dec 2025", score: 4, title: "Charming, and charmingly old", text: "Thick walls and small doorways come with the territory. The Courtyard Room is cosy rather than large, but the house as a whole is a joy to wander.", stay: "2 nights · Courtyard Room" },
    ],
    checkIn: "From 14:00",
    checkOut: "Until 11:00",
    policies: [
      { title: "Cancellation", text: "Free cancellation up to 7 days before arrival. Later cancellations are charged the first night; no-shows at 100%." },
      { title: "Children", text: "Children are welcome. Please note the house has open staircases and a plunge pool, so supervision is required." },
      { title: "Pets", text: "Pets are not permitted." },
    ],
  },
  countryside: {
    label: "Country estate",
    highlights: [
      { icon: "tree", title: "Private grounds", text: "Hectares of vineyard, meadow or shoreline, and nobody else on them." },
      { icon: "wine", title: "Estate table", text: "Long lunches built from what the land produces, poured with the estate's own bottles." },
      { icon: "flame", title: "Fire pit evenings", text: "Blankets, whisky and a very dark sky, most nights of the year." },
      { icon: "home", title: "Whole-house privacy", text: "The entire estate is yours; staff live off-site and appear when asked." },
    ],
    amenities: [
      { title: "Wellness", items: [{ icon: "pool", label: "Heated outdoor pool" }, { icon: "hottub", label: "Wood-fired hot tub" }, { icon: "spa", label: "Sauna" }, { icon: "gym", label: "Barn gym" }] },
      { title: "Dining", items: [{ icon: "wine", label: "Estate wine tasting" }, { icon: "chef", label: "Private chef" }, { icon: "restaurant", label: "Farm-to-table lunches" }, { icon: "coffee", label: "Breakfast hamper" }] },
      { title: "Outdoors", items: [{ icon: "tree", label: "Walking trails" }, { icon: "bike", label: "Mountain bikes" }, { icon: "boat", label: "Boat & kayaks" }, { icon: "flame", label: "Fire pit & pizza oven" }] },
      { title: "Services", items: shared.services },
      { title: "In-room", items: shared.inRoom },
    ],
    gallery: ["1469521669194-babb45599def", "1568605114967-8130f3a36994", "1504829857797-ddff29c27927", "1449158743715-0a90ebb6d2d8", "1600585154340-be6161a56a0c", "1512918728675-ed5a9ecdebfd"],
    roomImages: ["1618773928121-c32242e63f39", "1611892440504-42a792e24d32", "1560448204-e02f11c3d0e2"],
    rooms: [
      { name: "Meadow Room", size: 36, bed: "1 king bed", sleeps: 2, view: "Meadow view", features: [{ label: "Wood stove", color: "amber" }, { label: "Freestanding tub", color: "teal" }, { label: "Garden door", color: "green" }] },
      { name: "Lake Suite", size: 70, bed: "1 king bed", sleeps: 2, view: "Lake & mountains", features: [{ label: "Private deck", color: "green" }, { label: "Outdoor bath", color: "teal" }, { label: "Fireplace", color: "amber" }] },
      { name: "The Whole Estate", size: 480, bed: "4 king beds + 2 twins", sleeps: 10, view: "Entire property", features: [{ label: "Exclusive use", color: "blue" }, { label: "Chef & host", color: "amber" }, { label: "Heated pool", color: "teal" }, { label: "Vineyard tours", color: "olive" }] },
    ],
    reviews: [
      { name: "Fiona Douglas", from: "Edinburgh, UK", date: "May 2026", score: 5, title: "Ten of us, one long weekend", text: "We took the whole estate for a birthday and it was the easiest large-group trip we've done. The chef handled everything; the fire pit handled the rest.", stay: "3 nights · The Whole Estate" },
      { name: "Lucas Ferreira", from: "São Paulo, Brazil", date: "Apr 2026", score: 5, title: "Wine, silence, repeat", text: "The tasting with the winemaker was generous and unhurried. Waking up to the lake from the outdoor bath is something I'll be chasing on every trip from now on.", stay: "4 nights · Lake Suite" },
      { name: "Anna Petrova", from: "Prague, Czechia", date: "Oct 2025", score: 4, title: "Rural means rural", text: "You'll want a car and a plan for evenings — this is about the estate, not the area. Rooms are warm and beautifully done; the breakfast hamper is enormous.", stay: "2 nights · Meadow Room" },
    ],
    checkIn: "From 16:00",
    checkOut: "Until 11:00",
    policies: [
      { title: "Cancellation", text: "Free cancellation up to 21 days before arrival. Later cancellations are charged at 50% of the stay; no-shows at 100%." },
      { title: "Children", text: "Children of all ages are welcome. Cots, high chairs and a stocked games room are available." },
      { title: "Pets", text: "Dogs are very welcome across the estate; please let us know how many are coming." },
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Per-property bespoke content                                       */
/* ------------------------------------------------------------------ */

interface Bespoke {
  kind: PropertyKind;
  tagline: string;
  description: string[];
  address: string;
  nearby: NearbyPlace[];
  locationBlurb: string;
  bathrooms: number;
  sizeSqm: number;
}

const bespoke: Record<string, Bespoke> = {
  "frosted-valley": {
    kind: "alpine",
    tagline: "A timber estate above the fjord, built for long winters and longer dinners.",
    description: [
      "Frosted Valley Estate sits on a shelf of granite above the Hardangerfjord, with pine forest behind and nothing but water in front. The house is Norwegian in the plainest sense: heavy timber, a slate roof, and glass wherever the view demanded it.",
      "Days revolve around the fire in the great room and the sauna by the shore. In winter the northern lights are a regular guest; in summer the light barely leaves. A chef and housekeeper come daily, and the boathouse holds kayaks for calm mornings.",
    ],
    address: "Fjordvegen 118, 5781 Lofthus, Norway",
    nearby: [
      { icon: "plane", name: "Bergen Airport (BGO)", distance: "2 h 10 min drive" },
      { icon: "mountain", name: "Trolltunga trailhead", distance: "35 min drive" },
      { icon: "restaurant", name: "Lofthus village", distance: "8 min walk" },
    ],
    locationBlurb: "Perched above the eastern shore of the Hardangerfjord, the estate is a scenic two-hour drive from Bergen through orchards and tunnels. Lofthus village, with its bakery and boat hire, is a short walk downhill.",
    bathrooms: 3,
    sizeSqm: 310,
  },
  "coral-horizon": {
    kind: "beach",
    tagline: "Over-water living on a private reef in the Baa Atoll.",
    description: [
      "Coral Horizon Villa occupies its own crescent of reef in the UNESCO-listed Baa Atoll. A boardwalk links the beach house to a string of over-water suites, each with a glass floor panel and a deck that faces the sunset.",
      "The house comes fully staffed with a butler, a chef and a marine guide who knows where the mantas gather. Meals happen wherever you want them: on the sandbank, in the pool, or on a floating tray at breakfast.",
    ],
    address: "Coral Horizon Island, Baa Atoll, Maldives",
    nearby: [
      { icon: "plane", name: "Velana International (MLE)", distance: "35 min seaplane" },
      { icon: "waves", name: "Hanifaru Bay manta site", distance: "20 min boat" },
      { icon: "boat", name: "Dharavandhoo island", distance: "15 min boat" },
    ],
    locationBlurb: "The island is reached by a scheduled seaplane from Malé, timed to daylight arrivals. Hanifaru Bay, the atoll's celebrated manta ray feeding ground, is a short boat ride away between May and November.",
    bathrooms: 5,
    sizeSqm: 620,
  },
  "alpine-noir": {
    kind: "alpine",
    tagline: "A blackened-timber chalet at the top of the Verbier lifts.",
    description: [
      "Alpine Noir Chalet is a study in dark larch and pale stone, set at 1,900 metres where the Verbier pistes end and the quiet begins. Six bedrooms are spread over four floors, joined by a glass lift and a staircase you'll want to photograph.",
      "The lower level holds a spa with a 12-metre pool, a hammam and a treatment room; the top floor is one long room of fire, sofas and mountain. A full team of chef, host and driver stays on hand throughout your stay.",
    ],
    address: "Chemin des Esserts 42, 1936 Verbier, Switzerland",
    nearby: [
      { icon: "plane", name: "Geneva Airport (GVA)", distance: "1 h 50 min drive" },
      { icon: "mountain", name: "Médran lift station", distance: "Ski-in / ski-out" },
      { icon: "restaurant", name: "Verbier village centre", distance: "6 min drive" },
    ],
    locationBlurb: "Set above Verbier on the Esserts plateau, the chalet has direct access to the Médran slopes and the 4 Vallées ski area. The village, with its restaurants and après-ski, is a few minutes down the hill by the chalet's own car.",
    bathrooms: 6,
    sizeSqm: 740,
  },
  "shinjuku-sky": {
    kind: "city",
    tagline: "Two floors of glass above the busiest station on earth.",
    description: [
      "Shinjuku Sky Penthouse takes the top two floors of a slender tower on the west side of Shinjuku, with Mount Fuji visible on clear winter mornings and the neon of Kabukichō spread out after dark.",
      "The interiors are quiet and precise: pale oak, washi-screened windows and a kitchen equipped for a serious cook. A private onsen bath on the roof terrace, and a concierge team downstairs who can secure the city's hardest reservations.",
    ],
    address: "3-7-1 Nishi-Shinjuku, Shinjuku City, Tokyo 160-0023, Japan",
    nearby: [
      { icon: "train", name: "Shinjuku Station", distance: "7 min walk" },
      { icon: "tree", name: "Shinjuku Gyoen garden", distance: "15 min walk" },
      { icon: "plane", name: "Haneda Airport (HND)", distance: "45 min by car" },
    ],
    locationBlurb: "The penthouse is in the skyscraper district of West Shinjuku, a short walk from the world's busiest rail station and Tokyo's best department-store food halls. Shinjuku Gyoen's cherry trees are fifteen minutes on foot.",
    bathrooms: 2,
    sizeSqm: 210,
  },
  "ubud-jungle": {
    kind: "jungle",
    tagline: "Open pavilions over the Ayung River gorge.",
    description: [
      "Ubud Jungle Retreat is three open-sided pavilions set on a wooded ledge above the Ayung River, ten minutes north of Ubud. Each pavilion is built from reclaimed teak with a thatched alang-alang roof and a bed you can hear the river from.",
      "An infinity pool cantilevers over the rice terraces, and the spa bale sits by the water. The retreat's kitchen is fed by its own garden, and the staff are the kind that remember how you take your coffee on day one.",
    ],
    address: "Jl. Raya Sayan, Sayan, Ubud, Gianyar, Bali 80571, Indonesia",
    nearby: [
      { icon: "plane", name: "Ngurah Rai Airport (DPS)", distance: "1 h 25 min drive" },
      { icon: "map", name: "Ubud Palace & market", distance: "12 min drive" },
      { icon: "tree", name: "Tegallalang rice terraces", distance: "25 min drive" },
    ],
    locationBlurb: "The retreat lies in Sayan, the quiet ridge on the west edge of Ubud that overlooks the Ayung River valley. Ubud's temples, cafés and galleries are a short drive away; the retreat's driver runs a scheduled shuttle.",
    bathrooms: 3,
    sizeSqm: 380,
  },
  "caldera-cliffside": {
    kind: "coastal",
    tagline: "A cave villa cut into the Oia caldera.",
    description: [
      "Caldera Cliffside Villa is a traditional cave house carved into the volcanic rock of Oia, whitewashed inside and out and opened up to the sea with a terrace on every level.",
      "The plunge pool hangs at the edge of the cliff, and the villa faces directly west for the sunset the island is famous for. Breakfast arrives on the terrace each morning, and a private driver is on call for the beaches on the far side of the island.",
    ],
    address: "Oia Caldera Path, Oia 847 02, Santorini, Greece",
    nearby: [
      { icon: "plane", name: "Santorini Airport (JTR)", distance: "30 min drive" },
      { icon: "map", name: "Oia castle & sunset point", distance: "6 min walk" },
      { icon: "waves", name: "Ammoudi Bay tavernas", distance: "10 min walk (down)" },
    ],
    locationBlurb: "The villa sits on the caldera path in Oia, the village at the northern tip of Santorini. Ammoudi Bay's fish tavernas are a stepped walk below; Fira and the island's black-sand beaches are a short drive with the villa's driver.",
    bathrooms: 3,
    sizeSqm: 190,
  },
  "positano-sea": {
    kind: "coastal",
    tagline: "A lemon-terraced villa with its own dock on the Amalfi Coast.",
    description: [
      "Positano Sea Estate steps down the hillside in a series of lemon groves and terraces, ending at a private stone dock with a boat and captain at your disposal.",
      "Inside, the villa keeps its 1920s bones: vaulted ceilings, hand-painted majolica floors and tall shuttered windows. A resident chef cooks from the coast's markets, and the wine cellar leans heavily toward Campania.",
    ],
    address: "Via Laurito 34, 84017 Positano SA, Italy",
    nearby: [
      { icon: "boat", name: "Positano marina", distance: "10 min by boat" },
      { icon: "map", name: "Path of the Gods trailhead", distance: "20 min drive" },
      { icon: "plane", name: "Naples Airport (NAP)", distance: "1 h 40 min drive" },
    ],
    locationBlurb: "The estate is in the Laurito district, east of Positano's centre, reachable by road or — more pleasantly — by the villa's own boat. Amalfi and Ravello are within an easy day, by sea or by the coastal road.",
    bathrooms: 4,
    sizeSqm: 420,
  },
  "palm-skyline": {
    kind: "city",
    tagline: "A full-floor penthouse on the Palm, with the Burj in the window.",
    description: [
      "Palm Skyline Penthouse occupies an entire floor of a tower on the trunk of the Palm Jumeirah. Glass on all sides frames the Gulf to the west and the Dubai skyline to the east, with the Burj Khalifa lined up in the dining-room window.",
      "A rooftop pool and cabanas are for the penthouse alone. Marble, brass and pale oak make up the interiors; a butler and a house chef handle everything from breakfast on the roof to a dinner for twenty.",
    ],
    address: "Palm Jumeirah Trunk, Dubai, United Arab Emirates",
    nearby: [
      { icon: "plane", name: "Dubai International (DXB)", distance: "30 min drive" },
      { icon: "waves", name: "West Beach & marina", distance: "5 min walk" },
      { icon: "city", name: "Dubai Marina & JBR", distance: "10 min drive" },
    ],
    locationBlurb: "The tower is on the Palm's trunk, minutes from Nakheel Mall, the monorail and the beach clubs of West Beach. Downtown and the Burj Khalifa are twenty-five minutes by car, less by the building's helipad.",
    bathrooms: 5,
    sizeSqm: 680,
  },
  "queenstown-lake": {
    kind: "countryside",
    tagline: "A lodge on the water at the foot of the Remarkables.",
    description: [
      "Queenstown Lake Lodge sits on a private cove of Lake Wakatipu with the Remarkables range rising straight out of the water opposite. Built of schist and cedar, the lodge is warm, low and entirely turned toward the view.",
      "A jetty holds a boat and kayaks; a fire pit on the lawn is lit every evening. The chef works with Central Otago produce and wine, and the lodge's helicopter pad makes glacier landings and fly-fishing trips an easy half-day.",
    ],
    address: "Peninsula Road, Kelvin Heights, Queenstown 9300, New Zealand",
    nearby: [
      { icon: "plane", name: "Queenstown Airport (ZQN)", distance: "12 min drive" },
      { icon: "map", name: "Queenstown centre", distance: "15 min drive" },
      { icon: "wine", name: "Gibbston Valley wineries", distance: "30 min drive" },
    ],
    locationBlurb: "The lodge is on the Kelvin Heights peninsula, across the lake from Queenstown's centre and ten minutes from the airport. Wineries, the Shotover, and Glenorchy's film-set scenery are all within forty minutes.",
    bathrooms: 4,
    sizeSqm: 450,
  },
  "marrakech-riad": {
    kind: "heritage",
    tagline: "A restored 18th-century riad in the heart of the medina.",
    description: [
      "Marrakech Riad Palace was built by a spice merchant in 1780 and restored over three years by local craftsmen: zellige tiles, carved cedar and tadelakt plaster, all done the slow way.",
      "Six bedrooms open onto two courtyards, one with a plunge pool under orange trees. The rooftop has a hammam, a bar and a view over the medina to the Atlas. A house manager, chef and driver come with the riad.",
    ],
    address: "Derb Sidi Bouloukat 21, Medina, Marrakech 40000, Morocco",
    nearby: [
      { icon: "map", name: "Jemaa el-Fnaa square", distance: "8 min walk" },
      { icon: "leaf", name: "Jardin Majorelle", distance: "15 min drive" },
      { icon: "plane", name: "Marrakech Menara (RAK)", distance: "20 min drive" },
    ],
    locationBlurb: "The riad is in the Mouassine quarter of the medina, close to the souks and a short walk from Jemaa el-Fnaa. The city's museums, Bahia Palace and the Majorelle gardens are all within a fifteen-minute drive.",
    bathrooms: 6,
    sizeSqm: 520,
  },
  "cap-ferrat": {
    kind: "coastal",
    tagline: "A Belle Époque estate on the tip of the Riviera's finest peninsula.",
    description: [
      "Cap Ferrat Mansion stands in three hectares of umbrella pine and lawn at the southern tip of Saint-Jean-Cap-Ferrat, with sea on two sides and a private path down to the rocks.",
      "The house was built in 1912 and keeps its terraces, its ballroom and its cypress avenue. A 25-metre pool, a clay tennis court and a staff of six — chef, sommelier, host, housekeepers and a driver — come with it.",
    ],
    address: "Avenue Claude Vignon, 06230 Saint-Jean-Cap-Ferrat, France",
    nearby: [
      { icon: "plane", name: "Nice Côte d'Azur (NCE)", distance: "35 min drive" },
      { icon: "map", name: "Villa Ephrussi de Rothschild", distance: "8 min walk" },
      { icon: "restaurant", name: "Saint-Jean harbour", distance: "12 min walk" },
    ],
    locationBlurb: "The estate is at the end of the Cap Ferrat peninsula, between Nice and Monaco. The coastal path circles the cape from the gate; Beaulieu-sur-Mer's station and the harbour village are a short walk.",
    bathrooms: 8,
    sizeSqm: 1100,
  },
  "maasai-mara": {
    kind: "safari",
    tagline: "A tented camp on a private conservancy beside the Mara River.",
    description: [
      "Maasai Mara Safari Lodge is four tented suites on a bend of the Mara River, within a private conservancy that borders the national reserve. Leopard and lion are resident; the Great Migration crosses the river below camp between July and October.",
      "The lodge is all-inclusive and guided by a team who grew up here. Days start before dawn and end with sundowners on the escarpment. The camp's footprint is small, solar-powered and shared with a working Maasai community.",
    ],
    address: "Mara North Conservancy, Narok County, Kenya",
    nearby: [
      { icon: "plane", name: "Mara North airstrip", distance: "20 min game drive" },
      { icon: "waves", name: "Mara River crossing point", distance: "On camp" },
      { icon: "plane", name: "Nairobi Wilson Airport", distance: "45 min flight" },
    ],
    locationBlurb: "The camp is on the Mara North Conservancy, a private wildlife area north of the Maasai Mara National Reserve. Guests fly in from Nairobi on a scheduled bush flight; the transfer from the airstrip is itself a game drive.",
    bathrooms: 4,
    sizeSqm: 280,
  },
  "kyoto-machiya": {
    kind: "heritage",
    tagline: "A restored merchant townhouse in the Gion lanes.",
    description: [
      "Kyoto Machiya House is a 120-year-old wooden townhouse in Higashiyama, restored with its original beams, earthen walls and inner garden. A tea room looks out on moss and a stone lantern; a cypress bath fills from a private well.",
      "The house is yours alone, with a housekeeper who brings breakfast and can arrange a tea master, a private temple visit or a kaiseki chef for the evening.",
    ],
    address: "Shimogawara-cho, Higashiyama Ward, Kyoto 605-0825, Japan",
    nearby: [
      { icon: "map", name: "Yasaka Shrine & Gion", distance: "6 min walk" },
      { icon: "tree", name: "Kiyomizu-dera temple", distance: "15 min walk" },
      { icon: "train", name: "Kyoto Station", distance: "20 min by taxi" },
    ],
    locationBlurb: "The house is in the lanes behind Yasaka Shrine, at the quiet edge of Gion. Kiyomizu-dera, the Philosopher's Path and the teahouses of Hanamikoji are all on foot; Kyoto Station is twenty minutes by taxi.",
    bathrooms: 2,
    sizeSqm: 160,
  },
  "lisbon-terrace": {
    kind: "city",
    tagline: "A river-facing loft above the rooftops of Alfama.",
    description: [
      "Lisbon Terrace Loft is the top floor of a restored 19th-century building in Alfama, with a private roof terrace that looks over the neighbourhood's rooftops to the Tagus.",
      "Inside, tall windows, original tiles and plaster ceilings sit alongside a modern kitchen and a bathroom of green marble. The building has a small pool on the roof and a concierge in the lobby who can book the city's tasca tables.",
    ],
    address: "Rua de São Miguel 46, 1100-544 Lisboa, Portugal",
    nearby: [
      { icon: "map", name: "Castelo de São Jorge", distance: "10 min walk" },
      { icon: "train", name: "Santa Apolónia station", distance: "8 min walk" },
      { icon: "plane", name: "Lisbon Airport (LIS)", distance: "25 min drive" },
    ],
    locationBlurb: "The loft is in the heart of Alfama, Lisbon's oldest district, on a lane of fado houses and tile-fronted buildings. The castle, the cathedral and the riverside are all within ten minutes on foot.",
    bathrooms: 2,
    sizeSqm: 120,
  },
  "banff-cabin": {
    kind: "alpine",
    tagline: "A log cabin under the Rockies on the Bow River.",
    description: [
      "Banff Alpine Cabin is a hand-built log house on a private bend of the Bow River, with Mount Rundle filling the windows. Four bedrooms sit under a vaulted timber ceiling; a stone fireplace runs two storeys.",
      "A cedar hot tub on the deck faces the river, and there's a boot room stocked for both the ski hills and the trails. In summer the cabin comes with canoes; in winter, with snowshoes and a fireside cook.",
    ],
    address: "Tunnel Mountain Road, Banff, AB T1L 1B5, Canada",
    nearby: [
      { icon: "mountain", name: "Sunshine Village ski area", distance: "20 min drive" },
      { icon: "map", name: "Banff townsite", distance: "5 min drive" },
      { icon: "plane", name: "Calgary International (YYC)", distance: "1 h 30 min drive" },
    ],
    locationBlurb: "The cabin is on Tunnel Mountain, above the Banff townsite and inside the national park. Sunshine Village and Lake Louise are on the doorstep; Calgary's airport is ninety minutes along the Trans-Canada.",
    bathrooms: 4,
    sizeSqm: 340,
  },
  "reykjavik-glass": {
    kind: "countryside",
    tagline: "A glass-walled lodge on a lava field, an hour from Reykjavik.",
    description: [
      "Reykjavik Glass Lodge is a low black building of steel and glass set on a moss-covered lava field, with a hot-spring pool fed from a borehole in the garden.",
      "The design keeps the outside in: the bedroom faces north for the aurora, the sauna looks onto the field, and there's a heated outdoor bath cut into the rock. A host brings breakfast and can arrange glacier walks and a private chef.",
    ],
    address: "Hvalfjarðarsveit, 301 Akranes, Iceland",
    nearby: [
      { icon: "plane", name: "Keflavík Airport (KEF)", distance: "1 h 20 min drive" },
      { icon: "map", name: "Reykjavik city centre", distance: "55 min drive" },
      { icon: "mountain", name: "Glymur waterfall trail", distance: "25 min drive" },
    ],
    locationBlurb: "The lodge lies on the eastern shore of Hvalfjörður, the whale fjord north of Reykjavik. Glymur, Iceland's second-highest waterfall, is a short drive; the Golden Circle and Snæfellsnes are both within a day.",
    bathrooms: 2,
    sizeSqm: 140,
  },
  "cartagena-villa": {
    kind: "heritage",
    tagline: "A colonial mansion with a courtyard pool inside the walled city.",
    description: [
      "Cartagena Colonial Villa is a 17th-century mansion on a quiet street of the walled city, restored around a central courtyard planted with palms and frangipani and cooled by a long lap pool.",
      "Five bedrooms open onto galleries with wooden balconies; the roof has a second pool, a bar and a view over the tiled roofs to the sea. A house manager, chef and driver are included.",
    ],
    address: "Calle del Curato 38-52, Centro Histórico, Cartagena, Colombia",
    nearby: [
      { icon: "map", name: "Plaza de Santo Domingo", distance: "4 min walk" },
      { icon: "waves", name: "Playa Bocagrande", distance: "10 min drive" },
      { icon: "plane", name: "Rafael Núñez Airport (CTG)", distance: "15 min drive" },
    ],
    locationBlurb: "The villa is within the walled old town, minutes on foot from the plazas, restaurants and the ramparts for sunset. The Rosario Islands are an hour by boat from the marina.",
    bathrooms: 5,
    sizeSqm: 480,
  },
  "queensland-reef": {
    kind: "beach",
    tagline: "A beachfront villa on the Great Barrier Reef coast.",
    description: [
      "Queensland Reef Villa stands on a private stretch of Four Mile Beach, just south of Port Douglas, with rainforest behind and the Coral Sea in front.",
      "Three pavilions surround a lagoon pool under a canopy of palms. The reef is a boat ride away; the Daintree, a drive. A chef cooks with reef fish and tropical fruit, and the villa's dive master runs private reef trips.",
    ],
    address: "Beachfront Mirage, Port Douglas QLD 4877, Australia",
    nearby: [
      { icon: "waves", name: "Great Barrier Reef pontoon", distance: "1 h boat" },
      { icon: "tree", name: "Daintree Rainforest", distance: "1 h drive" },
      { icon: "plane", name: "Cairns Airport (CNS)", distance: "55 min drive" },
    ],
    locationBlurb: "The villa is on Four Mile Beach, a short walk from Port Douglas's marina and restaurants. Reef charters leave from the marina each morning; the Daintree and Mossman Gorge are an hour north.",
    bathrooms: 3,
    sizeSqm: 360,
  },
  "tulum-jungle": {
    kind: "jungle",
    tagline: "A jungle villa with its own cenote, five minutes from the beach.",
    description: [
      "Tulum Jungle Villa is set in four acres of low jungle inland from Tulum's beach road, with a private cenote at the bottom of the garden that you can swim in at any hour.",
      "The villa is built of local chukum plaster and tzalam wood, with a yoga deck in the trees and an infinity pool that faces the sunset. A chef cooks Yucatecan food over fire, and a driver runs guests to the beach clubs and ruins.",
    ],
    address: "Carretera Tulum-Cobá Km 3, 77760 Tulum, Q.R., Mexico",
    nearby: [
      { icon: "waves", name: "Tulum beach", distance: "8 min drive" },
      { icon: "map", name: "Tulum archaeological site", distance: "12 min drive" },
      { icon: "plane", name: "Tulum Airport (TQO)", distance: "35 min drive" },
    ],
    locationBlurb: "The villa is on the Cobá road, in the jungle between Tulum town and the beach. The beach clubs, the Mayan ruins and the region's cenotes are all within fifteen minutes by car.",
    bathrooms: 4,
    sizeSqm: 400,
  },
  "queenstown-vineyard": {
    kind: "countryside",
    tagline: "A working wine estate in the Constantia valley.",
    description: [
      "Cape Town Vineyard Estate is a Cape Dutch manor house on a working vineyard in Constantia, with Table Mountain's back slopes rising behind the vines.",
      "The house has six bedrooms, a long veranda and a heated pool among the oaks. Tastings with the winemaker happen in the cellar, the chef works the estate's kitchen garden, and the city's beaches are twenty minutes away.",
    ],
    address: "Constantia Main Road, Constantia, Cape Town 7806, South Africa",
    nearby: [
      { icon: "wine", name: "Groot Constantia estate", distance: "5 min drive" },
      { icon: "mountain", name: "Table Mountain cableway", distance: "25 min drive" },
      { icon: "plane", name: "Cape Town International (CPT)", distance: "30 min drive" },
    ],
    locationBlurb: "The estate is in Constantia, the oldest wine valley in the southern hemisphere, on the leafy south side of Cape Town. Kirstenbosch gardens, Muizenberg's beach and the city centre are all within half an hour.",
    bathrooms: 6,
    sizeSqm: 720,
  },
};

/* ------------------------------------------------------------------ */
/*  Assembly                                                           */
/* ------------------------------------------------------------------ */

const goodToKnowCommon = [
  "Government-issued photo ID and a credit card are required at check-in for incidentals.",
  "The name on the card used at check-in must match the primary name on the reservation.",
  "Special requests are subject to availability and cannot be guaranteed.",
  "This property uses solar energy and eco-certified cleaning products.",
  "Safety features include smoke and carbon-monoxide detectors, a first-aid kit and a 24-hour on-call manager.",
  "Luggage storage is available on the day of arrival and departure.",
];

export const allProperties: Property[] = [...properties, ...popularDestinations];

export function getProperty(id: string): Property | undefined {
  return allProperties.find((p) => p.id === id);
}

export function getPropertyDetail(id: string): PropertyDetail | undefined {
  const base = getProperty(id);
  const b = bespoke[id];
  if (!base || !b) return undefined;

  const k = kinds[b.kind];
  const s = seed(id);
  const rating = 4.5 + ((s % 40) / 100); // 4.50 – 4.89
  const reviewCount = 80 + (s % 340);
  const stars = base.price >= 3000 ? 5 : base.price >= 1200 ? 5 : 4;

  const multipliers = [1, 1.45, 2.2];
  const rooms: Room[] = k.rooms.map((r, i) => {
    const nightly = round5(base.price * multipliers[i]);
    return {
      ...r,
      id: `${id}-room-${i + 1}`,
      image: img(k.roomImages[i], 800),
      left: i === 0 ? 2 + (s % 3) : i === 1 ? 1 + (s % 2) : undefined,
      rates: [
        {
          id: `${id}-r${i}-standard`,
          name: "Room only",
          price: nightly,
          perks: [
            { label: "Breakfast", included: false },
            { label: "Free cancellation", included: false },
            { label: "Pay at property", included: false },
          ],
          note: "Non-refundable · Best price",
        },
        {
          id: `${id}-r${i}-breakfast`,
          name: "Breakfast included",
          price: round5(nightly * 1.09),
          perks: [
            { label: "Breakfast", included: true },
            { label: "Free cancellation", included: false },
            { label: "Pay at property", included: false },
          ],
          note: "Non-refundable",
        },
        {
          id: `${id}-r${i}-flex`,
          name: "Flexible stay",
          price: round5(nightly * 1.16),
          perks: [
            { label: "Breakfast", included: true },
            { label: "Free cancellation", included: true },
            { label: "Pay at property", included: true },
          ],
          note: "Cancel free until 7 days before arrival",
        },
      ],
    };
  });

  const scores = [
    { label: "Cleanliness", value: Math.min(5, rating + 0.08) },
    { label: "Service", value: Math.min(5, rating + 0.05) },
    { label: "Location", value: rating - 0.12 },
    { label: "Comfort", value: rating + 0.02 },
    { label: "Value", value: rating - 0.25 },
  ].map((x) => ({ ...x, value: Math.round(x.value * 10) / 10 }));

  return {
    ...base,
    kind: b.kind,
    kindLabel: k.label,
    tagline: b.tagline,
    rating: Math.round(rating * 10) / 10,
    reviewCount,
    stars,
    bathrooms: b.bathrooms,
    sizeSqm: b.sizeSqm,
    description: b.description,
    highlights: k.highlights,
    gallery: [base.image.replace("w=600", "w=1400"), ...k.gallery.filter((g) => !base.image.includes(g)).map((g) => img(g))],
    amenities: k.amenities,
    rooms,
    reviews: k.reviews,
    scores,
    address: b.address,
    nearby: b.nearby,
    locationBlurb: b.locationBlurb,
    checkIn: k.checkIn,
    checkOut: k.checkOut,
    policies: [
      ...k.policies,
      { title: "Payment", text: "Major credit and debit cards are accepted. The property may pre-authorise your card before arrival; the hold is released at check-out." },
      { title: "Smoking", text: "This is a non-smoking property. Designated outdoor areas are available." },
    ],
    goodToKnow: goodToKnowCommon,
    fees: [
      "A city or tourism tax may apply and is collected at the property.",
      "Airport transfers are available on request and quoted at the time of booking.",
      "Private chef and spa services are charged separately unless included in your rate.",
      "The above list may not be comprehensive. Fees and deposits are subject to change.",
    ],
  };
}

export function getSimilarProperties(detail: PropertyDetail, limit = 6): Property[] {
  const sameKind = allProperties.filter((p) => p.id !== detail.id && bespoke[p.id]?.kind === detail.kind);
  const others = allProperties.filter((p) => p.id !== detail.id && bespoke[p.id]?.kind !== detail.kind);
  return [...sameKind, ...others].slice(0, limit);
}
