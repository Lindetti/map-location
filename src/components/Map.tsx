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
import userArrowIcon from "../assets/icons/arrowDown.png";

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

// Create a custom DivIcon to layer the dot and the arrow
const userIcon = L.divIcon({
  className: "user-location-marker", // Custom class for potential styling
  html: `
    <img src="${userArrowIcon}" class="user-direction-arrow" alt="direction arrow" style="width: 30px; height: 30px; position: absolute; left: 50%; top: 100%; transform: translate(-50%, -5px);" />
    <img src="${userIconPosition}" class="user-location-dot" alt="user location" style="width: 42px; height: 42px; position: relative; z-index: 1;" />
  `,
  iconSize: [42, 42], // Base size of the main dot icon
  iconAnchor: [21, 42], // Anchor at the bottom-center of the dot
  popupAnchor: [0, -45], // Adjust popup anchor relative to the dot's bottom
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
      heading: number | null;
    } | null>(null);
    const mapRef = useRef<L.Map | null>(null);
    const watchIdRef = useRef<number | null>(null); // Use ref to store watchId for imperative cleanup
    const userMarkerRef = useRef<L.Marker | null>(null); // Ref for the user marker instance

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

    // Effect for getting/watching user position (used for marker AND panning/zooming during route)
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
              heading: position.coords.heading,
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
            const userHeading = position.coords.heading;
            const userLatLng = L.latLng(userLat, userLon);

            setUserPosition({
              lat: userLat,
              lon: userLon,
              heading: userHeading,
            });

            // Center map exactly on user and zoom *if* route is active
            if (routeCoordinates && mapRef.current) {
              const map = mapRef.current;
              map.setView(userLatLng, 18, {
                animate: true,
                duration: 1.0, // Smooth transition
                noMoveStart: true,
              });
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
      } else {
        setUserPosition(null);
      }

      // Cleanup function for this effect
      return () => {
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      };
    }, [showUserPosition, zoom, routeCoordinates]);

    useEffect(() => {
      const style = document.createElement("style");
      style.textContent = popupStyle;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }, []);

    // Effect to fit map bounds OR zoom to user when route appears/disappears
    useEffect(() => {
      if (routeCoordinates && routeCoordinates.length > 0 && mapRef.current) {
        const map = mapRef.current;
        // Swap coordinates for Leaflet LatLngBoundsExpression: [lat, lon]
        const bounds = routeCoordinates.map(
          (coord) => [coord[1], coord[0]] as L.LatLngExpression
        );
        // If user position is known when route loads, zoom directly on user
        if (userPosition) {
          const userLatLng = L.latLng(userPosition.lat, userPosition.lon);
          map.setView(userLatLng, 18, { animate: true }); // Zoom in directly on user
        }
        // Otherwise (user position not yet known), fit the route bounds
        else if (bounds.length > 0) {
          const latLngBounds = L.latLngBounds(bounds);
          map.fitBounds(latLngBounds, { padding: [50, 50] });
        }
      } else if (!routeCoordinates && mapRef.current) {
        // If no route, but user position is shown, fly to user
        if (userPosition) {
          mapRef.current.flyTo([userPosition.lat, userPosition.lon], zoom);
        } else {
          // If no route and no user position, center on the place
          mapRef.current.flyTo([lat, lon], zoom);
        }
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

    // Effect to rotate user marker icon when heading changes
    useEffect(() => {
      // Find the arrow image within the DivIcon and rotate it
      if (userMarkerRef.current) {
        const markerElement = userMarkerRef.current.getElement();
        if (markerElement) {
          const arrowElement = markerElement.querySelector<HTMLElement>(
            ".user-direction-arrow"
          );
          if (arrowElement) {
            const heading = userPosition?.heading;
            if (heading !== null && heading !== undefined) {
              arrowElement.style.transformOrigin = "center center";
              arrowElement.style.transform = `translate(-50%, -5px) rotate(${heading}deg)`; // Keep the translate part
            } else {
              // Reset rotation
              arrowElement.style.transform =
                "translate(-50%, -5px) rotate(0deg)";
            }
          }
        }
      }
    }, [userPosition]); // Depend on the whole userPosition object

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

        {userPosition && showUserPosition && (
          <Marker
            position={[userPosition.lat, userPosition.lon]}
            icon={userIcon}
            ref={userMarkerRef}
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
            color="red" // Use a distinct color for the route
            weight={5} // Make it slightly thicker
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
