import { useEffect, useState, useCallback } from "react";
import { Place, OverpassElement } from "../Interfaces";
import { useRef } from "react";
import { motion } from "framer-motion";
import { ClipLoader, PulseLoader } from "react-spinners";
import Map from "../components/Map";
import BarImage from "../assets/icons/bar.png";
import Phone from "../assets/icons/phone.png";
import Link from "../assets/icons/link.png";
import Location from "../assets/icons/location.png";
import Open from "../assets/icons/open.png";
import Refresh1 from "../assets/icons/refresh1.png";
import Refresh2 from "../assets/icons/refresh2.png";
import ArrowUp from "../assets/icons/arrowUp.png";
import ArrowDown from "../assets/icons/arrowDown.png";

const BarsNearby = () => {
  const [bars, setBars] = useState<Place[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Lägg till laddningstillstånd
  const [visibleCount, setVisibleCount] = useState(5);
  const [expandedIndex, setExpandedIndex] = useState<number>(-1);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);

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

          setBars(sortedPlaces);
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
    <div className="w-full p-5 flex flex-col gap-4 items-center mb-5 md:mt-5">
      <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:justify-between mb-2 w-full md:w-2/4 items-start md:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Barer i närheten</h1>
          <div className="flex gap-1.5 items-center">
            <em>Du befinner dig i </em>
            {bars.find((r) => r.city && r.city !== "Stad inte tillgänglig") ? (
              <p className="font-semibold">
                {
                  bars.find((r) => r.city && r.city !== "Stad inte tillgänglig")
                    ?.city
                }
              </p>
            ) : (
              <PulseLoader color="#F97316" loading={true} size={5} />
            )}
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm bg-[#FCF9F8] px-3 h-[40px] border border-gray-300 rounded font-semibold">
            <ClipLoader color="#F97316" loading={true} size={20} />
            <span className="text-sm text-gray-600">Hämtar position...</span>
          </div>
        ) : (
          <button
            onClick={getUserLocation}
            className="group flex items-center gap-2 text-sm bg-[#FCF9F8] text-black px-3 h-[40px] border border-gray-300 rounded hover:bg-[#FFF8F5] hover:text-[#C53C07] font-semibold transition"
          >
            <img
              src={Refresh1}
              alt="refresh"
              className="h-5 w-5 group-hover:hidden"
            />
            <img
              src={Refresh2}
              alt="refresh hover"
              className="h-5 w-5 hidden group-hover:block"
            />
            Uppdatera position
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="md:w-2/4 flex justify-center items-center h-[400px]">
          <ClipLoader color="#F97316" loading={isLoading} size={120} />
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="w-full md:w-2/4 flex flex-col gap-4 justify-center ">
          {bars.slice(0, visibleCount).map((bar, index) => {
            const isExpanded = index === expandedIndex;

            return (
              <motion.div
                key={index}
                ref={(el) => {
                  barRefs.current[index] = el;
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
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between">
                      <div className="flex gap-2 ">
                        <div className="h-[25px] w-[25px]">
                          <img
                            className="w-full h-full object-cover"
                            src={BarImage}
                            alt="icon"
                          />
                        </div>
                        <div className="flex flex-col">
                          <p className="text-lg font-semibold leading-5">
                            {bar.name}
                          </p>
                          <p className="text-sm text-gray-500">Restaurant</p>
                        </div>
                      </div>
                      <div className="bg-[#FFF8F5]">
                        <p className="text-[#C53C07] font-semibold p-2 rounded-lg">
                          {bar.distance < 1
                            ? `${Math.round(bar.distance * 1000)} m`
                            : `${bar.distance.toFixed(2)} km`}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      {bar.address ? (
                        <div className="flex gap-1 items-center pl-1">
                          <div className="h-[18px] w-[18px]">
                            <img
                              className="w-full h-full object-cover"
                              src={Location}
                              alt="icon"
                            />
                          </div>
                          <p className="text-sm text-gray-500">{bar.address}</p>
                        </div>
                      ) : (
                        <div></div>
                      )}
                      {expandedIndex === index ? (
                        <span className="text-xl">
                          {" "}
                          <img
                            src={ArrowUp}
                            alt="refresh"
                            className="h-4 w-4"
                          />
                        </span>
                      ) : (
                        <span className="text-xl">
                          {" "}
                          <img
                            src={ArrowDown}
                            alt="refresh"
                            className="h-4 w-4"
                          />
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="h-auto flex flex-col gap-5 border-t-2 border-gray-200">
                    <div className="h-[350px] mt-5">
                      <Map lat={bar.lat} lon={bar.lon} name={bar.name} />
                    </div>

                    <div className="flex flex-col gap-8 md:gap-0 md:flex-row md:justify-between md:items-center">
                      <div className="flex flex-col gap-5 p-2 w-full ">
                        <div className="flex flex-col gap-2">
                          {bar.cuisine && (
                            <div className="flex gap-2">
                              <img
                                src={BarImage}
                                alt="link icon"
                                className="h-6 w-6"
                              />
                              {(bar.cuisine ?? "")
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

                          {bar.phone && (
                            <div className="flex gap-2 items-center">
                              <img
                                src={Phone}
                                alt="link icon"
                                className="h-5 w-5"
                              />
                              <p>{bar.phone}</p>
                            </div>
                          )}
                        </div>

                        {bar.openingHours && (
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
                              {bar.openingHours.split(";").map((hour, i) => (
                                <li key={i}>{hour.trim()}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex justify-between p-1">
                          {bar.website ? (
                            <a
                              href={bar.website}
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
                                bar.name
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
                            <button>Visa min position</button>
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

      {!isLoading && bars.length > 5 && visibleCount < 15 && (
        <button
          className="mt-4 px-4 py-2 bg-[#FCF9F8] border border-gray-300 font-semibold rounded hover:bg-[#FFF8F5] hover:text-[#C53C07]"
          onClick={() => setVisibleCount(Math.min(visibleCount + 5, 15))}
        >
          Visa mer
        </button>
      )}

      {!isLoading && visibleCount === 15 && (
        <button
          className="mt-4 px-4 py-2 border border-orange-500 text-[#C2410C] hover:text-[#9A2A06] rounded font-semibold"
          onClick={() => setVisibleCount(visibleCount === 15 ? 5 : 10)}
        >
          {visibleCount === 15 ? "Visa mindre" : "Visa mer"}
        </button>
      )}
    </div>
  );
};

export default BarsNearby;
