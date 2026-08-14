export interface Property {
  id: string;
  name: string;
  location: string;
  city: "Phuket" | "Koh Samui";
  price: number;
  beds: number;
  baths: number;
  size: number; // in sqm
  sustainabilityIndex: number; // e.g. 60, 210, 310, 510
  image: string;
  description: string;
  features: string[];
  type: "Villa" | "Estate" | "Sanctuary" | "Residence";
  coordinates: { x: number; y: number }; // percentage coords for a custom visual map
}

export const properties: Property[] = [
  {
    id: "prop-1",
    name: "The Whispering Palms Pavilion",
    location: "Bangtao Beach, Phuket",
    city: "Phuket",
    price: 1950000,
    beds: 3,
    baths: 4,
    size: 420,
    sustainabilityIndex: 60,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    description: "Intimate luxury pavilion wrapped in lush vertical gardens, featuring smart solar-glass facades and high-efficiency geothermal cooling systems.",
    features: ["Smart Grid Energy Sharing", "Rainwater Collection Cistern", "Permacultural Zen Garden", "Passive Solar Louvre Shading"],
    type: "Villa",
    coordinates: { x: 25, y: 35 }
  },
  {
    id: "prop-2",
    name: "The Canopy Villa",
    location: "Kamala Beach, Phuket",
    city: "Phuket",
    price: 2850000,
    beds: 4,
    baths: 5,
    size: 580,
    sustainabilityIndex: 210,
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
    description: "A breathtaking oceanfront villa with active passive cooling, solar shingle roofs, and organic architecture that blends seamlessly with the jungle canopy.",
    features: ["Solar Roof Microgrid", "Zero-Carbon Bamboo Concrete", "Triple-Glazed Low-E Glass", "Triple Aquifer Natural Cooling"],
    type: "Villa",
    coordinates: { x: 32, y: 48 }
  },
  {
    id: "prop-3",
    name: "Nirvana Oceanfront Estate",
    location: "Chaweng Cliffs, Koh Samui",
    city: "Koh Samui",
    price: 4200000,
    beds: 5,
    baths: 6,
    size: 720,
    sustainabilityIndex: 310,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
    description: "Suspended above crystalline waters, this rammed-earth estate features a zero-impact saltwater infinity pool, smart water reclamation, and solar power storage.",
    features: ["Rammed Earth Thermal Walls", "Saltwater Seawater Pool", "Greywater Filtration Loop", "AI Home Climate Automation"],
    type: "Estate",
    coordinates: { x: 78, y: 28 }
  },
  {
    id: "prop-4",
    name: "Vayu Sanctuary",
    location: "Bophut Hills, Koh Samui",
    city: "Koh Samui",
    price: 3600000,
    beds: 4,
    baths: 5,
    size: 610,
    sustainabilityIndex: 510,
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
    description: "100% off-grid capable sanctuary utilizing localized micro-wind turbines and solar arrays, built entirely with reclaimed antique teakwood.",
    features: ["Micro-Wind Turbines", "Reclaimed Teakwood Crafting", "Natural Wind-Tunnel Atrium", "Potable Rainwater Filtration"],
    type: "Sanctuary",
    coordinates: { x: 65, y: 40 }
  },
  {
    id: "prop-5",
    name: "The Serene Atrium Residence",
    location: "Surin Beach, Phuket",
    city: "Phuket",
    price: 2400000,
    beds: 3,
    baths: 3,
    size: 490,
    sustainabilityIndex: 180,
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
    description: "An architectural masterpiece designed around a central open-air rain garden, complete with bio-climatic air circulation and premium ecological materials.",
    features: ["Bio-Climatic Rain Garden", "Zero-VOC Natural Plaster", "Smart Low-Flow Water Recycler", "Electric Vehicle Solar Charger"],
    type: "Residence",
    coordinates: { x: 42, y: 55 }
  },
  {
    id: "prop-6",
    name: "Banyan Breeze Sanctuary",
    location: "Rawai, Phuket",
    city: "Phuket",
    price: 1650000,
    beds: 3,
    baths: 3,
    size: 390,
    sustainabilityIndex: 120,
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
    description: "Nestled beneath century-old Banyan trees, this villa implements natural soil insulation and a chemistry-free saltwater pool for highly restorative living.",
    features: ["Root System Preservation", "Soil Insulated Walls", "Saltwater Chlorine-Free Pool", "10kW Battery Storage"],
    type: "Sanctuary",
    coordinates: { x: 30, y: 72 }
  }
];

export const reviews = [
  {
    id: "rev-1",
    name: "Alastair Sterling",
    rating: 5,
    date: "June 2026",
    review: "Purchasing Nirvana Oceanfront Estate was an absolute dream. The zero-impact carbon design is unmatched, and our energy bill is literally non-existent thanks to the solar microgrid. Pigma sets a new gold standard.",
    avatar: "https://picsum.photos/seed/alastair/100/100"
  },
  {
    id: "rev-2",
    name: "Siriporn Chantra",
    rating: 5,
    date: "April 2026",
    review: "The level of craftsmanship and architectural thoughtfulness at Pigma is staggering. Our Surin Beach home feels incredibly luxury yet stays naturally cool even in April. Incredible service and experts.",
    avatar: "https://picsum.photos/seed/siriporn/100/100"
  },
  {
    id: "rev-3",
    name: "Marcus & Elena Vance",
    rating: 5,
    date: "March 2026",
    review: "We searched all over SE Asia for a sustainable home. Pigma provided completely verified metrics, local building permits, and transparent pricing. The wind turbines on Samui are whisper quiet!",
    avatar: "https://picsum.photos/seed/elena/100/100"
  }
];
