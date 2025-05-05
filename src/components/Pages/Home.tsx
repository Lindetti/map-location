import { useEffect, useState, useCallback } from "react";
import { ClipLoader, PulseLoader } from "react-spinners";
import { OverpassElement, PlaceType, iconMapping } from "../../Interfaces";
import HomeImage from "../../assets/homeImages/homepicture.jpg";
import { Link } from "react-router-dom";
import Header from "../Layout/Header";
import Map from "../Map";
import LocationPermission from "../LocationPermission";
import AutoLocationUpdater from "../AutoLocationUpdater";
import { weatherIcons } from "../WeatherIcons";
import ArrowUp from "../../assets/icons/arrowUp.png";
import ArrowDown from "../../assets/icons/arrowDown.png";
import ArrowUpDarkMode from "../../assets/icons/arrowUpDarkMode.png";
import ArrowDownDarkmode from "../../assets/icons/arrowDownDarkMode.png";
import { motion } from "framer-motion";
import LinkIcon from "../../assets/icons/link.png";
import Phone from "../../assets/icons/phone.png";
import Email from "../../assets/icons/email.png";
import Open from "../../assets/icons/open.png";

type Place = OverpassElement & {
  distance: number;
};

// Nyckeln för sessionStorage
const WEATHER_LOADED_SESSION_KEY = "weatherInitialLoadComplete";

