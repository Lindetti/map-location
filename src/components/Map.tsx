import { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import userIconPosition from "../assets/icons/usericon.png";

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
  centerOnUser?: boolean;
  showUserPosition?: boolean;
  showPolyLine?: boolean;
};

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const userIcon = new L.Icon({
  iconUrl: userIconPosition, // En annan ikon för användaren
  iconSize: [42, 42],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const popupStyle = `
  .leaflet-popup-content-wrapper {
    padding: 0;
    overflow: hidden;
  }
  .leaflet-popup-content {
    margin: 0;
  }
  .leaflet-popup-tip-container {
    display: none;
  }
`;

const Map = ({
  lat,
  lon,
  zoom = 16,
  name = "Restaurang",
  showUserPosition,
  showPolyLine,
}: MapProps) => {
  const [userPosition, setUserPosition] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const mapRef = useRef<L.Map | null>(null); // Reference for the map

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLon = position.coords.longitude;

          setUserPosition({
            lat: userLat,
            lon: userLon,
          });

          // Fly to the user's location if the map is initialized
          if (mapRef.current && showUserPosition) {
            mapRef.current.flyTo([userLat, userLon], zoom); // Fly to the user's position
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }
  }, [zoom, showUserPosition]);

  // Add this new useEffect for real-time position updates
  useEffect(() => {
    if (showUserPosition) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLon = position.coords.longitude;

          setUserPosition({
            lat: userLat,
            lon: userLon,
          });

          if (mapRef.current) {
            mapRef.current.flyTo([userLat, userLon], zoom);
          }
        },
        (error) => {
          console.error("Error watching position:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [showUserPosition, zoom]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = popupStyle;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <MapContainer
      center={[lat, lon]}
      zoom={zoom}
      scrollWheelZoom={false}
      minZoom={16} // Begränsa hur långt man kan zooma ut
      maxZoom={18}
      className="h-full w-full rounded shadow-md z-0"
      ref={mapRef}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
      />
      <Marker position={[lat, lon]} icon={customIcon}>
        <Popup>
          <div className="bg-[#FFF8F5] p-3 rounded-md min-w-[150px] text-center">
            <h2 className="text-[#C53C07] font-semibold">{name}</h2>
          </div>
        </Popup>
      </Marker>
      {userPosition && showPolyLine && (
        <Polyline
          positions={[
            [userPosition.lat, userPosition.lon],
            [lat, lon],
          ]}
          color="blue"
          weight={3}
          opacity={0.5}
        />
      )}

      {userPosition && (
        <Marker position={[userPosition.lat, userPosition.lon]} icon={userIcon}>
          <Popup>
            <div className="bg-[#FFF8F5] p-3 rounded-md min-w-[100px] text-center">
              <h2 className="text-[#C53C07] font-semibold">Du är här</h2>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default Map;
