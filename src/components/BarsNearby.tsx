import { useEffect, useState } from "react";
import { Place, OverpassElement } from "../Interfaces";
import { useRef } from "react";
import { motion } from "framer-motion";
import Map from "../components/Map";
import BarImage from "../assets/defaultImage/bar.jpg";

const BarsNearby = () => {
  const [bars, setBars] = useState<Place[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Lägg till laddningstillstånd
  const [visibleCount, setVisibleCount] = useState(5);
  const [expandedIndex, setExpandedIndex] = useState<number>(-1);

  const barRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const getUserLocation = async () => {
      if (!navigator.geolocation) {
        setError("Geolocation stöds inte i denna webbläsare.");
        setIsLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLat = position.coords.latitude;
          const userLon = position.coords.longitude;
          setIsLoading(true);

          const overpassQuery = `
            [out:json];
            (
              node["amenity"="bar"](around:5000,${userLat},${userLon});
              way["amenity"="bar"](around:5000,${userLat},${userLon});
              relation["amenity"="bar"](around:5000,${userLat},${userLon});
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
                const lat = item.lat || item.center?.lat || 0;
                const lon = item.lon || item.center?.lon || 0;
                const address = item.tags?.["addr:street"]
                  ? `${item.tags["addr:street"]}, ${item.tags["addr:city"]}`
                  : undefined;

                return {
                  name: item.tags?.name || "Okänd bar",
                  lat,
                  lon,
                  distance: getDistance(userLat, userLon, lat, lon),
                  address,
                  phone: item.tags?.["contact:phone"],
                  website: item.tags?.website,
                  cuisine: item.tags?.cuisine,
                  openingHours: item.tags?.opening_hours,
                  city: item.tags?.["addr:city"] || "Bar inte tillgänglig",
                };
              });

            const sortedPlaces = places.sort(
              (a: Place, b: Place) => a.distance - b.distance
            );

            setBars(sortedPlaces);
            setIsLoading(false);
          } catch {
            setError("Något gick fel vid hämtning av barer.");
            setIsLoading(false);
          }
        },
        (error) => {
          setError(`Geolocation error: ${error.message}`);
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true, // Förbättrar noggrannheten
          timeout: 10000, // Timeout om positionen inte kan hämtas inom 10 sekunder
          maximumAge: 0, // Ingen cachning av tidigare positioner
        }
      );
    };

    getUserLocation();
  }, []);

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
    return R * c;
  }

  return (
    <div className="w-full p-5 flex flex-col gap-4 items-center">
      <div className="flex flex-col mb-2  w-full md:w-2/4">
        <h1 className="text-3xl font-bold">Barer i närheten</h1>
        <em>
          Du befinner dig i{" "}
          {bars.find((r) => r.city && r.city !== "Bar inte tillgänglig")
            ?.city || "Laddar.."}
        </em>
      </div>

      {isLoading ? (
        <p>Laddar barer...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="w-full md:w-2/4 flex flex-col gap-4 justify-center ">
          {bars.slice(0, visibleCount).map((bar, index) => {
            const isExpanded = index === expandedIndex;

            return (
              <motion.div
                whileHover={
                  expandedIndex !== index
                    ? { backgroundColor: "#4b5563" } // Tailwind: bg-gray-700
                    : {}
                }
                key={index}
                ref={(el) => {
                  barRefs.current[index] = el;
                }}
                initial={{ opacity: 0, x: -70 }} // Startar från vänster med låg opacitet
                animate={{ opacity: 1, x: 0 }} // Animerar till full opacitet och rätt position
                exit={{ opacity: 0, x: 100 }} // När elementet tas bort, gå åt höger och bli osynligt
                transition={{
                  backgroundColor: { duration: 0.05, ease: "easeOut" },
                  duration: 0.4, // Tidsinställning för animeringen
                  delay: index * 0.1, // Fördröjning för att få varje div att komma i tur och ordning
                }}
                className="bg-gray-800 w-full flex flex-col gap-5 p-3 md:p-5 shadow-md transition-all duration-500 text-white"
              >
                <div
                  onClick={() => {
                    setExpandedIndex(index === expandedIndex ? -1 : index);

                    setTimeout(() => {
                      const element = barRefs.current[index];

                      if (element) {
                        const rect = element.getBoundingClientRect();
                        const offset = 50;

                        window.scrollTo({
                          top: window.scrollY + rect.top - offset,
                          behavior: "smooth",
                        });
                      }
                    }, 100);
                  }}
                  className={`${
                    expandedIndex !== index ? "cursor-pointer" : ""
                  }`}
                >
                  <div className="flex justify-between">
                    <div className="flex flex-col gap-2">
                      <p className="text-2xl font-semibold">{bar.name}</p>
                      <p className="text-gray-300 font-semibold text-lg">
                        Du är ungefär {bar.distance.toFixed(2)} km bort
                      </p>
                    </div>
                    {expandedIndex === index ? (
                      <span className="text-xl">▼</span>
                    ) : (
                      <span className="text-xl">▶</span>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="h-auto flex flex-col gap-5">
                    <div className="h-[350px]">
                      <Map lat={bar.lat} lon={bar.lon} name={bar.name} />
                    </div>

                    <div className="flex flex-col gap-8 md:gap-0 md:flex-row md:justify-between md:items-center">
                      <div className="flex flex-col gap-5 p-2">
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <p className="font-semibold">Adress:</p>
                            <p>{bar.address || "Information saknas"}</p>
                          </div>
                          <div className="flex gap-2">
                            <p className="font-semibold">Telefon:</p>
                            <p>{bar.phone || "Information saknas"}</p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <p className="font-semibold">Webbplats:</p>
                          {bar.website ? (
                            <a
                              href={bar.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 underline"
                            >
                              Besök webbplats
                            </a>
                          ) : (
                            <a
                              href={`https://www.google.com/search?q=${encodeURIComponent(
                                bar.name
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 underline"
                            >
                              Sök på webben
                            </a>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          <p className="font-semibold">Öppettider:</p>
                          {bar.openingHours ? (
                            <ul className="list-disc pl-5">
                              {bar.openingHours.split(";").map((hour, i) => (
                                <li key={i}>{hour.trim()}</li>
                              ))}
                            </ul>
                          ) : (
                            "Information saknas"
                          )}
                        </div>
                      </div>

                      <div className="h-[150px] w-[250px] flex flex-col gap-2 items-center justify-center pl-1 md:pr-5 mb-6 mt-2">
                        <img
                          className="w-full h-full object-cover rounded-2xl shadow-md"
                          src={BarImage}
                          alt="img"
                        />
                        <em className="text-sm text-gray-400">
                          Note: Picture is AI generated and has nothing to do
                          with the restaurant.
                        </em>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {bars.length > 5 && // Visa knappen endast om det finns fler än 5 barer
        (visibleCount < 15 ? (
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setVisibleCount(Math.min(visibleCount + 5, 15))}
          >
            Visa mer
          </button>
        ) : (
          <button
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={() => setVisibleCount(visibleCount === 15 ? 5 : 10)}
          >
            {visibleCount === 15 ? "Visa mindre" : "Visa mer"}
          </button>
        ))}
    </div>
  );
};

export default BarsNearby;
