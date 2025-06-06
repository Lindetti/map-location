import ClothesIcon from "./assets/icons/clothes.png";
import ShoesIcon from "./assets/icons/shoes.png";
import ElectronicsIcon from "./assets/icons/electronics.png";
import RestaurantIcon from "./assets/icons/restaurant.png";
import BarIcon from "./assets/icons/bar.png";
import CafeIcon from "./assets/icons/cafe.png";
import FastFoodIcon from "./assets/icons/fastfood.png";
import AlcoholIcon from "./assets/icons/alcohol.png";
import HotelIcon from "./assets/icons/hotel.png";
import SuperMarketIcon from "./assets/icons/grocery.png";
import FuelIcon from "./assets/icons/gas.png";

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
  typeLabel?: string; // Nytt fält för typ av plats
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
    "contact:phone"?: string;
    "building:levels"?: string;
    place?: string;
    operator?: string;
    brand?: string;
    phone: string;
    email: string;
    cuisine?: string;
    opening_hours?: string;
    amenity?: string;
    shop?: string;
    website?: string;
  };
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
  | "hospital";

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
  ].includes(value);
};

export const iconMapping: { [key in PlaceType]: string } = {
  restaurant: RestaurantIcon,
  fast_food: FastFoodIcon,
  bar: BarIcon,
  pub: BarIcon,
  clothes: ClothesIcon,
  shoes: ShoesIcon,
  supermarket: SuperMarketIcon,
  electronics: ElectronicsIcon,
  nightclub: ClothesIcon,
  cafe: CafeIcon,
  flowers: ClothesIcon,
  after_party: ClothesIcon,
  alcohol: AlcoholIcon,
  hotel: HotelIcon,
  hostel: HotelIcon,
  fuel: FuelIcon,
  convenience: SuperMarketIcon,
  pharmacy: SuperMarketIcon,
  kiosk: SuperMarketIcon,
  hospital: SuperMarketIcon,
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
  walkingTime?: number;
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
