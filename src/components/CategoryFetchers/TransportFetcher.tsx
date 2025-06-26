import { OverpassElement } from "../../Interfaces";

interface ExtendedOverpassElement extends OverpassElement {
  distance: number;
  lines?: string[]; // Busslinjer t.ex. ["2", "3", "4"]
}

interface TransportTags {
  name?: string;
  railway?: string;
  highway?: string;
  amenity?: string;
  route_ref?: string; // Busslinjer t.ex. "2;3;4"
}

export const fetchTransport = async (
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
(
  node["highway"="bus_stop"](around:3000, ${lat}, ${lon});
  way["highway"="bus_stop"](around:3000, ${lat}, ${lon});
  relation["highway"="bus_stop"](around:3000, ${lat}, ${lon});

  node["amenity"="taxi"](around:5000, ${lat}, ${lon});
  way["amenity"="taxi"](around:5000, ${lat}, ${lon});
  relation["amenity"="taxi"](around:5000, ${lat}, ${lon});

 relation["route"="bus"](around:3000, ${lat}, ${lon});
);
out center;`;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: query,
    });

    const data = await response.json();

    if (data?.elements) {
      const places: ExtendedOverpassElement[] = data.elements
        .filter((element: OverpassElement) => element.tags !== undefined)
        .map((element: OverpassElement): ExtendedOverpassElement => {
          const elementLat: number = element.lat || element.center?.lat || 0;
          const elementLon: number = element.lon || element.center?.lon || 0;
          const tags: TransportTags = element.tags as TransportTags;

          let defaultName: string = "Transport";
          if (tags?.highway === "bus_stop") {
            defaultName = "Busshållplats";
          } else if (tags?.amenity === "taxi") {
            defaultName = "Taxi";
          } // Hämta linjer från route_ref och extrahera bara bussnumren
          const lines: string[] = tags.route_ref
            ? tags.route_ref
                .split(";")
                .map((line) => line.trim())
                .map((line) => {
                  // Extract just the bus number from strings like "Buss 84: Stenstan => Haga => Stenstan"
                  const match = line.match(/\d+/);
                  return match ? match[0] : "";
                })
                .filter((line) => line !== "") // Remove any empty strings
            : [];

          return {
            ...element,
            tags: {
              ...tags,
              name: tags?.name || defaultName,
            },
            lines,
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
  } catch (error) {
    console.error("Error fetching transport locations:", error);
    return [];
  }
};
