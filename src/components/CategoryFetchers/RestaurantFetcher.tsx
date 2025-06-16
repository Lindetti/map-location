import { OverpassElement } from "../../Interfaces";

interface ExtendedOverpassElement extends OverpassElement {
  distance: number;
}

export const fetchRestaurants = async (
  lat: number,
  lon: number,
  getDistance: (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => number
): Promise<ExtendedOverpassElement[]> => {
  const query = `[out:json];
(
  node["amenity"="restaurant"](around:5000, ${lat}, ${lon});
  way["amenity"="restaurant"](around:5000, ${lat}, ${lon});
  relation["amenity"="restaurant"](around:5000, ${lat}, ${lon});
);
out center;`;

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query,
  });

  const data = await response.json();

  if (data && data.elements) {
    const places = data.elements
      .filter((element: OverpassElement) => element.tags && element.tags.name)
      .map((element: OverpassElement) => {
        const elementLat = element.lat || element.center?.lat || 0;
        const elementLon = element.lon || element.center?.lon || 0;
        return {
          ...element,
          distance: getDistance(lat, lon, elementLat, elementLon),
        };
      })
      .sort(
        (a: ExtendedOverpassElement, b: ExtendedOverpassElement) =>
          a.distance - b.distance
      );

    return places.slice(0, 21);
  }

  return [];
};
