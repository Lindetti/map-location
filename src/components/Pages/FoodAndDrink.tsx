import { useEffect, useState, useCallback, useRef } from "react";
import {
  Place,
  OverpassElement,
  PlaceType,
  iconMapping,
} from "../../Interfaces";
import { useCity } from "../../context/CityContext";
import { motion } from "framer-motion";
import { ClipLoader } from "react-spinners";
import Header from "../Layout/Header";
import PlaceCard from "../Place/PlaceCard";
import PlaceDetails from "../Place/PlaceDetails";
import LoadMoreButtons from "../Place/LoadMoreButton";
import AutoLocationUpdater from "../AutoLocationUpdater";

const FoodAndDrink = () => {
  const [foodAndDrink, setFoodAndDrink] = useState<Place[]>([]);
  const { city, setCity } = useCity();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [visibleCount, setVisibleCount] = useState(5);
  const [expandedIndex, setExpandedIndex] = useState<number>(-1);
  const restaurantRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [selectedType, setSelectedType] = useState<PlaceType>("restaurant");
  const [isPositionFixed, setIsPositionFixed] = useState(false);
  const positionWatchId = useRef<number | null>(null);
  const placeOptions: {
    label: string;
    singularLabel: string;
    value: PlaceType;
  }[] = [
    {
      label: "Restauranger",
      singularLabel: "Restaurang",
      value: "restaurant",
    },
    { label: "Snabbmat", singularLabel: "Snabbmat", value: "fast_food" },
    {
      label: "Mat & Livsmedel",
      singularLabel: "Livsmedelsbutik",
      value: "supermarket",
    },
    {
      label: "Kiosker",
      singularLabel: "Kiosk",
      value: "kiosk",
    },
    { label: "Caféer", singularLabel: "Café", value: "cafe" },
    { label: "Barer", singularLabel: "Bar", value: "bar" },
  ];

  const getUserLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError("Geolocation stöds inte i denna webbläsare.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setFoodAndDrink([]);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        const overpassQuery = `
        [out:json];
        (
          // Om selectedType är 'supermarket', inkludera endast supermarket
          ${
            selectedType === "supermarket"
              ? `
              node["shop"="supermarket"](around:5000,${userLat},${userLon});
              way["shop"="supermarket"](around:5000,${userLat},${userLon});
              relation["shop"="supermarket"](around:5000,${userLat},${userLon});
              `
              : ""
          }
      
          // Om selectedType är 'kiosk', inkludera endast kiosk
          ${
            selectedType === "kiosk"
              ? `
              node["shop"="kiosk"](around:5000,${userLat},${userLon});
              way["shop"="kiosk"](around:5000,${userLat},${userLon});
              relation["shop"="kiosk"](around:5000,${userLat},${userLon});
              `
              : ""
          }
      
          // För alla andra val, inkludera baserat på 'amenity'
          ${
            selectedType !== "supermarket" && selectedType !== "kiosk"
              ? `
              node["amenity"="${selectedType}"](around:5000,${userLat},${userLon});
              way["amenity"="${selectedType}"](around:5000,${userLat},${userLon});
              relation["amenity"="${selectedType}"](around:5000,${userLat},${userLon});
              `
              : ""
          }
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
                phone: item.tags?.phone,
                website: item.tags?.website,
                cuisine: item.tags?.cuisine,
                openingHours: item.tags?.opening_hours,
                city: item.tags?.["addr:city"] || "Stad inte tillgänglig",
              };
            });

          const filteredPlaces = places.filter((p) => p.distance < 10);

          const sortedPlaces = filteredPlaces.sort(
            (a: Place, b: Place) => a.distance - b.distance
          );

          setFoodAndDrink(sortedPlaces);

          if (!city) {
            const firstValidCity = sortedPlaces.find(
              (p) => p.city && p.city !== "Stad inte tillgänglig"
            )?.city;
            if (firstValidCity) {
              setCity(firstValidCity);
            }
          }
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
  }, [selectedType, city, setCity]);

  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const selectedTypeLabel =
    placeOptions.find((p) => p.value === selectedType)?.singularLabel ||
    "plats";

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

  const calculateWalkingTime = (distance: number): number => {
    const walkingSpeed = 5; // km/h
    const timeInHours = distance / walkingSpeed;
    const timeInMinutes = Math.round(timeInHours * 60);
    return timeInMinutes;
  };

  const handlePositionUpdate = useCallback(
    (position: GeolocationPosition) => {
      if (!isPositionFixed) return;

      const userLat = position.coords.latitude;
      const userLon = position.coords.longitude;

      setFoodAndDrink((prevPlaces) =>
        prevPlaces.map((place) => ({
          ...place,
          distance: getDistance(userLat, userLon, place.lat, place.lon),
        }))
      );
    },
    [isPositionFixed]
  );

  useEffect(() => {
    if (isPositionFixed) {
      positionWatchId.current = navigator.geolocation.watchPosition(
        handlePositionUpdate,
        (error) => console.error("Error watching position:", error),
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else if (positionWatchId.current !== null) {
      navigator.geolocation.clearWatch(positionWatchId.current);
      positionWatchId.current = null;
    }

    return () => {
      if (positionWatchId.current !== null) {
        navigator.geolocation.clearWatch(positionWatchId.current);
      }
    };
  }, [isPositionFixed, handlePositionUpdate]);

  const handleExpand = (index: number) => {
    if (index !== expandedIndex) {
      setIsPositionFixed(false);
    }

    setExpandedIndex(index === expandedIndex ? -1 : index);

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
  };

  return (
    <div className="w-full p-5 flex flex-col gap-4 items-center mb-5 md:mt-2 min-h-[calc(100vh-280px)]">
      {!error && (
        <Header
          city={city ?? undefined}
          isLoading={isLoading}
          onRefresh={getUserLocation}
          placeType={
            placeOptions.find((opt) => opt.value === selectedType)?.label || ""
          }
          placeOptions={placeOptions}
          selectedType={selectedType}
          onTypeChange={(val) => setSelectedType(val as PlaceType)}
          showTypeSelect={true}
        />
      )}

      {!isPositionFixed && (
        <AutoLocationUpdater onLocationUpdate={getUserLocation} />
      )}

      {isLoading ? (
        <div className="md:w-2/4 flex flex-col gap-4 justify-center items-center h-[500px]">
          <p className="dark:text-gray-200">Hämtar din position..</p>
          <ClipLoader color="#F97316" loading={isLoading} size={120} />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center text-center gap-4 mt-10 max-w-md mx-auto px-4">
          <p className="text-red-500 font-semibold">{error}</p>
        </div>
      ) : foodAndDrink.length === 0 ? (
        <div className="flex flex-col items-center text-center gap-4 mt-10 max-w-md mx-auto px-4">
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            Inga träffar på {selectedTypeLabel.toLowerCase()} hittades i
            närheten av din nuvarande position.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-200">
            Prova att uppdatera din plats eller försök igen senare.
          </p>
        </div>
      ) : (
        <div className="w-full lg:w-2/4 flex flex-col gap-4 justify-center ">
          {foodAndDrink.slice(0, visibleCount).map((foodplace, index) => {
            const isExpanded = index === expandedIndex;

            return (
              <motion.div
                key={index}
                ref={(el) => {
                  restaurantRefs.current[index] = el;
                }}
                initial={{ opacity: 0, x: -70 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0.5, x: 100 }} 
                transition={{
                  duration: 0.1, 
                  delay: index * 0.1, 
                }}
                className={`
                  bg-white text-black dark:bg-[#282828] dark:text-gray-200 w-full flex flex-col gap-5 p-3 md:p-5 rounded-md shadow-sm
                  border transition-all duration-300
                  ${
                    expandedIndex === index
                      ? "border-[1.5px] border-orange-500 dark:border-gray-400"
                      : "border border-gray-300 dark:border-[#ffffff20] dark:hover:border-gray-400 hover:border-orange-500"
                  }
                `}
              >
                <PlaceCard
                  place={foodplace}
                  isExpanded={expandedIndex === index}
                  icon={iconMapping[selectedType]}
                  typeLabel={
                    placeOptions.find((opt) => opt.value === selectedType)
                      ?.singularLabel || "Restaurang"
                  }
                  walkingTime={calculateWalkingTime(foodplace.distance)}
                  onClick={() => handleExpand(index)}
                />

                {isExpanded && (
                  <PlaceDetails
                    place={foodplace}
                    icon={iconMapping[selectedType]}
                    city={city ?? undefined}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {foodAndDrink.length > 5 && (
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

      {foodAndDrink.length > 0 && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
          Observera: Viss information kan vara inaktuell. Vissa platser kan ha
          stängt permanent, flyttat eller förändrats utan att det ännu har
          uppdaterats i tjänsten.
        </p>
      )}
    </div>
  );
};

export default FoodAndDrink;