const Home = () => {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [city, setCity] = useState<string | null>(() => {
    // Check localStorage for saved city on initial mount
    const savedCity = localStorage.getItem("savedCity");
    return savedCity || null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<OverpassElement[]>([]);
  const [showUserPosition, setShowUserPosition] = useState(false);
  const [showPolyline, setShowPolyline] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number>(-1);
  const [weather, setWeather] = useState<{
    temperature: number;
    windspeed: number;
    feelsLike: number;
    code: number;
  } | null>(null);

  // Nytt state för att spåra initial väderladdning för sessionen
  const [isInitialWeatherLoadDone, setIsInitialWeatherLoadDone] = useState(
    () => {
      // Kolla sessionStorage vid initiering
      return sessionStorage.getItem(WEATHER_LOADED_SESSION_KEY) === "true";
    }
  );

  const placeOptions: {
    label: string;
    singularLabel: string;
    value: PlaceType;
  }[] = [
    { label: "Restauranger", singularLabel: "Restaurang", value: "restaurant" },
    { label: "Snabbmat", singularLabel: "Snabbmat", value: "fast_food" },
    { label: "Caféer", singularLabel: "Café", value: "cafe" },
    { label: "Barer", singularLabel: "Bar", value: "bar" },
    { label: "Hotell", singularLabel: "Hotell", value: "hotel" },
    { label: "Vandrarhem", singularLabel: "Vandrarhem", value: "hostel" },
  ];

  function getDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }

  const fetchWeather = useCallback(
    async (lat: number, lon: number) => {
      // Funktion för att markera initial laddning som klar
      const markInitialLoadComplete = () => {
        if (!isInitialWeatherLoadDone) {
          setIsInitialWeatherLoadDone(true);
          sessionStorage.setItem(WEATHER_LOADED_SESSION_KEY, "true");
        }
      };

      // Kolla om väderdata finns i localStorage (för cache)
      const savedWeather = localStorage.getItem("weatherData");
      const savedWeatherTime = localStorage.getItem("weatherFetchTime");

      // Om vädret finns och det inte är för gammalt, använd den
      if (savedWeather && savedWeatherTime) {
        const timeElapsed = new Date().getTime() - parseInt(savedWeatherTime);
        if (timeElapsed < 1800000) {
          // 30 minuter
          setWeather(JSON.parse(savedWeather));
          markInitialLoadComplete(); // Markera som klar även vid cache-träff
          return;
        }
      }

      // Om ingen giltig cache, försök hämta från API
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=apparent_temperature&timezone=auto`
        );
        const data = await response.json();
        const currentHour = new Date().getHours();
        const apparentTempIndex = data.hourly.time.findIndex(
          (time: string) => new Date(time).getHours() === currentHour
        );

        const weatherData = {
          temperature: data.current_weather.temperature,
          windspeed: data.current_weather.windspeed,
          code: data.current_weather.weathercode,
          feelsLike: data.hourly.apparent_temperature[apparentTempIndex],
        };
        setWeather(weatherData);

        // Spara i localStorage för cache
        localStorage.setItem("weatherData", JSON.stringify(weatherData));
        localStorage.setItem(
          "weatherFetchTime",
          new Date().getTime().toString()
        );

        markInitialLoadComplete(); // Markera som klar efter lyckad API-hämtning
      } catch (err) {
        console.error("Kunde inte hämta väderdata:", err);
        setWeather(null); // Sätt tillbaka till null vid fel
        // Markera INTE som klar om det blev fel
      }
    },
    [isInitialWeatherLoadDone]
  );

  const getUserLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError("Geolocation stöds inte i denna webbläsare.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        }
      );

      const { latitude, longitude } = position.coords;
      setLocation({ lat: latitude, lon: longitude });
      fetchWeather(latitude, longitude);

      const query = `
        [out:json][timeout:25];
        (
          node(around:5000,${latitude},${longitude})["amenity"~"restaurant|fast_food|bar|cafe|bar|hotel|hostel|shops"];
          node(around:5000,${latitude},${longitude})["place"];
        );
        out body;
      `;

      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
      });
      const data = await response.json();
      const elements: OverpassElement[] = data.elements;

      const placesWithDistance: Place[] = elements
        .filter(
          (el) =>
            el.tags?.name &&
            (el.tags.amenity || el.tags.shop) &&
            el.lat !== undefined &&
            el.lon !== undefined
        )
        .map((el) => ({
          ...el,
          distance: getDistance(latitude, longitude, el.lat!, el.lon!),
        }));

      const filteredPlaces = placesWithDistance.filter((p) => p.distance < 10);
      const sortedPlaces = filteredPlaces.sort(
        (a, b) => a.distance - b.distance
      );
      setNearbyPlaces(sortedPlaces.slice(0, 5));

      const place = elements.find(
        (el) =>
          el.tags?.place === "city" ||
          el.tags?.place === "town" ||
          el.tags?.place === "village"
      );
      const cityName = place?.tags?.name ?? "Okänd plats";

      // Check if city has changed
      const savedCity = localStorage.getItem("savedCity");
      if (savedCity !== cityName) {
        setCity(cityName);
        localStorage.setItem("savedCity", cityName);
      }
    } catch (err: unknown) {
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case 1:
            setError(
              "Du har nekat åtkomst till platsen. Tillåt platsåtkomst i webbläsarens inställningar för att använda Platsguiden."
            );
            break;
          case 2:
            setError("Platsinformation är inte tillgänglig.");
            break;
          case 3:
            setError("Det tog för lång tid att hämta din plats.");
            break;
          default:
            setError("Ett okänt fel inträffade vid hämtning av plats.");
        }
      } else {
        setError("Ett okänt fel inträffade.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchWeather]);

  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getPlaceLabel = (placeType: string | undefined): string => {
    const match = placeOptions.find((option) => option.value === placeType);
    return match ? match.singularLabel : "Okänd plats";
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0"); // Timmar, med ledande nolla om det behövs
    const minutes = now.getMinutes().toString().padStart(2, "0"); // Minuter, med ledande nolla om det behövs
    return `${hours}:${minutes}`;
  };

  const isNight = () => {
    const hour = new Date().getHours();
    return hour < 6 || hour > 20;
  };

  const handleShowUserPosition = () => {
    setShowUserPosition(true);
    setShowPolyline(true);
  };

  const handleExpand = (index: number) => {
    setExpandedIndex(index === expandedIndex ? -1 : index);
    setShowUserPosition(false);
    setShowPolyline(false);

    if (index !== expandedIndex) {
      // Add a small delay to ensure the div is rendered before scrolling
      setTimeout(() => {
        const element = document.getElementById(`place-${index}`);
        if (element) {
          const offset = 50; // Offset to account for header and spacing
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 100);
    }
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

  const isOpen = (openingHours: string): boolean => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes

    const hours = openingHours.split(";");
    const todayHours = hours[currentDay === 0 ? 6 : currentDay - 1]; // Adjust for Sunday being 0

    if (!todayHours || todayHours.toLowerCase().includes("stängt")) {
      return false;
    }

    const [openTime, closeTime] = todayHours.split("-").map((time) => {
      const [hours, minutes] = time.trim().split(":").map(Number);
      return hours * 60 + (minutes || 0);
    });

    return currentTime >= openTime && currentTime <= closeTime;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full lg:w-2/4 p-5 flex flex-col gap-6 md:mt-2 min-h-screen"
    >
      {/* Visa Header endast om platsåtkomst INTE är nekad */}
      {error !==
        "Du har nekat åtkomst till platsen. Tillåt platsåtkomst i webbläsarens inställningar för att använda Platsguiden." && (
        <Header
          city={city ?? undefined}
          isLoading={isLoading}
          placeOptions={placeOptions}
          showTypeSelect={true}
          isHome
        />
      )}

      <AutoLocationUpdater onLocationUpdate={getUserLocation} />

      {/* Error Handling */}
      {error ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col items-center text-center gap-4 mt-10 max-w-md mx-auto px-4"
        >
          {error ===
          "Du har nekat åtkomst till platsen. Tillåt platsåtkomst i webbläsarens inställningar för att använda Platsguiden." ? (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold text-red-600">
                Platsåtkomst nekad
              </h2>
              <p className="text-gray-700">
                För att Platsguiden ska kunna visa ställen nära dig behöver vi
                åtkomst till din plats. Du har nekat åtkomst, vilket gör att vi
                inte kan hämta några resultat.
              </p>
              <p className="text-sm text-gray-500">
                Tillåt platsåtkomst i webbläsarens inställningar.
              </p>
              <LocationPermission onPermissionGranted={getUserLocation} />
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-red-600">
                Ett fel inträffade
              </h2>
              <p className="text-gray-700">{error}</p>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col md:flex-row gap-6 mt-2"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex-1 flex flex-col gap-6"
          >
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 h-[300px] md:h-[350px] shadow-sm rounded-md relative overflow-hidden">
                <img
                  className="object-cover object-center h-full w-full rounded-md shadow-sm"
                  src={HomeImage}
                  alt="home-image"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="text-center text-white px-4">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3">
                      Upptäck platsen
                    </h1>
                    <p className="text-lg md:text-xl">
                      Hitta de bästa platserna i närheten
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-[#1e1e1e] py-5 md:py-0 h-[140px] md:h-[300px] shadow-sm rounded-md flex flex-wrap md:flex-col gap-4 items-center justify-center w-full md:w-[220px] p-4 md:hidden">
                <h1 className="hidden md:block text-center font-semibold text-base">
                  Snabbval
                </h1>

                <Link
                  className="flex items-center justify-center text-center bg-[#FCF9F8] text-black p-2 md:w-[120px] w-[125px] text-sm border border-gray-300 rounded hover:bg-[#FFF8F5] hover:text-[#C53C07] font-semibold transition"
                  to="/mat&dryck"
                >
                  Mat & Dryck
                </Link>
                <Link
                  className="flex items-center justify-center text-center bg-[#FCF9F8] text-black p-2 w-[120px] text-sm border border-gray-300 rounded hover:bg-[#FFF8F5] hover:text-[#C53C07] font-semibold transition"
                  to="/butiker"
                >
                  Butiker
                </Link>
                <Link
                  className="flex items-center justify-center text-center bg-[#FCF9F8] text-black p-2 w-[120px] text-sm border border-gray-300 rounded hover:bg-[#FFF8F5] hover:text-[#C53C07] font-semibold transition"
                  to="/boende"
                >
                  Boende
                </Link>
                <Link
                  className="flex items-center justify-center text-center bg-[#FCF9F8] text-black p-2 w-[120px] text-sm border border-gray-300 rounded hover:bg-[#FFF8F5] hover:text-[#C53C07] font-semibold transition"
                  to="/vard&halsa"
                >
                  Vård & Hälsa
                </Link>
              </div>
            </div>
            <div className="flex-2">
              {!weather && !isInitialWeatherLoadDone ? (
                <div className="h-[150px] flex flex-col gap-4 items-center justify-center">
                  <p className="text-gray-600">Hämtar aktuellt väder..</p>
                  <ClipLoader color="#F97316" size={40} />
                </div>
              ) : weather ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className={`relative h-[180px] flex justify-center items-center font-sans rounded-md ${
                    isNight() ? "bg-gray-800 text-gray-200" : "bg-blue-200"
                  }`}
                >
                  <div className="flex gap-6 justify-center items-center w-full">
                    <img
                      className="h-[120px] w-[120px]"
                      src={
                        isNight()
                          ? weatherIcons[weather.code]?.night.icon
                          : weatherIcons[weather.code]?.day.icon
                      }
                      alt="icon"
                    />
                    <div className="flex flex-col gap-2">
                      <p className="font-semibold text-base">
                        Kl. {getCurrentTime()}
                      </p>
                      <p className="font-semibold text-4xl">
                        {Math.round(weather.temperature)}°
                      </p>
                      <div className="flex gap-2 text-sm">
                        <p>Känns som</p>
                        <p>{Math.floor(Number(weather.feelsLike))}°</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-1 left-1 text-sm">
                    <p className="text-gray-400">Powered by open-meteo.com</p>
                  </div>
                </motion.div>
              ) : null}
            </div>
          </motion.div>

          {/* Nearby places */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="w-full md:w-[500px] flex flex-col gap-4 h-auto rounded-md overflow-auto px-3 mt-5 md:mt-0"
          >
            {isLoading ? (
              <PulseLoader color="#F97316" size={5} />
            ) : (
              <h1 className="text-gray-700 dark:text-gray-200 font-sans text-xl">
                Dina närmaste platser just nu
              </h1>
            )}

            {isLoading ? (
              <div className="flex flex-col gap-3 justify-center items-center h-full">
                <p className="text-gray-600 dark:text-gray-200">Hämtar din position..</p>
                <ClipLoader color="#F97316" size={40} />
              </div>
            ) : nearbyPlaces.length === 0 ? (
              <p className="text-sm text-gray-500 text-center">
                Inga platser hittades.
              </p>
            ) : (
              <div className="flex flex-col gap-3 mb-2">
                {nearbyPlaces.map((place, index) => {
                  const isExpanded = index === expandedIndex;
                  let calculatedDistance = null;

                  if (location && place.lat && place.lon) {
                    calculatedDistance = getDistance(
                      location.lat,
                      location.lon,
                      place.lat,
                      place.lon
                    );
                  }

                  const placeLabel = getPlaceLabel(
                    place.tags?.amenity || place.tags?.shop
                  );
                  const placeType = place.tags?.amenity || place.tags?.shop;
                  const IconComponent = iconMapping[placeType as PlaceType];

                  return (
                    <motion.div
                      key={index}
                      id={`place-${index}`}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.1,
                        ease: "easeOut",
                      }}
                      className={`
                        bg-white text-black dark:bg-[#282828] dark:text-gray-200 w-full flex flex-col gap-4 p-4 md:p-5 rounded-md shadow-sm
                        border transition-all duration-300
                        ${
                          expandedIndex === index
                            ? "border-[1.5px] border-orange-500"
                            : "border border-gray-300 dark:border-[#ffffff20] hover:border-orange-500"
                        }
                      `}
                    >
                      <div
                        className="flex flex-col gap-3 cursor-pointer"
                        onClick={() => handleExpand(index)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2 max-w-[180px]">
                            <img
                              className="h-5 w-5"
                              src={IconComponent}
                              alt="text"
                            />
                            <div>
                              <p className="font-medium truncate">
                                {place.tags?.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-orange-400">
                                {placeLabel}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <p className="w-[65px] text-center font-semibold p-2 text-sm rounded-sm bg-[#FFF8F5] text-[#C53C07] dark:text-gray-800">
                              {calculatedDistance !== null
                                ? calculatedDistance < 1
                                  ? `${Math.round(calculatedDistance * 1000)} m`
                                  : `${calculatedDistance.toFixed(2)} km`
                                : "Okänt avstånd"}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          {place.tags?.opening_hours ? (
                            <div className="pl-4">
                              <p
                                className={`text-sm font-medium py-1 px-2 rounded-md text-white ${
                                  isOpen(place.tags.opening_hours)
                                    ? "bg-green-600"
                                    : "bg-red-500"
                                }`}
                              >
                                {isOpen(place.tags.opening_hours)
                                  ? "Öppet"
                                  : "Stängt"}
                              </p>
                            </div>
                          ) : (
                            <div> </div>
                          )}
                          <span className="text-xl">
                          <img
            src={isExpanded ? ArrowUp : ArrowDown}
            alt="toggle arrow"
            className="h-4 w-4 block dark:hidden"
          />
          <img
            src={isExpanded ? ArrowUpDarkMode : ArrowDownDarkmode}
            alt="toggle arrow dark"
            className="h-4 w-4 hidden dark:block"
          />
                          </span>
                        </div>
                      </div>

                      {isExpanded &&
                        place.lat !== undefined &&
                        place.lon !== undefined && (
                          <div className="flex flex-col gap-4 p-2 border-t-2 dark:border-gray-300">
                            <div className="h-[300px] mt-2 mb-2">
                              <Map
                                lat={place.lat}
                                lon={place.lon}
                                zoom={16}
                                name={place.tags?.name}
                                showUserPosition={showUserPosition}
                                showPolyLine={showPolyline}
                              />
                            </div>
                            <div className="flex justify-start mb-4">
                              <button
                                className="flex items-center justify-center gap-2 text-sm bg-[#FCF9F8] text-black px-3 h-[35px] border border-gray-300 rounded hover:bg-[#FFF8F5] hover:text-[#C53C07] font-semibold transition"
                                onClick={handleShowUserPosition}
                              >
                                Visa min position
                              </button>
                            </div>
                            <div className="flex flex-col gap-3">
                              {place.tags?.cuisine && (
                                <div className="flex gap-2 items-center">
                                  <img
                                    src={IconComponent}
                                    alt="link icon"
                                    className="h-6 w-6"
                                  />
                                  <p className="text-gray-600 dark:text-gray-300">
                                    {(place.tags?.cuisine ?? "")
                                      .split(";")
                                      .slice(0, 3)
                                      .map((cuisine) =>
                                        translateCuisine(cuisine)
                                      )
                                      .join(", ")}
                                  </p>
                                </div>
                              )}

                              <div className="flex flex-col gap-2">
                                {place.tags?.brand && (
                                  <div className="flex gap-2 items-center">
                                    <p className="text-gray-500">Kedja:</p>
                                    <p className="font-semibold text-gray-700 dark:text-gray-300">
                                      {place.tags?.brand}
                                    </p>
                                  </div>
                                )}
                                {place.tags?.operator && (
                                  <div className="flex gap-2 items-center">
                                    <p className="text-gray-500">Kedja:</p>
                                    <p className="font-semibold text-gray-700 dark:text-gray-300">
                                      {place.tags?.operator}
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col gap-2">
                                {place.tags?.phone && (
                                  <div className="flex gap-2 items-center">
                                    <img
                                      src={Phone}
                                      alt="phone icon"
                                      className="h-5 w-5"
                                    />
                                    <a
                                      href={`${place.tags?.["contact:phone"]}`}
                                      className="text-blue-500 dark:text-blue-300 hover:underline"
                                    >
                                      {place.tags?.phone}
                                    </a>
                                  </div>
                                )}
                                {place.tags?.email && (
                                  <div className="flex gap-2 items-center">
                                    <img
                                      src={Email}
                                      alt="link icon"
                                      className="h-5 w-5"
                                    />
                                    <a
                                      href={`mailto:${place.tags?.email}`}
                                      className="text-blue-500 dark:text-blue-300 hover:underline"
                                    >
                                      {place.tags?.email}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                            {place.tags?.opening_hours && (
                              <div className="flex flex-col gap-2">
                                <div className="flex gap-2 items-center">
                                  <img
                                    src={Open}
                                    alt="open icon"
                                    className="h-5 w-5"
                                  />
                                  <p className="font-semibold text-gray-700 dark:text-gray-300">
                                    Öppettider:
                                  </p>
                                </div>
                                <ul className="list-none pl-1 text-gray-700 dark:text-gray-300">
                                  {place.tags?.opening_hours
                                    .split(";")
                                    .map((hour, i) => (
                                      <li key={i} className="py-1">
                                        {hour.trim()}
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            )}

                            <div>
                              {place.tags?.website ? (
                                <></>
                              ) : (
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Om du känner att informationen är
                                    otillräcklig, prova gärna att söka vidare
                                    via webben – du hittar knappen "Sök på
                                    Google" här nedanför.
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="flex justify-between p-1">
                              {place.tags?.website ? (
                                <a
                                  href={place.tags?.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-orange-500 dark:text-gray-200 hover:text-[#C2410C] font-semibold text-sm underline"
                                >
                                  <img
                                    src={LinkIcon}
                                    alt="link icon"
                                    className="h-4 w-4"
                                  />
                                  Besök webbplats
                                </a>
                              ) : (
                                <a
                                  href={`https://www.google.com/search?q=${encodeURIComponent(
                                    place.tags?.name + " " + city
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-[#F97316] dark:text-gray-200 hover:text-[#C2410C] font-semibold text-sm underline"
                                >
                                  <img
                                    src={LinkIcon}
                                    alt="link icon"
                                    className="h-4 w-4"
                                  />
                                  Sök på Google
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Home;
