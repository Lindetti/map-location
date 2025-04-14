import { useEffect, useState, useCallback } from "react";
import { Place, OverpassElement } from "../../Interfaces";
import { useRef } from "react";
import { motion } from "framer-motion";
import { ClipLoader } from "react-spinners";
import RestaurantIcon from "../../assets/icons/restaurant.png";
import Header from "../Layout/Header";
import PlaceCard from "../Place/PlaceCard";
import PlaceDetails from "../Place/PlaceDetails";
import LoadMoreButtons from "../Place/LoadMoreButton";

const Tourism = () => {
  const [tourism, setTourism] = useState<Place[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [visibleCount, setVisibleCount] = useState(5);
  const [expandedIndex, setExpandedIndex] = useState<number>(-1);
  const restaurantRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [showUserPosition, setShowUserPosition] = useState(false);
  const [showPolyline, setShowPolyline] = useState(false);

  const getUserLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError("Geolocation stöds inte i denna webbläsare.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        const overpassQuery = `
        [out:json];
        (
          node["shop"="supermarket"](around:5000,${userLat},${userLon});
          way["shop"="supermarket"](around:5000,${userLat},${userLon});
          relation["shop"="supermarket"](around:5000,${userLat},${userLon});
        );
        out body;
        >;
        out skel qt;
      `;

        try {
          const response = await fetch(
            "https://overpass-api.de/api/interpreter",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: `data=${encodeURIComponent(overpassQuery)}`,
            }
          );

          if (!response.ok)
            throw new Error("Kunde inte hämta data från Overpass API");

          const data = await response.json();
          console.log(data);

          const places: Place[] = data.elements
            .filter((item: OverpassElement) => item.tags?.name)
            .map((item: OverpassElement) => {
              const lat = item.lat || item.center?.lat || 0;
              const lon = item.lon || item.center?.lon || 0;
              const address = item.tags?.["addr:street"]
                ? `${item.tags["addr:street"]}, ${item.tags["addr:city"]}`
                : undefined;

              return {
                name: item.tags?.name || "Okänd restaurang",
                lat,
                lon,
                distance: getDistance(userLat, userLon, lat, lon),
                address,
                phone: item.tags?.["contact:phone"],
                website: item.tags?.website,
                cuisine: item.tags?.cuisine,
                openingHours: item.tags?.opening_hours,
                city: item.tags?.["addr:city"] || "Stad inte tillgänglig",
              };
            });

          const sortedPlaces = places.sort(
            (a: Place, b: Place) => a.distance - b.distance
          );

          setTourism(sortedPlaces);
        } catch {
          setError("Något gick fel vid hämtning av restauranger.");
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        setError(`Geolocation error: ${error.message}`);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  const handleShowUserPosition = () => {
    setShowUserPosition(true);
    setShowPolyline(true);
  };

  function getDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Returnera avståndet i km

    return distance;
  }

  const city = tourism.find(
    (r) => r.city && r.city !== "Stad inte tillgänglig"
  )?.city;

  return (
    <div className="w-full p-5 flex flex-col gap-4 items-center mb-5 md:mt-5">
      <Header
        city={city} // Tar första restaurangens stad (om det finns någon)
        isLoading={isLoading}
        onRefresh={getUserLocation}
        placeType="Mataffärer"
      />

      {isLoading ? (
        <div className="md:w-2/4 flex justify-center items-center h-[400px]">
          <ClipLoader color="#F97316" loading={isLoading} size={120} />
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="w-full md:w-2/4 flex flex-col gap-4 justify-center ">
          {tourism.slice(0, visibleCount).map((explore, index) => {
            const isExpanded = index === expandedIndex;

            return (
              <motion.div
                key={index}
                ref={(el) => {
                  restaurantRefs.current[index] = el;
                }}
                initial={{ opacity: 0, x: -70 }} // Startar från vänster med låg opacitet
                animate={{ opacity: 1, x: 0 }} // Animerar till full opacitet och rätt position
                exit={{ opacity: 0.5, x: 100 }} // När elementet tas bort, gå åt höger och bli osynligt
                transition={{
                  duration: 0.1, // Tidsinställning för animeringen
                  delay: index * 0.1, // Fördröjning för att få varje div att komma i tur och ordning
                }}
                className={`
                  bg-white w-full flex flex-col gap-5 p-3 md:p-5 text-black rounded-md shadow-sm
                  border transition-all duration-300
                  ${
                    expandedIndex === index
                      ? "border-[1.5px] border-orange-500"
                      : "border border-gray-300 hover:border-orange-500"
                  }
                `}
              >
                <PlaceCard
                  place={explore}
                  isExpanded={expandedIndex === index}
                  icon={RestaurantIcon}
                  typeLabel="Livsmedelsbutik"
                  onClick={() => {
                    setExpandedIndex(index === expandedIndex ? -1 : index);
                    setShowUserPosition(false);
                    setShowPolyline(false);

                    setTimeout(() => {
                      const element = restaurantRefs.current[index];
                      const offset = 50;

                      if (element) {
                        const rect = element.getBoundingClientRect();
                        window.scrollTo({
                          top: window.scrollY + rect.top - offset,
                          behavior: "smooth",
                        });
                      }
                    }, 100);
                  }}
                />

                {isExpanded && (
                  <PlaceDetails
                    place={explore}
                    icon={RestaurantIcon}
                    onShowUserPosition={handleShowUserPosition}
                    showUserPosition={showUserPosition}
                    showPolyline={showPolyline}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <LoadMoreButtons
        isLoading={isLoading}
        visibleCount={visibleCount}
        onClick={() =>
          setVisibleCount(
            visibleCount === 15 ? 5 : Math.min(visibleCount + 5, 15)
          )
        }
      />
    </div>
  );
};

export default Tourism;
