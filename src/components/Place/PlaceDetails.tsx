import Map from "../Map";
import { PlaceDetailsProps } from "../../Interfaces";
import Phone from "../../assets/icons/phone.png";
import Link from "../../assets/icons/link.png";
import Open from "../../assets/icons/open.png";
import { useState, useEffect } from "react";

const PlaceDetails = ({
  place,
  onShowUserPosition,
  showUserPosition,
  showPolyline,
  icon,
  city,
}: PlaceDetailsProps) => {
  const [showMapModal, setShowMapModal] = useState(false);
  const [currentDistance, setCurrentDistance] = useState<number>(
    place.distance * 1000
  );
  const [watchId, setWatchId] = useState<number | null>(null);

  const getDistanceInMeters = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3; // Earth's radius in meters
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

  useEffect(() => {
    if (showMapModal) {
      // Start GPS tracking when modal opens
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLon = position.coords.longitude;
          const distance = getDistanceInMeters(
            userLat,
            userLon,
            place.lat,
            place.lon
          );
          setCurrentDistance(distance);
        },
        (error) => console.error("Error watching position:", error),
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
      setWatchId(id);
    }

    return () => {
      // Cleanup GPS tracking when component unmounts or modal closes
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
    };
  }, [showMapModal, place.lat, place.lon, watchId]);

  const handleGPSActivation = () => {
    setShowMapModal(true);
  };

  const handleDeactivateGPS = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setShowMapModal(false);
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
    <div className="h-auto flex flex-col gap-5 border-t-2 border-gray-200">
      <div className="h-[350px] mt-5">
        <Map
          lat={place.lat}
          lon={place.lon}
          name={place.name}
          showUserPosition={showUserPosition}
          showPolyLine={showPolyline}
        />
      </div>

      <div className="flex justify-between gap-4 p-2">
        <button
          className="group flex items-center gap-2 text-sm bg-[#FCF9F8] text-black px-3 h-[35px] border border-gray-300 rounded hover:bg-[#FFF8F5] hover:text-[#C53C07] font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onShowUserPosition}
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
                <h3 className="font-semibold text-gray-700">Köksstil</h3>
              </div>
              <p className="text-gray-600 pl-8">
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
              <h3 className="font-semibold text-gray-700">Kedja</h3>
              <p className="text-gray-600 pl-8">
                {place.brand || place.operator}
              </p>
            </div>
          )}

          {/* Levels Section */}
          {place.levels && (
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold text-gray-700">Antal våningar</h3>
              <p className="text-gray-600 pl-8">{place.levels}</p>
            </div>
          )}

          {/* Contact Section */}
          {(place.phone || place.email) && (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <img src={Phone} alt="phone icon" className="h-6 w-6" />
                <h3 className="font-semibold text-gray-700">Kontakt</h3>
              </div>
              <div className="flex flex-col gap-2 pl-8">
                {place.phone && (
                  <div className="flex gap-2 items-center">
                    <a
                      href={`tel:${place.phone}`}
                      className="text-blue-500 hover:underline"
                    >
                      {place.phone}
                    </a>
                  </div>
                )}
                {place.email && (
                  <div className="flex gap-2 items-center">
                    <a
                      href={`mailto:${place.email}`}
                      className="text-blue-500 hover:underline"
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
                <h3 className="font-semibold text-gray-700">Öppettider</h3>
              </div>
              <ul className="list-none pl-8 text-gray-600">
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
              <p className="text-sm text-gray-500 text-center md:text-left">
                Om du känner att informationen är otillräcklig, kan du söka
                vidare via webben – du hittar knappen "Sök på Google" här
                nedanför.
              </p>
            )}
            <div className="flex flex-col gap-2">
              {place.website ? (
                <a
                  href={place.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#F97316] hover:text-[#C2410C] font-semibold text-sm underline"
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
                  className="flex items-center gap-2 text-[#F97316] hover:text-[#C2410C] font-semibold text-sm underline"
                >
                  <img
                    src={Link}
                    alt="google search icon"
                    className="h-4 w-4"
                  />
                  Sök på Google
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* GPS Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black z-50">
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center p-4 bg-white">
              <h2 className="text-xl font-semibold truncate max-w-[80%]">
                GPS Navigering - {place.name}
              </h2>
              <button
                onClick={() => setShowMapModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 relative">
              <Map
                lat={place.lat}
                lon={place.lon}
                name={place.name}
                showUserPosition={true}
                showPolyLine={true}
              />
            </div>
            <div className="p-4 pb-12 bg-white border-t flex flex-col gap-4">
              <p className="text-center text-lg font-medium">
                Avstånd:{" "}
                {currentDistance < 1000
                  ? `${Math.round(currentDistance)} meter`
                  : `${(currentDistance / 1000).toFixed(2)} kilometer`}
              </p>
              {currentDistance < 10 && (
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
                    onClick={handleDeactivateGPS}
                  >
                    Avaktivera GPS
                  </button>
                </div>
              )}
              {currentDistance >= 10 && (
                <button
                  className="w-full py-2 bg-[#C53C07] text-white rounded font-semibold hover:bg-[#A33206] transition"
                  onClick={handleDeactivateGPS}
                >
                  Avaktivera GPS
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceDetails;
