import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L, { LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";
import { ExtendedOverpassElement } from "../Interfaces";

interface PlacesMapProps {
  places: ExtendedOverpassElement[];
  userLocation: { lat: number; lon: number } | null;
  selectedCategory: string;
}

const createCustomIcon = (emoji: string) => {
  return L.divIcon({
    html: `<div style="background: white; border-radius: 50%; padding: 4px; border: 2px solid #3b82f6; font-size: 16px; text-align: center; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">${emoji}</div>`,
    className: "custom-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const userIcon = L.divIcon({
  html: '<div style="background: #ef4444; border-radius: 50%; width: 16px; height: 16px; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
  className: "user-marker",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const getPlaceIcon = (place: ExtendedOverpassElement) => {
  const amenity = place.tags?.amenity;
  const shop = place.tags?.shop;
  const tourism = place.tags?.tourism;
  const highway = place.tags?.highway;

  if (amenity === "restaurant") {
    return createCustomIcon("🍽️");
  }
  if (amenity === "fast_food") {
    return createCustomIcon("🍔");
  }

  if (amenity === "fuel") {
    return createCustomIcon("⛽️");
  }

  if (amenity === "taxi") {
    return createCustomIcon("🚕");
  }

  if (highway === "bus_stop") {
    return createCustomIcon("🚌");
  }

  if (shop) {
    if (shop === "clothes") return createCustomIcon("👕");
    if (shop === "shoes") return createCustomIcon("👟");
    if (shop === "electronics") return createCustomIcon("📱");
    if (shop === "alcohol") return createCustomIcon("🍷");
    return createCustomIcon("🏪");
  }
  if (tourism === "hotel" || tourism === "hostel") {
    return createCustomIcon("🏨");
  }
  return createCustomIcon("📍");
};

// Component to handle map bounds
function MapBounds({ places }: { places: ExtendedOverpassElement[] }) {
  const map = useMap();

  useEffect(() => {
    if (places.length > 0) {
      const bounds = new LatLngBounds([]);
      places.forEach((place) => {
        const lat = place.lat || place.center?.lat;
        const lon = place.lon || place.center?.lon;
        if (lat && lon) {
          bounds.extend([lat, lon]);
        }
      });
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [places, map]);

  return null;
}

const PlacesMap = ({ places, userLocation }: PlacesMapProps) => {
  const initialLocation = userLocation || { lat: 62.3908, lon: 17.3069 }; // Default to Sundsvall

  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden">
      <MapContainer
        center={[initialLocation.lat, initialLocation.lon]}
        zoom={13}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {places.map((place) => {
          const lat = place.lat || place.center?.lat;
          const lon = place.lon || place.center?.lon;

          if (!lat || !lon) return null;

          return (
            <Marker
              key={place.id}
              position={[lat, lon]}
              icon={getPlaceIcon(place)}
            >
              <Popup>
                <div className="popup-content">
                  <h3 className="font-bold">
                    {place.tags?.name || "Unnamed Place"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {place.distance?.toFixed(1) || "?"} km bort
                  </p>
                  {place.tags?.["addr:street"] && (
                    <p className="text-sm text-gray-600">
                      {place.tags["addr:street"]}{" "}
                      {place.tags["addr:housenumber"] || ""}
                    </p>
                  )}
                  <button
                    onClick={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
                      window.open(url, "_blank");
                    }}
                    className="mt-2 w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Vägbeskrivning
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lon]}
            icon={userIcon}
          >
            <Popup>Din position</Popup>
          </Marker>
        )}

        <MapBounds places={places} />
      </MapContainer>
      <style>{`
        .leaflet-container {
          height: 100%;
          width: 100%;
          border-radius: 0.75rem;
        }
        .popup-content {
          min-width: 200px;
        }
      `}</style>
    </div>
  );
};

export default PlacesMap;
