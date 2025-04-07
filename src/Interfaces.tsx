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
