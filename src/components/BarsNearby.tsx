import { useEffect, useState } from "react";
import { Place, OverpassElement } from "../Interfaces";
import DefaultImage from "../assets/defaultImage/default.jpg";

const BarsNearby = () => {
  const [bars, setBars] = useState<Place[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUserLocation = async () => {
      if (!navigator.geolocation) {
        setError("Geolocation stöds inte i denna webbläsare.");
        return;
      }

      navigator.geolocation.getCurrentPosition(async (position) => {
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
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
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

              return {
                name: item.tags?.name || "Okänd bar",
                lat,
                lon,
                distance: getDistance(userLat, userLon, lat, lon),
                address: item.tags?.["addr:street"]
                  ? `${item.tags["addr:street"]}, ${item.tags["addr:city"]}`
                  : undefined,
                phone: item.tags?.["contact:phone"],
                website: item.tags?.website,
                openingHours: item.tags?.opening_hours,
              };
            })
            .sort((a: Place, b: Place) => a.distance - b.distance);

          setBars(places);
        } catch {
          setError("Något gick fel vid hämtning av barer.");
        }
      });
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
    <div className="p-5 flex flex-col justify-center gap-4">
      <h1 className="text-3xl font-bold mb-4">Barer i närheten</h1>
      {error && <p className="text-red-500">{error}</p>}
      <div className="w-full flex flex-wrap gap-4 items-center justify-center">
        {bars.length > 0 ? (
          bars.slice(0, 10).map((bar, index) => (
            <div
              key={index}
              className="bg-gray-50 h-[650px] w-[350px] flex flex-col gap-5 p-4 shadow-md"
            >
              <p className="font-semibold text-2xl">{bar.name}</p>
              <div className="h-[200px] bg-red-300 mb-10">
                <img
                  src={DefaultImage}
                  alt={bar.name}
                  className="w-full h-full object-cover rounded"
                />
                <em className="text-sm text-gray-500">
                  Note: Picture is AI generated and has nothing to do with the
                  restaurant.
                </em>
              </div>
              <div className="flex flex-col gap-2 mt-5">
                <div className="flex gap-2">
                  <p>Avstånd:</p>
                  <p className="font-semibold">{bar.distance.toFixed(2)} km</p>
                </div>
                <div className="flex gap-2">
                  <p>Adress:</p>
                  {(bar.address ?? "").length > 0
                    ? bar.address
                    : "Information saknas"}
                </div>
                {bar.phone && <p>Telefon: {bar.phone}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <p>Webbplats:</p>
                {(bar.website ?? "").length > 0
                  ? bar.website
                  : "Information saknas"}
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-semibold">Öppettider:</p>
                {(bar.openingHours ?? "").length > 0 ? (
                  <ul className="list-disc pl-5">
                    {(bar.openingHours ?? "").split(";").map((hour, index) => (
                      <li key={index}>{hour.trim()}</li>
                    ))}
                  </ul>
                ) : (
                  "Information saknas"
                )}
              </div>
            </div>
          ))
        ) : (
          <p>Hittar inga barer i närheten.</p>
        )}
      </div>
    </div>
  );
};

export default BarsNearby;
