import {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
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

// Define Coordinate type consistent with ORS output
type Coordinate = [number, number]; // [longitude, latitude]

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Define the props for the Map component
type MapProps = {
  lat: number;
  lon: number;
  zoom?: number;
  name?: string;
  centerOnUser?: boolean;
  showUserPosition?: boolean;
  showPolyLine?: boolean;
  routeCoordinates?: Coordinate[] | null; // Add new prop for ORS route
  flyToCoords?: [number, number] | null; // Coords to fly to (lat, lon)
  flyToTrigger?: number | null; // Trigger for the fly-to action
};

// Define the type for the imperative handle
export type MapHandle = {
  stopWatching: () => void;
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

// Use forwardRef to allow parent component to call functions on this component
const Map = forwardRef<MapHandle, MapProps>(
  (
    {
      lat,
      lon,
      zoom = 16,
      name = "Restaurang",
      showUserPosition,
      showPolyLine,
      routeCoordinates,
      flyToCoords,
      flyToTrigger,
    },
    ref // The ref passed from the parent
  ) => {
    const [userPosition, setUserPosition] = useState<{
      lat: number;
      lon: number;
    } | null>(null);
    const mapRef = useRef<L.Map | null>(null);
    const watchIdRef = useRef<number | null>(null); // Use ref to store watchId for imperative cleanup

    // Expose the stopWatching function via useImperativeHandle
    useImperativeHandle(ref, () => ({
      stopWatching: () => {
        if (watchIdRef.current !== null && navigator.geolocation) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        // Also clear the user position marker when stopping externally
        setUserPosition(null);
      },
    }));

    // Effect for getting/watching user position (used for marker)
    useEffect(() => {
      // Clear previous watch before starting a new one (belt-and-suspenders)
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      if (showUserPosition && navigator.geolocation) {
        // Get initial position first for faster marker display
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserPosition({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            });
          },
          (error) =>
            console.error("Error getting initial position for marker:", error),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );

        // Then start watching for updates
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;

            setUserPosition({
              lat: userLat,
              lon: userLon,
            });

            // Don't flyTo here automatically
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
      } else {
        setUserPosition(null);
      }

      // Cleanup function for this effect
      return () => {
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
          console.log("Map: Effect cleanup stopped watching position.");
        }
      };
    }, [showUserPosition, zoom]);

    useEffect(() => {
      const style = document.createElement("style");
      style.textContent = popupStyle;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }, []);

    // Effect to fit map bounds to the route when routeCoordinates are available
    useEffect(() => {
      if (routeCoordinates && routeCoordinates.length > 0 && mapRef.current) {
        // Swap coordinates for Leaflet LatLngBoundsExpression: [lat, lon]
        const bounds = routeCoordinates.map(
          (coord) => [coord[1], coord[0]] as L.LatLngExpression
        );
        if (bounds.length > 0) {
          // Add user position to bounds if available, to ensure it's visible
          if (userPosition) {
            bounds.push([userPosition.lat, userPosition.lon]);
          }
          const latLngBounds = L.latLngBounds(bounds);
          mapRef.current.fitBounds(latLngBounds, { padding: [50, 50] }); // Add padding
        }
      } else if (!routeCoordinates && userPosition && mapRef.current) {
        // If no route, but user position is shown, fly to user
        mapRef.current.flyTo([userPosition.lat, userPosition.lon], zoom);
      } else if (!routeCoordinates && !userPosition && mapRef.current) {
        // If no route and no user position, center on the place
        mapRef.current.flyTo([lat, lon], zoom);
      }
      // Depend on routeCoordinates and userPosition presence
    }, [routeCoordinates, userPosition, lat, lon, zoom]);

    // Effect to handle programmatic fly-to requests
    useEffect(() => {
      if (flyToTrigger && flyToCoords && mapRef.current) {
        mapRef.current.flyTo(flyToCoords, mapRef.current.getZoom(), {
          animate: true,
          duration: 1.5,
        });
      }
    }, [flyToTrigger, flyToCoords]);

    // Prepare route points for Leaflet Polyline (swap lon/lat)
    const leafletRoutePoints: L.LatLngExpression[] | null = routeCoordinates
      ? routeCoordinates.map((coord) => [coord[1], coord[0]])
      : null;

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
          <Marker
            position={[userPosition.lat, userPosition.lon]}
            icon={userIcon}
          >
            <Popup>
              <div className="bg-[#FFF8F5] p-3 rounded-md min-w-[100px] text-center">
                <h2 className="text-[#C53C07] font-semibold">Du är här</h2>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Render the OpenRouteService route if available */}
        {leafletRoutePoints && (
          <Polyline
            positions={leafletRoutePoints}
            color="blue"
            weight={5}
            opacity={0.7}
          />
        )}

        {/* Fallback: Render simple polyline if no route and showPolyLine is true */}
        {!leafletRoutePoints && userPosition && showPolyLine && (
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
      </MapContainer>
    );
  }
);

export default Map;
