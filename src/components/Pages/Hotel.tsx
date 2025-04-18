import { useEffect, useState, useCallback } from "react";
import { useCity } from "../../CityContext";
import { Place, OverpassElement } from "../../Interfaces";
import { useRef } from "react";
import { motion } from "framer-motion";
import { ClipLoader } from "react-spinners";
import HotelIcon from "../../assets/icons/hotel.png";
import Header from "../Layout/Header";
import PlaceCard from "../Place/PlaceCard";
import PlaceDetails from "../Place/PlaceDetails";
import LoadMoreButtons from "../Place/LoadMoreButton";

const Hotel = () => {
  const [hotels, setHotels] = useState<Place[]>([]);
  const { city } = useCity(); // Hämta staden från Context
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Lägg till laddningstillstånd
  const [visibleCount, setVisibleCount] = useState(5);
  const [expandedIndex, setExpandedIndex] = useState<number>(-1);
  const hotelRefs = useRef<(HTMLDivElement | null)[]>([]);
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
          node["tourism"="hotel"](around:5000,${userLat},${userLon});
          way["tourism"="hotel"](around:5000,${userLat},${userLon});
          relation["tourism"="hotel"](around:5000,${userLat},${userLon});
          node["tourism"="hostel"](around:5000,${userLat},${userLon});
          way["tourism"="hostel"](around:5000,${userLat},${userLon});
          relation["tourism"="hostel"](around:5000,${userLat},${userLon});
        );
        out center;
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

          const places: Place[] = data.elements
            .filter((item: OverpassElement) => item.tags?.name)
            .map((item: OverpassElement) => {
              const lat = item.lat ?? item.center?.lat;
              const lon = item.lon ?? item.center?.lon;

              if (lat === undefined || lon === undefined) return null;

              const address = item.tags?.["addr:street"]
                ? `${item.tags["addr:street"]}, ${item.tags["addr:city"]}`
                : "";

              return {
                name: item.tags?.name || "Okänd restaurang",
                lat,
                lon,
                distance: getDistance(userLat, userLon, lat, lon),
                address,
                phone: item.tags?.["contact:phone"],
                operator: item.tags?.operator,
                brand: item.tags?.brand,
                levels: item.tags?.["building:levels"],
                website: item.tags?.website,
                cuisine: item.tags?.cuisine,
                openingHours: item.tags?.opening_hours,
                city: item.tags?.["addr:city"] || "Stad inte tillgänglig",
                typeLabel: getPlaceTypeLabel(item.tags),
              };
            });

          // Filtrera bort resultat som är för långt bort (t.ex. default-koordinater)
          const filteredPlaces = places.filter((p) => p.distance < 5);

          const sortedPlaces = filteredPlaces.sort(
            (a: Place, b: Place) => a.distance - b.distance
          );

          setHotels(sortedPlaces);
        } catch {
          setError(
            "Något gick fel vid hämtning, prova uppdatera din position."
          );
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError(
              "Du har nekat åtkomst till platsen. Tillåt platsåtkomst i webbläsarens inställningar för att använda Platsguiden."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            setError(
              "Platsinformation är inte tillgänglig just nu. Kontrollera din internetanslutning eller försök igen senare."
            );
            break;
          case error.TIMEOUT:
            setError(
              "Det tog för lång tid att hämta din plats. Försök igen eller kontrollera dina inställningar."
            );
            break;
          default:
            setError(
              "Ett okänt fel inträffade vid hämtning av plats. Prova uppdatera din position."
            );
        }
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

  function getPlaceTypeLabel(tags: Record<string, string> | undefined): string {
    if (!tags) return "Okänd plats";

    const tourismType = tags["tourism"];
    switch (tourismType) {
      case "hotel":
        return "Hotell";
      case "hostel":
        return "Vandrarhem";
      default:
        return "Boende";
    }
  }

  return (
    <div className="w-full p-5 flex flex-col gap-4 items-center mb-5 md:mt-2">
      <Header
        city={city ?? undefined}
        onRefresh={getUserLocation}
        placeType="Boenden"
        showTypeSelect={false}
        isLoading={isLoading}
      />

      {isLoading ? (
        <div className="md:w-2/4 flex justify-center items-center h-[400px]">
          <ClipLoader color="#F97316" loading={isLoading} size={120} />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center text-center gap-4 mt-10 max-w-md mx-auto px-4">
          <p className="text-red-500 font-semibold">{error}</p>
        </div>
      ) : hotels.length === 0 ? (
        <div className="flex flex-col items-center text-center gap-4 mt-10 max-w-md mx-auto px-4">
          <p className="text-gray-600 font-medium">
            Inga boenden hittades i närheten av din nuvarande position.
          </p>
          <p className="text-sm text-gray-500">
            Prova att uppdatera din plats eller försök igen senare.
          </p>
        </div>
      ) : (
        <div className="w-full md:w-2/4 flex flex-col gap-4 justify-center ">
          {hotels.slice(0, visibleCount).map((hotels, index) => {
            const isExpanded = index === expandedIndex;

            return (
              <motion.div
                key={index}
                ref={(el) => {
                  hotelRefs.current[index] = el;
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
                  place={hotels}
                  isExpanded={expandedIndex === index}
                  icon={HotelIcon}
                  typeLabel={hotels.typeLabel}
                  onClick={() => {
                    setExpandedIndex(index === expandedIndex ? -1 : index);
                    setShowUserPosition(false);
                    setShowPolyline(false);

                    setTimeout(() => {
                      const element = hotelRefs.current[index];
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
                    place={hotels}
                    icon={HotelIcon}
                    onShowUserPosition={handleShowUserPosition}
                    showUserPosition={showUserPosition}
                    showPolyline={showPolyline}
                    city={city ?? undefined}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {hotels.length > 0 && (
        <LoadMoreButtons
          isLoading={isLoading}
          visibleCount={visibleCount}
          onClick={() =>
            setVisibleCount(
              visibleCount === 15 ? 5 : Math.min(visibleCount + 5, 15)
            )
          }
        />
      )}
    </div>
  );
};

export default Hotel;
