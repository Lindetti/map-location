import {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import maplibregl, {
  Map as MaplibreMap,
  Marker,
  Popup,
  LngLatLike,
  GeoJSONSource,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import userIconPosition from "../assets/icons/usericon.png";
import userArrowIcon from "../assets/icons/arrowDown.png";

// Define Coordinate type consistent with ORS output (longitude, latitude)
type Coordinate = [number, number];

// Define the props for the Map component
type MapProps = {
  lat: number; // Latitude
  lon: number; // Longitude
  zoom?: number;
  name?: string;
  centerOnUser?: boolean;
  showUserPosition?: boolean;
  showPolyLine?: boolean;
  routeCoordinates?: Coordinate[] | null; // ORS route [lon, lat]
  flyToCoords?: [number, number] | null; // Coords to fly to [lon, lat]
  flyToTrigger?: number | null; // Trigger for the fly-to action
};

// Define the type for the imperative handle
export type MapHandle = {
  stopWatching: () => void;
};

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
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<MaplibreMap | null>(null);
    const [userPosition, setUserPosition] = useState<{
      lon: number;
      lat: number;
      heading: number | null;
    } | null>(null);
    const watchIdRef = useRef<number | null>(null);
    const userMarkerRef = useRef<Marker | null>(null);
    const placeMarkerRef = useRef<Marker | null>(null);
    const userPopupRef = useRef<Popup | null>(null);
    const placePopupRef = useRef<Popup | null>(null);
    const [hasUserManuallyZoomed, setHasUserManuallyZoomed] = useState(false);
    const isFlyingToRef = useRef(false); // To track if flyTo is active

    // Expose the stopWatching function via useImperativeHandle
    useImperativeHandle(ref, () => ({
      stopWatching: () => {
        if (watchIdRef.current !== null && navigator.geolocation) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        setUserPosition(null);
        if (userMarkerRef.current) {
          userMarkerRef.current.remove();
          userMarkerRef.current = null;
        }
      },
    }));

    // Initialize map
    useEffect(() => {
      if (mapRef.current || !mapContainer.current) return;

      mapRef.current = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${
          import.meta.env.VITE_MAPTILER_API_KEY
        }`,
        center: [lon, lat],
        zoom: zoom,
        minZoom: 15,
        maxZoom: 18,
        transformRequest: (url) => {
          if (url.startsWith("https://api.maptiler.com/")) {
            // Add the API key to all MapTiler requests
            const separator = url.includes("?") ? "&" : "?";
            return {
              url: `${url}${separator}key=${
                import.meta.env.VITE_MAPTILER_API_KEY
              }`,
            };
          }
          return { url };
        },
      });

      mapRef.current.addControl(
        new maplibregl.NavigationControl(),
        "top-right"
      );

      // Add a marker for the main place
      if (mapRef.current) {
        const placePopupNode = document.createElement("div");
        placePopupNode.innerHTML = `
          <div class="bg-[#FFF8F5] p-3 rounded-md min-w-[150px] text-center">
            <h2 class="text-[#C53C07] font-semibold">${name}</h2>
          </div>
        `;
        placePopupRef.current = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 25,
        }).setDOMContent(placePopupNode);

        placeMarkerRef.current = new maplibregl.Marker()
          .setLngLat([lon, lat])
          .setPopup(placePopupRef.current)
          .addTo(mapRef.current);
      }

      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    }, [lat, lon, zoom, name]); // Ensure map re-initializes if these core props change (though ideally, they don't after first load)

    // Listen to map events for manual zoom detection
    useEffect(() => {
      if (!mapRef.current) return;
      const map = mapRef.current;

      const onZoomStart = () => {
        // If zoom starts and it wasn't initiated by our flyTo, assume user interaction
        if (!isFlyingToRef.current) {
          setHasUserManuallyZoomed(true);
        }
      };
      const onFlyStart = () => {
        isFlyingToRef.current = true;
      };

      map.on("zoomstart", onZoomStart);
      map.on("movestart", onZoomStart); // Consider pan as well for resetting auto-zoom intention
      // Track flyTo calls to distinguish them from manual zooms
      map.on("flystart", onFlyStart); // Hypothetical event, MapLibre might not have direct flystart/flyend
      // We will manage isFlyingToRef around flyTo calls instead.

      return () => {
        map.off("zoomstart", onZoomStart);
        map.off("movestart", onZoomStart);
        map.off("flystart", onFlyStart);
      };
    }, []); // Empty dependency array, runs once when map is initialized

    // Effect for getting/watching user position
    useEffect(() => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      if (showUserPosition && navigator.geolocation) {
        const handlePositionSuccess = (position: GeolocationPosition) => {
          const userLon = position.coords.longitude;
          const userLat = position.coords.latitude;
          const userHeading = position.coords.heading;

          setUserPosition({
            lon: userLon,
            lat: userLat,
            heading: userHeading,
          });

          if (mapRef.current) {
            if (!userMarkerRef.current) {
              const el = document.createElement("div");
              el.className = "user-location-marker";
              el.style.width = "42px";
              el.style.height = "42px";
              el.innerHTML = `
                <img src="${userArrowIcon}" class="user-direction-arrow" alt="direction arrow" style="width: 30px; height: 30px; position: absolute; left: 50%; top: 100%; transform: translate(-50%, -5px) rotate(${
                userHeading || 0
              }deg); transform-origin: center center;" />
                <img src="${userIconPosition}" class="user-location-dot" alt="user location" style="width: 42px; height: 42px; position: relative; z-index: 1;" />
              `;

              const userPopupNode = document.createElement("div");
              userPopupNode.innerHTML = `
                <div class="bg-[#FFF8F5] p-3 rounded-md min-w-[100px] text-center">
                  <h2 class="text-[#C53C07] font-semibold">Du är här</h2>
                </div>
              `;
              userPopupRef.current = new maplibregl.Popup({
                closeButton: false,
                closeOnClick: false,
                offset: 25,
              }).setDOMContent(userPopupNode);

              userMarkerRef.current = new maplibregl.Marker(el)
                .setLngLat([userLon, userLat])
                .setPopup(userPopupRef.current)
                .addTo(mapRef.current);
            } else {
              userMarkerRef.current.setLngLat([userLon, userLat]);
              const markerElement = userMarkerRef.current.getElement();
              const arrowElement = markerElement.querySelector<HTMLElement>(
                ".user-direction-arrow"
              );
              if (arrowElement) {
                arrowElement.style.transform = `translate(-50%, -5px) rotate(${
                  userHeading || 0
                }deg)`;
              }
            }

            if (routeCoordinates && mapRef.current) {
              if (!hasUserManuallyZoomed) {
                isFlyingToRef.current = true;
                mapRef.current.flyTo({
                  center: [userLon, userLat],
                  zoom: 18,
                  duration: 1000,
                });
                setTimeout(() => (isFlyingToRef.current = false), 1000); // Reset after flyTo duration
              } else {
                // If user has manually zoomed, only pan to the new user location
                mapRef.current.panTo([userLon, userLat]);
              }
            }
          }
        };

        const handlePositionError = (error: GeolocationPositionError) => {
          console.error("Error getting/watching position:", error);
        };

        navigator.geolocation.getCurrentPosition(
          handlePositionSuccess,
          handlePositionError,
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );

        watchIdRef.current = navigator.geolocation.watchPosition(
          handlePositionSuccess,
          handlePositionError,
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        );
      } else {
        setUserPosition(null);
        if (userMarkerRef.current) {
          userMarkerRef.current.remove();
          userMarkerRef.current = null;
        }
      }

      return () => {
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      };
    }, [showUserPosition, routeCoordinates]); // Removed zoom from deps as flyTo handles zoom during route

    // Effect to update user marker rotation (if marker exists)
    useEffect(() => {
      if (
        userMarkerRef.current &&
        userPosition?.heading !== null &&
        userPosition?.heading !== undefined
      ) {
        const markerElement = userMarkerRef.current.getElement();
        const arrowElement = markerElement.querySelector<HTMLElement>(
          ".user-direction-arrow"
        );
        if (arrowElement) {
          arrowElement.style.transformOrigin = "center center";
          arrowElement.style.transform = `translate(-50%, -5px) rotate(${userPosition.heading}deg)`;
        }
      }
    }, [userPosition?.heading]);

    // Effect to handle route display and map bounds
    useEffect(() => {
      if (!mapRef.current) return;
      const map = mapRef.current;

      // Reset manual zoom flag when route changes or is removed
      setHasUserManuallyZoomed(false);
      isFlyingToRef.current = false; // Reset flying ref too

      const routeSource = map.getSource("route") as GeoJSONSource;
      if (routeCoordinates && routeCoordinates.length > 0) {
        const geojsonRoute = {
          type: "Feature" as const,
          properties: {},
          geometry: {
            type: "LineString" as const,
            coordinates: routeCoordinates, // Already [lon, lat]
          },
        };

        if (routeSource) {
          routeSource.setData(geojsonRoute);
        } else {
          map.addSource("route", {
            type: "geojson",
            data: geojsonRoute,
          });
          map.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "red",
              "line-width": 5,
              "line-opacity": 0.7,
            },
          });
        }

        if (userPosition) {
          isFlyingToRef.current = true;
          map.flyTo({
            center: [userPosition.lon, userPosition.lat],
            zoom: 18, // Initial zoom when route starts with user position
            duration: 1000,
          });
          setTimeout(() => (isFlyingToRef.current = false), 1000);
        } else {
          const bounds = routeCoordinates.reduce((bounds, coord) => {
            return bounds.extend(coord as LngLatLike);
          }, new maplibregl.LngLatBounds(routeCoordinates[0] as LngLatLike, routeCoordinates[0] as LngLatLike));
          map.fitBounds(bounds, { padding: 50, duration: 1000 });
        }
      } else {
        if (routeSource) {
          map.removeLayer("route");
          map.removeSource("route");
        }
        // Reset flag if route is removed
        setHasUserManuallyZoomed(false);
        isFlyingToRef.current = false;

        // If no route, but user position is shown, fly to user
        if (userPosition && showUserPosition) {
          isFlyingToRef.current = true;
          map.flyTo({
            center: [userPosition.lon, userPosition.lat],
            zoom: zoom,
            duration: 1000,
          });
          setTimeout(() => (isFlyingToRef.current = false), 1000);
        } else {
          isFlyingToRef.current = true;
          map.flyTo({ center: [lon, lat], zoom: zoom, duration: 1000 });
          setTimeout(() => (isFlyingToRef.current = false), 1000);
        }
      }
    }, [routeCoordinates, userPosition, lat, lon, zoom, showUserPosition]);

    // Effect to handle programmatic fly-to requests
    useEffect(() => {
      if (flyToTrigger && flyToCoords && mapRef.current) {
        setHasUserManuallyZoomed(false); // Programmatic fly-to should reset manual zoom
        isFlyingToRef.current = true;
        mapRef.current.flyTo({
          center: flyToCoords, // Expects [lon, lat]
          zoom: mapRef.current.getZoom(), // Or a specific zoom if desired
          duration: 1500,
        });
        setTimeout(() => (isFlyingToRef.current = false), 1500);
      }
    }, [flyToTrigger, flyToCoords]);

    // Simple polyline between user and place (if no route and showPolyLine)
    useEffect(() => {
      if (!mapRef.current) return;
      const map = mapRef.current;
      const simplePolylineSource = map.getSource(
        "simple-polyline"
      ) as GeoJSONSource;

      if (showPolyLine && userPosition && !routeCoordinates) {
        const polylineData = {
          type: "Feature" as const,
          properties: {},
          geometry: {
            type: "LineString" as const,
            coordinates: [
              [userPosition.lon, userPosition.lat],
              [lon, lat], // Main place coordinates
            ],
          },
        };
        if (simplePolylineSource) {
          simplePolylineSource.setData(polylineData);
        } else {
          map.addSource("simple-polyline", {
            type: "geojson",
            data: polylineData,
          });
          map.addLayer({
            id: "simple-polyline",
            type: "line",
            source: "simple-polyline",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "blue",
              "line-width": 3,
              "line-opacity": 0.5,
            },
          });
        }
      } else {
        if (simplePolylineSource) {
          if (map.getLayer("simple-polyline"))
            map.removeLayer("simple-polyline");
          if (map.getSource("simple-polyline"))
            map.removeSource("simple-polyline");
        }
      }
    }, [showPolyLine, userPosition, routeCoordinates, lat, lon]);

    return (
      <div
        ref={mapContainer}
        className="h-full w-full rounded shadow-md z-0"
        // MapLibre controls its own children, so no <MapContainer> needed
      />
    );
  }
);

export default Map;
