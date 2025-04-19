import { useEffect, useState } from "react";
import { ClipLoader, PulseLoader } from "react-spinners";
import { OverpassElement, PlaceType, iconMapping } from "../../Interfaces";
import HomeImage from "../../assets/homeImages/homepicture.jpg";
import { Link } from "react-router-dom";

type Place = OverpassElement & {
  distance: number;
};

const Home = () => {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [city, setCity] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<OverpassElement[]>([]);
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
    { label: "Caféer", singularLabel: "Café", value: "cafe" },
    { label: "Barer", singularLabel: "Bar", value: "bar" },
    { label: "Barer", singularLabel: "Hotel", value: "hotel" },
  ];

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

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation stöds inte i denna webbläsare.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lon: longitude });
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Du har nekat åtkomst till platsen.");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Platsinformation är inte tillgänglig.");
            break;
          case err.TIMEOUT:
            setError("Det tog för lång tid att hämta din plats.");
            break;
          default:
            setError("Ett okänt fel inträffade vid hämtning av plats.");
        }
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  useEffect(() => {
    if (!location) return;

    setLoading(true);

    const query = `
    [out:json][timeout:25];
    (
      node(around:5000,${location.lat},${location.lon})["amenity"~"restaurant|fast_food|bar|cafe|bar|hotel|hostel"];
      node(around:5000,${location.lat},${location.lon})["place"];
    );
    out body;
  `;

    fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    })
      .then((res) => res.json())
      .then((data) => {
        const elements: OverpassElement[] = data.elements;

        const placesWithDistance: Place[] = elements
          .filter(
            (el) =>
              el.tags?.name &&
              (el.tags.amenity || el.tags.shop) &&
              el.lat !== undefined && // Kontrollera om lat är definierad
              el.lon !== undefined // Kontrollera om lon är definierad
          )
          .map((el) => ({
            ...el,
            distance: location
              ? getDistance(location.lat, location.lon, el.lat!, el.lon!) // Nu säkerställer vi att lat och lon inte är undefined
              : Infinity,
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
        setCity(place?.tags?.name ?? "Okänd plats");
      })
      .catch(() => {
        setError("Kunde inte hämta stadens namn.");
      })
      .finally(() => setLoading(false));
  }, [location]);
  useEffect(() => {
    if (!location) return;

    setLoading(true);

    const query = `
    [out:json][timeout:25];
    (
      node(around:5000,${location.lat},${location.lon})["amenity"~"restaurant|fast_food|bar|cafe"];
      node(around:5000,${location.lat},${location.lon})["place"];
    );
    out body;
  `;

    fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    })
      .then((res) => res.json())
      .then((data) => {
        const elements: OverpassElement[] = data.elements;

        const placesWithDistance: Place[] = elements
          .filter(
            (el) =>
              el.tags?.name &&
              (el.tags.amenity || el.tags.shop) &&
              el.lat !== undefined && // Kontrollera om lat är definierad
              el.lon !== undefined // Kontrollera om lon är definierad
          )
          .map((el) => ({
            ...el,
            distance: location
              ? getDistance(location.lat, location.lon, el.lat!, el.lon!) // Nu säkerställer vi att lat och lon inte är undefined
              : Infinity,
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
        setCity(place?.tags?.name ?? "Okänd plats");
      })
      .catch(() => {
        setError("Kunde inte hämta stadens namn.");
      })
      .finally(() => setLoading(false));
  }, [location]);

  const getPlaceLabel = (placeType: string | undefined): string => {
    const match = placeOptions.find((option) => option.value === placeType);
    return match ? match.singularLabel : "Okänd plats"; // Fallback till "Okänd plats" om ingen matchning hittas
  };

  return (
    <div className="w-full md:w-2/4 p-5 flex flex-col gap-4 mb-5 md:mt-2">
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold text-base text-gray-600">
          Upptäck restauranger, butiker och boenden i närheten där du befinner
          dig!
        </h1>

        {loading ? (
          <div className="flex gap-2 items-center">
            <em>Hämtar din plats...</em>
            <PulseLoader color="#F97316" size={6} />
          </div>
        ) : error ? (
          <div className="text-center text-red-600 text-sm max-w-md">
            <p>{error}</p>
          </div>
        ) : (
          <div className="flex gap-1.5 items-center">
            <em>Du befinner dig i</em>
            <p className="font-semibold">{city}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:justify-between gap-4 mt-2">
        <div className="flex-1 bg-red-200 h-[280px] shadow-sm rounded-md">
          <img
            className="object-cover h-full w-full rounded-md shadow-sm"
            src={HomeImage}
            alt="home-image"
          />
        </div>

        <div className="flex-1 bg-gray-100 py-5 md:py-0 h-[280px] shadow-sm rounded-md flex flex-row md:flex-col gap-5 items-center justify-center">
          <Link
            className="bg-orange-500 text-white w-[100px] text-center py-2 rounded-md"
            to="/mat&dryck"
          >
            Mat & Dryck
          </Link>
          <Link
            className="bg-orange-500 text-white w-[100px] text-center py-2 rounded-md"
            to="/butiker"
          >
            Butiker
          </Link>
          <Link
            className="bg-orange-500 text-white w-[100px] text-center py-2 rounded-md"
            to="/boende"
          >
            Boende
          </Link>
        </div>

        <div className="flex-1 bg-gray-100 flex flex-col gap-4 h-auto shadow-sm rounded-md overflow-auto px-3 py-2">
          <h1 className="text-center mt-2 font-sans font-semibold">
            Närmaste platser i närheten
          </h1>

          {loading ? ( // Här läggs condition för att visa loadern när platser laddas
            <div className="flex justify-center items-center h-full">
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

                const placeType = place.tags?.amenity || place.tags?.shop; // Typen för platsen
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
                      <p className="text-[#C53C07] bg-[#FFF8F5] w-[65px] text-center font-semibold p-2 text-sm  rounded-sm">
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
    </div>
  );
};

export default Home;
