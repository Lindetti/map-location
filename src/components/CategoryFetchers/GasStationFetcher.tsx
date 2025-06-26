import { OverpassElement } from "../../Interfaces";

interface ExtendedOverpassElement extends OverpassElement {
  distance: number;
}

interface FuelStationTags {
  name?: string;
  amenity?: string;
  brand?: string;
  operator?: string;
}

export const fetchGasStations = async (
  lat: number,
  lon: number,
  getDistance: (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => number
): Promise<ExtendedOverpassElement[]> => {
  const query = `[out:json][timeout:25];
node["amenity"="fuel"](around:5000, ${lat}, ${lon});
out body;`;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
    });
    const data = await response.json();

    if (data && data.elements) {
      const places = data.elements
        .filter((element: OverpassElement) => element.tags !== undefined)
        .map((element: OverpassElement) => {
          const tags = element.tags as FuelStationTags;
          const defaultName = tags?.brand || tags?.operator || "Bensinstation";

          return {
            ...element,
            tags: {
              ...tags,
              name: tags?.name || defaultName,
            },
            distance: getDistance(lat, lon, element.lat || 0, element.lon || 0),
          };
        })
        .sort(
          (a: ExtendedOverpassElement, b: ExtendedOverpassElement) =>
            a.distance - b.distance
        );

      return places.slice(0, 21);
    }

    return [];
  } catch (error) {
    console.error("Error fetching gas stations:", error);
    return [];
  }
};
