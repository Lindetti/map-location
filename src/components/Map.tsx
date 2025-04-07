import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

type MapProps = {
  lat: number;
  lon: number;
  zoom?: number;
  name?: string;
};

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png", // En annan ikon för användaren
  iconSize: [35, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const Map = ({ lat, lon, zoom = 16, name = "Restaurang" }: MapProps) => {
  const [userPosition, setUserPosition] = useState<{
    lat: number;
    lon: number;
  } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
        },
        {
          enableHighAccuracy: true, // Förbättrar noggrannheten
          timeout: 10000, // Timeout efter 10 sekunder
          maximumAge: 0, // Ingen cachning av tidigare positioner
        }
      );
    }
  }, []);

  return (
    <MapContainer
      center={[lat, lon]}
      zoom={zoom}
      scrollWheelZoom={false}
      minZoom={16} // Begränsa hur långt man kan zooma ut
      maxZoom={18}
      className="h-full w-full rounded shadow-md z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
      />
      <Marker position={[lat, lon]} icon={customIcon}>
        <Popup>{name}</Popup>
      </Marker>
      {userPosition && (
        <Marker position={[userPosition.lat, userPosition.lon]} icon={userIcon}>
          <Popup>Du är här</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default Map;
