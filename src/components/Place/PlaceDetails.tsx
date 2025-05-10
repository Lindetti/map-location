import Map from "../Map";
import { PlaceDetailsProps } from "../../Interfaces";
import Phone from "../../assets/icons/phone.png";
import Link from "../../assets/icons/link.png";
import Open from "../../assets/icons/open.png";
import { useState, useEffect, useRef } from "react";
import type { MapHandle } from "../Map";

type Coordinate = [number, number]; 

interface MinimalPlaceDetailsProps {
  place: PlaceDetailsProps["place"];
  icon: PlaceDetailsProps["icon"]; 
  city: PlaceDetailsProps["city"]; 
}

const getTodayDateString = () => {
  return new Date().toISOString().split("T")[0];
};

const PlaceDetails = ({
  place,
  icon,
  city,
}: MinimalPlaceDetailsProps) => {
  const [showMapModal, setShowMapModal] = useState(false);
  const [currentDistance, setCurrentDistance] = useState<number | null>(null); 
  const [watchId, setWatchId] = useState<number | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[] | null>(
    null
  );
  const [isLoadingDirections, setIsLoadingDirections] =
    useState<boolean>(false);
  const [directionsError, setDirectionsError] = useState<string | null>(null);
  const [isRouteActive, setIsRouteActive] = useState<boolean>(false);


  const [showInitialUserMarker, setShowInitialUserMarker] =
    useState<boolean>(false);
  const [showInitialPolyline, setShowInitialPolyline] =
    useState<boolean>(false);
  const [initialMapFlyToTarget, setInitialMapFlyToTarget] = useState<
    [number, number] | null
  >(null);
  const [initialMapFlyToTrigger, setInitialMapFlyToTrigger] = useState<
    number | null
  >(null);


  const initialMapRef = useRef<MapHandle>(null);

  const handleShowInitialUserPosition = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLon = position.coords.longitude;

          setShowInitialUserMarker(true); 
          setShowInitialPolyline(true); 
          setInitialMapFlyToTarget([userLat, userLon]); 
          setInitialMapFlyToTrigger(Date.now()); 
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
    } else {
      console.error("Geolocation not supported");
    }
  };

  const fetchDirections = async (
    startCoords: Coordinate,
    endCoords: Coordinate
  ) => {
    const profile = "foot-walking"; 
    const today = getTodayDateString();
    const limitKey = "orsDailyLimitCount"; 
    const dateKey = "orsLimitResetDate";
    let currentCount = 0;

    try {
      const savedDate = localStorage.getItem(dateKey);
      const savedCount = localStorage.getItem(limitKey);

      if (savedDate === today && savedCount) {
        currentCount = parseInt(savedCount, 10);
      } else {
        currentCount = 0;
        localStorage.setItem(dateKey, today);
        localStorage.setItem(limitKey, "0"); 
      }

      const DAILY_LIMIT = 2000; 
      if (currentCount >= DAILY_LIMIT) {
        console.warn(
          `Client-side check indicates daily ORS request limit (${DAILY_LIMIT}/dag) might be reached.`
        );
        setDirectionsError(
          `Gränsen för vägbeskrivningsanrop (${DAILY_LIMIT}/dag) kan ha nåtts.`
        );
        setIsLoadingDirections(false);
        return; 
      }
    } catch (error) {
      console.error("Error handling API limit check in localStorage:", error);
    }

    setIsLoadingDirections(true);
    setDirectionsError(null);
    setRouteCoordinates(null); // Clear previous route visually


    const cacheKey = `ors-route-${startCoords.join(",")}-${endCoords.join(
      ","
    )}-${profile}`; 
    try {
      const cachedRoute = localStorage.getItem(cacheKey);
      if (cachedRoute) {
        const parsedRoute = JSON.parse(cachedRoute);
        if (Array.isArray(parsedRoute)) {
          console.log("Using cached route for:", cacheKey);
          setRouteCoordinates(parsedRoute as Coordinate[]);
          setIsLoadingDirections(false);
          return;
        }
        localStorage.removeItem(cacheKey);
      }
    } catch (error) {
      console.error("Error reading route from localStorage:", error);
    }

    // Call the serverless function endpoint
    const url = "/api/getDirections";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ startCoords, endCoords, profile }),
      });

      const data = await response.json(); 

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      if (data.routeCoordinates && Array.isArray(data.routeCoordinates)) {
        setRouteCoordinates(data.routeCoordinates as Coordinate[]);

        try {
          localStorage.setItem(cacheKey, JSON.stringify(data.routeCoordinates));
          console.log("Saved route to cache:", cacheKey);

          const newCount = currentCount + 1;
          localStorage.setItem(limitKey, newCount.toString());
        } catch (error) {
          console.error("Error saving route to localStorage:", error);
        }
        // --- End Caching Logic ---
      } else {
        throw new Error("Ingen rutt hittades eller oväntat svar från server.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(
        "Failed to fetch directions via serverless function:",
        error
      );
      setDirectionsError(`Kunde inte hämta vägbeskrivning: ${message}`);
    } finally {
      setIsLoadingDirections(false);
    }
  };

  const getDistanceInMeters = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3; 
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const startRouteNavigation = () => {
    if (!navigator.geolocation) {
      setDirectionsError("Geolocation stöds inte av din webbläsare.");
      return;
    }

    setIsLoadingDirections(true);
    setDirectionsError(null);
    setRouteCoordinates(null);
    setCurrentDistance(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLon = position.coords.longitude;
        const userLat = position.coords.latitude;
        const startCoords: Coordinate = [userLon, userLat];
        const endCoords: Coordinate = [place.lon, place.lat];

        fetchDirections(startCoords, endCoords)
          .then(() => {
            const id = navigator.geolocation.watchPosition(
              (pos) => {
                const currentLat = pos.coords.latitude;
                const currentLon = pos.coords.longitude;
                const dist = getDistanceInMeters(
                  currentLat,
                  currentLon,
                  place.lat,
                  place.lon
                );
                setCurrentDistance(dist); 
              },
              (error) => console.error("Error watching position:", error),
              { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
            setWatchId(id);
            setIsRouteActive(true);
            setIsLoadingDirections(false); 
          })
          .catch(() => {
            setIsLoadingDirections(false);
          });

        const initialDistance = getDistanceInMeters(
          userLat,
          userLon,
          place.lat,
          place.lon
        );
        setCurrentDistance(initialDistance);
      },
      (error) => {
        console.error("Error getting current position:", error);
        setDirectionsError("Kunde inte hämta din nuvarande position.");
        setIsLoadingDirections(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    const mapRefCurrent = initialMapRef.current;
    return () => {
      // Stop watching position if active
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      mapRefCurrent?.stopWatching();
      setShowInitialUserMarker(false);
      setShowInitialPolyline(false);
      setRouteCoordinates(null);
      setDirectionsError(null);
      setIsLoadingDirections(false);
      setCurrentDistance(null);
      setIsRouteActive(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMapModal, place.lat, place.lon]);

  const handleGPSActivation = () => {
    initialMapRef.current?.stopWatching();

    setShowMapModal(true);
    setShowInitialUserMarker(false); 
    setShowInitialPolyline(false); 
    setIsRouteActive(false);
    setRouteCoordinates(null);
    setCurrentDistance(null);
    setDirectionsError(null);
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  const handleDeactivateGPS = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    // Reset route state but keep modal open
    setIsRouteActive(false);
    setRouteCoordinates(null);
    setCurrentDistance(null);
    setDirectionsError(null);
  };

  const translateCuisine = (cuisine: string): string => {
    const translations: Record<string, string> = {
      burger: "Hamburgare",
      italian_pizza: "Italiensk pizza",
      pizza: "Pizza",
      sushi: "Sushi",
      chinese: "Kinesiskt",
      japanese: "Japanskt",
      american: "Amerikanskt",
      greek: "Grekiskt",
      indian: "Indiskt",
      kebab: "Kebab",
      mexican: "Mexikanskt",
      thai: "Thailändskt",
      coffee_shop: "Café",
      cafe: "Café",
      bakery: "Bageri",
      fast_food: "Snabbmat",
      sandwich: "Smörgåsar",
      seafood: "Skaldjur",
      asian: "Asiatiskt",
      italian: "Italienskt",
      steak_house: "Grill",
      bubble_tea: "Bubbelte",
      regional: "Husmanskost",
    };

    const trimmed = cuisine.trim().toLowerCase();
    return (
      translations[trimmed] ??
      trimmed
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
  };

  return (
    <div className="h-auto flex flex-col gap-5 border-t-2 border-gray-200 dark:border-gray-300">
      <div className="h-[350px] mt-5">
        <Map
          lat={place.lat}
          lon={place.lon}
          name={place.name}
          showUserPosition={showInitialUserMarker} 
          showPolyLine={showInitialPolyline} 
          flyToCoords={initialMapFlyToTarget} 
          flyToTrigger={initialMapFlyToTrigger} 
          ref={initialMapRef} 
        />
      </div>

      <div className="flex justify-between gap-4 p-2">
        <button
          className="group flex items-center gap-2 text-sm bg-[#FCF9F8] text-black px-3 h-[35px] border border-gray-300 rounded hover:bg-[#FFF8F5] hover:text-[#C53C07] font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleShowInitialUserPosition} 
          disabled={showMapModal}
        >
          Visa min position
        </button>
        <button
          className="group flex items-center gap-2 text-sm px-3 h-[35px] border rounded font-semibold transition md:hidden bg-[#FCF9F8] text-black border-gray-300 hover:bg-[#FFF8F5] hover:text-[#C53C07]"
          onClick={handleGPSActivation}
        >
          Aktivera GPS
        </button>
      </div>

      <div className="flex flex-col gap-8 md:gap-0 md:flex-row md:justify-between md:items-center">
        <div className="flex flex-col gap-6 p-4 w-full">
          {/* Cuisine Section */}
          {place.cuisine && (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <img src={icon} alt="cuisine icon" className="h-6 w-6" />
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                  Köksstil
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 pl-8">
                {(place.cuisine ?? "")
                  .split(";")
                  .slice(0, 3)
                  .map((cuisine) => translateCuisine(cuisine))
                  .join(", ")}
              </p>
            </div>
          )}

          {/* Brand/Operator Section */}
          {(place.brand || place.operator) && (
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                Kedja
              </h3>
              <p className="text-gray-600 dark:text-gray-200 pl-8">
                {place.brand || place.operator}
              </p>
            </div>
          )}

          {/* Levels Section */}
          {place.levels && (
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                Antal våningar
              </h3>
              <p className="text-gray-600 dark:text-gray-200 pl-8">
                {place.levels}
              </p>
            </div>
          )}

          {/* Contact Section */}
          {(place.phone || place.email) && (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <img src={Phone} alt="phone icon" className="h-6 w-6" />
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                  Kontakt
                </h3>
              </div>
              <div className="flex flex-col gap-2 pl-8">
                {place.phone && (
                  <div className="flex gap-2 items-center">
                    <a
                      href={`tel:${place.phone}`}
                      className="text-blue-500 dark:text-blue-300 hover:underline"
                    >
                      {place.phone}
                    </a>
                  </div>
                )}
                {place.email && (
                  <div className="flex gap-2 items-center">
                    <a
                      href={`mailto:${place.email}`}
                      className="text-blue-500 dark:text-blue-300 hover:underline"
                    >
                      {place.email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Opening Hours Section */}
          {place.openingHours && (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <img src={Open} alt="opening hours icon" className="h-5 w-5" />
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                  Öppettider
                </h3>
              </div>
              <ul className="list-none pl-8 text-gray-600 dark:text-gray-200">
                {place.openingHours.split(";").map((hour, i) => (
                  <li key={i} className="py-1">
                    {hour.trim()}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Website/Google Search Section */}
          <div className="flex flex-col gap-4">
            {!place.website && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center md:text-left">
                Om du känner att informationen är otillräcklig, kan du söka
                vidare via webben – du hittar knappen "Sök på Google" här
                nedanför.
              </p>
            )}
            <div className="flex justify-between items-center">
              {place.website ? (
                <a
                  href={place.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#F97316] dark:text-gray-300 hover:text-[#C2410C] font-semibold text-sm underline"
                >
                  <img src={Link} alt="website icon" className="h-4 w-4" />
                  Besök webbplats
                </a>
              ) : (
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(
                    place.name + " " + city
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#F97316] dark:text-gray-300 hover:text-[#C2410C] font-semibold text-sm underline"
                >
                  <img
                    src={Link}
                    alt="google search icon"
                    className="h-4 w-4"
                  />
                  Sök på Google
                </a>
              )}

              <div className="w-auto h-[50px] flex items-center justify-center">
                <h1 className="text-base md:text-lg italic font-semibold text-gray-700 dark:text-gray-300">
                  Platsguiden
                  <span className="font-bold text-orange-500 text-2xl">.</span>
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GPS Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black z-50">
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center p-4 bg-white dark:bg-[#282828]">
              <h2 className="text-xl font-semibold truncate max-w-[80%]">
                GPS Navigering - {place.name}
              </h2>
              <button
                onClick={() => setShowMapModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 relative">
              <Map
                lat={place.lat}
                lon={place.lon}
                name={place.name}
                showUserPosition={isRouteActive} // Show user only when route is active
                routeCoordinates={routeCoordinates}
              />
              {/* Display Loading/Error State */}
              {isLoadingDirections && (
                <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-10">
                  <p className="text-white text-lg">Hämtar vägbeskrivning...</p>
                </div>
              )}
              {directionsError && (
                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md z-10">
                  <p>{directionsError}</p>
                </div>
              )}
            </div>
            {/* Bottom Panel: Initial State (Start) vs Active Route State */}
            <div className="p-4 pb-12 bg-white dark:bg-[#282828] border-t flex flex-col gap-4">
              {!isRouteActive ? (
                <>
                  {/* Start Route Button */}
                  <button
                    onClick={startRouteNavigation}
                    className="w-full py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition disabled:opacity-50"
                    disabled={isLoadingDirections} // Disable while loading
                  >
                    {isLoadingDirections ? "Laddar..." : "Starta Rutt"}
                  </button>
                </>
              ) : (
                <>
                  {/* Active Route Info & Deactivate Button */}
                  <p className="text-center text-lg font-medium">
                    Avstånd:{" "}
                    {currentDistance === null
                      ? "Beräknar..."
                      : currentDistance < 1000
                      ? `${Math.round(currentDistance)} meter`
                      : `${(currentDistance / 1000).toFixed(2)} kilometer`}
                  </p>
                  {/* Arrival Alert */}
                  {currentDistance !== null && currentDistance < 10 && (
                    <div
                      className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
                      role="alert"
                    >
                      <strong className="font-bold">
                        Du har nått din destination!
                      </strong>
                      <span className="block sm:inline">
                        {" "}
                        Du är nu framme vid {place.name}.
                      </span>
                      <button
                        className="mt-2 w-full py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition"
                        onClick={handleDeactivateGPS} // deactivate to reset state
                      >
                        Avsluta Rutt
                      </button>
                    </div>
                  )}
                  {/* Deactivate Button (when not arrived) */}
                  {currentDistance === null ||
                    (currentDistance >= 10 && (
                      <button
                        className="w-full py-2 bg-[#C53C07] text-white rounded font-semibold hover:bg-[#A33206] transition"
                        onClick={handleDeactivateGPS}
                      >
                        Avsluta Rutt
                      </button>
                    ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceDetails;
