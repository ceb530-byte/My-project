export type SubscriptionTier = "free" | "premium";

export type LocalAreaTier = "immediate" | "neighbourhood" | "district";

export interface LocalAreaConfig {
  tier: LocalAreaTier;
  radiusMetres: number;
  label: string;
  description: string;
}

export interface ParsedPostcode {
  full: string;
  outward: string;
  sector: string;
  unit: string;
  isValid: boolean;
}

export interface Property {
  id: string;
  address: string;
  postcode: string;
  estimatedValue: number;
  valueChangePercent: number;
  lastSoldPrice?: number;
  lastSoldDate?: string;
  epcRating: "A" | "B" | "C" | "D" | "E" | "F" | "G";
  epcScore: number;
  councilTaxBand: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";
  floodRisk: "very_low" | "low" | "medium" | "high";
  schoolCatchments: SchoolCatchment[];
}

export interface SchoolCatchment {
  name: string;
  type: "primary" | "secondary";
  ofstedRating: "Outstanding" | "Good" | "Requires improvement" | "Inadequate";
  distanceMetres: number;
  inCatchment: boolean;
}

export type FeedCategory =
  | "planning"
  | "development"
  | "transport"
  | "schools"
  | "retail"
  | "crime"
  | "roads"
  | "community";

export interface FeedItem {
  id: string;
  category: FeedCategory;
  title: string;
  summary: string;
  distanceMetres: number;
  publishedAt: string;
  source: string;
  actionable?: string;
  premium?: boolean;
}

export type AlertType =
  | "planning_neighbour"
  | "development_approved"
  | "price_change"
  | "crime_spike"
  | "maintenance"
  | "insurance_renewal"
  | "utility_contract";

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  priority: "low" | "medium" | "high";
}

export interface Opportunity {
  id: string;
  type:
    | "expired_planning"
    | "development_plot"
    | "extension_potential"
    | "hmo_conversion";
  title: string;
  address: string;
  distanceMetres: number;
  summary: string;
  estimatedUpside?: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  avatarInitials: string;
  title: string;
  body: string;
  category: "question" | "planning" | "trades" | "local_info";
  replies: number;
  createdAt: string;
  verifiedLocal: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  postcode: string;
  tier: SubscriptionTier;
  properties: Property[];
}
