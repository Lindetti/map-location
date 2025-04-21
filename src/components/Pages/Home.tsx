import { useEffect, useState, useCallback } from "react";
import { ClipLoader } from "react-spinners";
import { OverpassElement, PlaceType, iconMapping } from "../../Interfaces";
import HomeImage from "../../assets/homeImages/homepicture.jpg";
import { Link } from "react-router-dom";
import Header from "../Layout/Header";
import LocationPermission from "../LocationPermission";
import AutoLocationUpdater from "../AutoLocationUpdater";
import { weatherIcons } from "../WeatherIcons";

type Place = OverpassElement & {
  distance: number;
};

const Home = () => {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [city, setCity] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<OverpassElement[]>([]);
  const [weather, setWeather] = useState<{
    temperature: number;
    windspeed: number;
    feelsLike: number;
    code: number;
  } | null>(null);

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

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    // Kolla om väderdata finns i localStorage
    const savedWeather = localStorage.getItem("weatherData");
    const savedWeatherTime = localStorage.getItem("weatherFetchTime");

    // Om vädret finns och det inte är för gammalt (t.ex. 30 minuter gammalt), använd den
    if (savedWeather && savedWeatherTime) {
      const timeElapsed = new Date().getTime() - parseInt(savedWeatherTime);
      if (timeElapsed < 600000) {
        // 30 minuter (30 * 60 * 1000)
        setWeather(JSON.parse(savedWeather));
        return;
      }
    }

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=apparent_temperature&timezone=auto`
      );
      const data = await response.json();
      const currentHour = new Date().getHours();
      const apparentTempIndex = data.hourly.time.findIndex(
        (time: string) => new Date(time).getHours() === currentHour
      );

      const feelsLike = data.hourly.apparent_temperature[apparentTempIndex];
      const weatherData = {
        temperature: data.current_weather.temperature,
        windspeed: data.current_weather.windspeed,
        code: data.current_weather.weathercode,
        feelsLike,
      };
      setWeather(weatherData);

      // Spara väderdata i localStorage för framtida användning
      localStorage.setItem("weatherData", JSON.stringify(weatherData));
      localStorage.setItem("weatherFetchTime", new Date().getTime().toString());
    } catch (err) {
      console.error("Kunde inte hämta väderdata:", err);
      setWeather(null);
    }
  }, []);

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
          node(around:10000,${latitude},${longitude})["amenity"~"restaurant|fast_food|bar|cafe|bar|hotel|hostel"];
          node(around:10000,${latitude},${longitude})["place"];
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

      const filteredPlaces = placesWithDistance.filter((p) => p.distance < 5);
      const sortedPlaces = filteredPlaces.sort(
        (a, b) => a.distance - b.distance
      );

      setNearbyPlaces(sortedPlaces);

      const place = elements.find(
        (el) =>
          el.tags?.place === "city" ||
          el.tags?.place === "town" ||
          el.tags?.place === "village"
      );
      const cityName = place?.tags?.name ?? "Okänd plats";
      setCity(cityName);
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

  return (
    <div className="w-full md:w-2/4 p-5 flex flex-col gap-4 mb-5 md:mt-2">
      <Header
        city={city ?? undefined}
        isLoading={isLoading}
        placeOptions={placeOptions}
        showTypeSelect={true}
        isHome
      />

      <AutoLocationUpdater onLocationUpdate={getUserLocation} />

      {/* Error Handling */}
      {error ? (
        <div className="flex flex-col items-center text-center gap-4 mt-10 max-w-md mx-auto px-4">
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
        </div>
      ) : (
        <div className="flex flex-col md:flex-row  gap-4 mt-2">
          <div className="flex-1 flex flex-col gap-4">
            <div className=" flex flex-col md:flex-row gap-4">
              <div className="flex-1 h-[280px] shadow-sm rounded-md">
                <img
                  className="object-cover h-full w-full rounded-md shadow-sm"
                  src={HomeImage}
                  alt="home-image"
                />
              </div>

              <div className="flex-1 bg-gray-100 py-5 md:py-0 h-[280px] shadow-sm rounded-md flex flex-row md:flex-col gap-5 items-center justify-center">
                <Link
                  className="bg-orange-500 text-white w-[100px] text-center py-2 rounded-md hover hover:bg-orange-600 transition ease-in-out duration-300"
                  to="/mat&dryck"
                >
                  Mat & Dryck
                </Link>
                <Link
                  className="bg-orange-500 text-white w-[100px] text-center py-2 rounded-md hover hover:bg-orange-600 transition ease-in-out duration-300"
                  to="/butiker"
                >
                  Butiker
                </Link>
                <Link
                  className="bg-orange-500 text-white w-[100px] text-center py-2 rounded-md hover hover:bg-orange-600 transition ease-in-out duration-300"
                  to="/boende"
                >
                  Boende
                </Link>
              </div>
            </div>
            <div className="flex-2">
              {isLoading ? (
                <div className="bg-blue-50 h-[150px] flex flex-col gap-4 items-center justify-center ">
                  <p>Hämtar aktuellt väder..</p>
                  <ClipLoader color="#F97316" size={40} />
                </div>
              ) : (
                <div className="bg-blue-200 relative h-[180px] flex justify-center items-center font-sans">
                  {weather && (
                    <div className="flex gap-5 justify-center items-center w-full ">
                      <img
                        className="h-[150px] w-[150px]"
                        src={weatherIcons[weather.code]?.icon ?? "❓"}
                        alt="icon"
                      />
                      <div className="flex flex-col gap-1">
                        <p className="font-semibold text-base">
                          {" "}
                          Kl. {getCurrentTime()}
                        </p>
                        <p className="font-semibold text-4xl">
                          {Math.abs(weather.temperature) < 0.5
                            ? 0
                            : weather.temperature}
                          °
                        </p>
                        <div className="flex gap-2 text-sm">
                          <p>Känns som</p>
                          <p>{Math.floor(Number(weather.feelsLike))}°</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-1 left-1 text-sm">
                    <p className="text-gray-400">Powered by open-meteo.com</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Nearby places */}
          <div className="w-full md:w-[300px] bg-gray-100 flex flex-col gap-4 h-auto shadow-sm rounded-md overflow-auto px-3 py-2">
            <h1 className="text-center mt-2 font-sans font-semibold">
              Närmaste platser i närheten
            </h1>

            {isLoading ? (
              <div className="flex flex-col gap-3 justify-center items-center h-full">
                <p>Hämtar din position..</p>
                <ClipLoader color="#F97316" size={40} />
              </div>
            ) : nearbyPlaces.length === 0 ? (
              <p className="text-sm text-gray-500 text-center">
                Inga platser hittades.
              </p>
            ) : (
              <div className="flex flex-col gap-2 mb-2">
                {nearbyPlaces.slice(0, 8).map((place, index) => {
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
                    <div
                      key={index}
                      className="bg-white shadow px-3 py-2 rounded"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex gap-1 items-center max-w-[180px]">
                          <img
                            className="h-5 w-5"
                            src={IconComponent}
                            alt="text"
                          />
                          <p className="font-medium truncate">
                            {place.tags?.name}
                          </p>
                        </div>
                        <p className="text-[#C53C07] bg-[#FFF8F5] w-[65px] text-center font-semibold p-2 text-sm rounded-sm">
                          {calculatedDistance !== null
                            ? calculatedDistance < 1
                              ? `${Math.round(calculatedDistance * 1000)} m`
                              : `${calculatedDistance.toFixed(2)} km`
                            : "Okänt avstånd"}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">{placeLabel}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
