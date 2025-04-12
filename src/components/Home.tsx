import { useEffect, useState } from "react";
import { Place, OverpassElement } from "../Interfaces";
import { useRef } from "react";
import { motion } from "framer-motion";
import { ClipLoader } from "react-spinners";
import Map from "../components/Map";
import Restaurant from "../assets/icons/restaurant.png";
import Phone from "../assets/icons/phone.png";
import Link from "../assets/icons/link.png";
import Location from "../assets/icons/location.png";
import Open from "../assets/icons/open.png";

const Home = () => {
  const [restaurants, setRestaurants] = useState<Place[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Lägg till laddningstillstånd
  const [visibleCount, setVisibleCount] = useState(5);
  const [expandedIndex, setExpandedIndex] = useState<number>(-1);
  const [centerOnUserFlags, setCenterOnUserFlags] = useState<boolean[]>([]);

  const restaurantRefs = useRef<(HTMLDivElement | null)[]>([]);

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
              node["amenity"="restaurant"](around:5000,${userLat},${userLon});
              way["amenity"="restaurant"](around:5000,${userLat},${userLon});
              relation["amenity"="restaurant"](around:5000,${userLat},${userLon});
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

            setRestaurants(sortedPlaces);
            setIsLoading(false);
          } catch {
            setError("Något gick fel vid hämtning av restauranger.");
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
    const distance = R * c; // Returnera avståndet i km

    return distance;
  }

  return (
    <div className="w-full p-5 flex flex-col gap-4 items-center">
      <div className="flex flex-col mb-2  w-full md:w-2/4">
        <h1 className="text-3xl font-bold">Restauranger i närheten</h1>
        <em>
          Du befinner dig i{" "}
          {restaurants.find((r) => r.city && r.city !== "Stad inte tillgänglig")
            ?.city || "Laddar.."}
        </em>
      </div>

      {isLoading ? (
        <div className="md:w-2/4 flex justify-center items-center h-[400px]">
          <ClipLoader color="#F97316" loading={isLoading} size={120} />
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="w-full md:w-2/4 flex flex-col gap-4 justify-center ">
          {restaurants.slice(0, visibleCount).map((restaurant, index) => {
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
                  bg-white w-full flex flex-col gap-5 p-3 md:p-5 text-black rounded-md
                  border transition-all duration-300
                  ${
                    expandedIndex === index
                      ? "border-[2px] border-orange-500"
                      : "border border-gray-300 hover:border-orange-500"
                  }
                `}
              >
                <div
                  onClick={() => {
                    setExpandedIndex(index === expandedIndex ? -1 : index);

                    setTimeout(() => {
                      const element = restaurantRefs.current[index];

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
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between">
                      <div className="flex gap-2 items-center">
                        <div className="h-[28px] w-[28px]">
                          <img
                            className="w-full h-full object-cover"
                            src={Restaurant}
                            alt="icon"
                          />
                        </div>
                        <div className="flex flex-col">
                          <p className="text-lg font-semibold leading-5">
                            {restaurant.name}
                          </p>
                          <p className="text-sm text-gray-500">Restaurant</p>
                        </div>
                      </div>
                      <div className="bg-[#FFF8F5]">
                        <p className="text-[#C53C07] font-semibold p-2 rounded-lg">
                          {restaurant.distance.toFixed(2)} km
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      {restaurant.address ? (
                        <div className="flex gap-1 items-center">
                          <div className="h-[20px] w-[20px]">
                            <img
                              className="w-full h-full object-cover"
                              src={Location}
                              alt="icon"
                            />
                          </div>
                          <p className="text-sm text-gray-500">
                            {restaurant.address}
                          </p>
                        </div>
                      ) : (
                        <div></div>
                      )}
                      {expandedIndex === index ? (
                        <span className="text-xl">▼</span>
                      ) : (
                        <span className="text-xl">▶</span>
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="h-auto flex flex-col gap-5 border-t-2 border-gray-200">
                    <div className="h-[350px] mt-5">
                      <Map
                        lat={restaurant.lat}
                        lon={restaurant.lon}
                        name={restaurant.name}
                      />
                    </div>

                    <div className="flex flex-col gap-8 md:gap-0 md:flex-row md:justify-between md:items-center">
                      <div className="flex flex-col gap-5 p-2 w-full ">
                        <div className="flex flex-col gap-2">
                          {restaurant.cuisine && (
                            <div className="flex gap-2">
                              <img
                                src={Restaurant}
                                alt="link icon"
                                className="h-6 w-6"
                              />
                              {(restaurant.cuisine ?? "")
                                .split(";")
                                .slice(0, 3)
                                .map(
                                  (cuisine) =>
                                    cuisine.trim().charAt(0).toUpperCase() +
                                    cuisine.trim().slice(1)
                                )
                                .join(", ")}
                            </div>
                          )}

                          {restaurant.phone && (
                            <div className="flex gap-2 items-center">
                              <img
                                src={Phone}
                                alt="link icon"
                                className="h-5 w-5"
                              />
                              <p>{restaurant.phone}</p>
                            </div>
                          )}
                        </div>

                        {restaurant.openingHours && (
                          <div className="flex flex-col gap-1">
                            <div className="flex gap-2 items-center">
                              <img
                                src={Open}
                                alt="link icon"
                                className="h-5 w-5"
                              />
                              <p>Öppettider:</p>
                            </div>
                            <ul className="list-none pl-1 text-gray-500">
                              {restaurant.openingHours
                                .split(";")
                                .map((hour, i) => (
                                  <li key={i}>{hour.trim()}</li>
                                ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex justify-between p-1">
                          {restaurant.website ? (
                            <a
                              href={restaurant.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-[#F97316] hover:text-[#C2410C] font-semibold text-sm"
                            >
                              <img
                                src={Link}
                                alt="link icon"
                                className="h-4 w-4"
                              />
                              Besök webbplats
                            </a>
                          ) : (
                            <a
                              href={`https://www.google.com/search?q=${encodeURIComponent(
                                restaurant.name
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-[#F97316] hover:text-[#C2410C] font-semibold text-sm"
                            >
                              <img
                                src={Link}
                                alt="link icon"
                                className="h-4 w-4"
                              />
                              Sök på webben
                            </a>
                          )}
                          <div className="">
                            <button
                              onClick={() => {
                                const updatedFlags = [...centerOnUserFlags];
                                updatedFlags[index] = !updatedFlags[index];
                                setCenterOnUserFlags(updatedFlags);
                              }}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Visa min position
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {!isLoading && visibleCount < 15 && (
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => setVisibleCount(Math.min(visibleCount + 5, 15))}
        >
          Visa mer
        </button>
      )}

      {!isLoading && visibleCount === 15 && (
        <button
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={() => setVisibleCount(visibleCount === 15 ? 5 : 10)}
        >
          {visibleCount === 15 ? "Visa mindre" : "Visa mer"}
        </button>
      )}
    </div>
  );
};

export default Home;
