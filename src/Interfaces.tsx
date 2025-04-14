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
}

export interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number }; // För "way"-objekt
  tags?: {
    name?: string;
    "addr:street"?: string;
    "addr:city"?: string;
    "contact:phone"?: string;
    website?: string;
    cuisine?: string;
    opening_hours?: string;
  };
}

export interface HeaderProps {
  city: string | undefined;
  isLoading: boolean;
  onRefresh: () => void;
  placeType: string;
  selectedType?: string; // ✅ Gör valfri
  placeOptions?: { value: string; label: string }[]; // ✅ Gör valfri
  onTypeChange?: (type: string) => void; // ✅ Gör valfri
  showTypeSelect?: boolean; // ✅ Ny prop, valfr
}

export type PlaceType = "restaurant" | "fast_food" | "bar" | "pub" | "cafe";
export const isPlaceType = (value: string): value is PlaceType => {
  return ["restaurant", "fast_food", "bar", "pub"].includes(value);
};

export interface LoadMoreButtonProps {
  isLoading: boolean;
  visibleCount: number;
  maxCount?: number;
  onClick: () => void;
}

export interface PlaceCardProps {
  place: Place;
  isExpanded: boolean;
  onClick: () => void;
  typeLabel?: string;
  icon?: string;
}

export interface PlaceDetailsProps {
  place: Place;
  onShowUserPosition: () => void;
  showUserPosition: boolean;
  showPolyline: boolean;
  typeLabel?: string;
  icon?: string;
  city?: string;
}
