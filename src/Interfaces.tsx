export interface Place {
  name: string;
  lat: number;
  lon: number;
  distance: number;
  address?: string;
  phone?: string;
  website?: string;
  cuisine?: string;
  openingHours?: string;
  city?: string;
  email?: string;
  operator?: string;
  levels?: string;
  brand?: string;
  typeLabel?: string;
  type?: string;
  tags?: {
    name?: string;
    "addr:street"?: string;
    "addr:city"?: string;
    "addr:housenumber"?: string;
    "contact:phone"?: string;
    opening_hours?: string;
    website?: string;
    cuisine?: string;
    amenity?: string;
  };
}

export interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  name: string;
  openingHours?: string;
  website?: string;
  center?: { lat: number; lon: number }; // För "way"-objekt
  tags?: {
    name?: string;
    "addr:street"?: string;
    "addr:city"?: string;
    "addr:housenumber"?: string;
    "contact:phone"?: string;
    "building:levels"?: string;
    place?: string;
    operator?: string;
    brand?: string;
    phone?: string;
    amenity?: string;
    highway?: string;
    railway?: string;
    network?: string;
    public_transport?: string;
    email?: string;
    cuisine?: string;
    opening_hours?: string;
    shop?: string;
    website?: string;
    tourism?: string;
  };
}

export interface ExtendedOverpassElement extends OverpassElement {
  distance: number;
  lines?: string[]; // Busslinjer t.ex. ["2", "3", "4"]
}

export interface HeaderProps {
  city?: string | undefined;
  isLoading?: boolean;
  onRefresh?: () => void;
  placeType?: string;
  selectedType?: string;
  placeOptions?: { value: string; label: string }[];
  onTypeChange?: (type: string) => void;
  showTypeSelect?: boolean;
  isHome?: boolean;
}

export type PlaceType =
  | "restaurant"
  | "fast_food"
  | "bar"
  | "pub"
  | "clothes"
  | "shoes"
  | "supermarket"
  | "electronics"
  | "flowers"
  | "cafe"
  | "nightclub"
  | "after_party"
  | "alcohol"
  | "hotel"
  | "hostel"
  | "fuel"
  | "convenience"
  | "pharmacy"
  | "kiosk"
  | "hospital"
  | "transport";

export const isPlaceType = (value: string): value is PlaceType => {
  return [
    "restaurant",
    "fast_food",
    "bar",
    "pub",
    "clothes",
    "shoes",
    "supermarket",
    "electronics",
    "flowers",
    "nightclub",
    "cafe",
    "after_party",
    "alcohol",
    "fuel",
    "convenience",
    "pharmacy",
    "kiosk",
    "hospital",
    "gas_station",
  ].includes(value);
};

// Icon mapping has been removed as we now use Lucide React icons directly in components

export interface LoadMoreButtonProps {
  isLoading: boolean;
  visibleCount: number;
  maxCount?: number;
  onClick: () => void;
}

export interface PlaceCardProps {
  place: {
    name: string;
    lat: number;
    lon: number;
    distance: number;
    tags?: {
      name?: string;
      "addr:street"?: string;
      "addr:city"?: string;
      "addr:housenumber"?: string;
      "contact:phone"?: string;
      opening_hours?: string;
      website?: string;
      cuisine?: string;
      amenity?: string;
    };
  };
  onClick: () => void;
  typeLabel?: string;
  icon?: string;
}

export interface PlaceDetailsProps {
  place: Place;
  onShowUserPosition: () => void;
  showUserPosition: boolean;
  showPolyline: boolean;
  icon: string;
  city?: string;
  isPositionFixed: boolean;
  onTogglePositionFixed: () => void;
}
