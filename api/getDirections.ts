import type { VercelRequest, VercelResponse } from "@vercel/node";

// Define expected request body structure
interface RequestBody {
  startCoords: [number, number]; // [lon, lat]
  endCoords: [number, number]; // [lon, lat]
  profile: "foot-walking" | "driving-car";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { startCoords, endCoords, profile } = req.body as RequestBody;

  // --- Basic Input Validation ---
  if (
    !startCoords ||
    !Array.isArray(startCoords) ||
    startCoords.length !== 2 ||
    !endCoords ||
    !Array.isArray(endCoords) ||
    endCoords.length !== 2 ||
    !profile ||
    !["foot-walking", "driving-car"].includes(profile)
  ) {
    return res.status(400).json({ error: "Invalid input parameters." });
  }

  const apiKey = process.env.ORS_API_KEY; // Read from Vercel Env Vars

  if (!apiKey) {
    console.error("ORS API key not configured in environment variables.");
    return res
      .status(500)
      .json({ error: "Server configuration error: API key missing." });
  }

  // ORS uses longitude, latitude order
  const startLonLat = `${startCoords[0]},${startCoords[1]}`;
  const endLonLat = `${endCoords[0]},${endCoords[1]}`;

  const url = `https://api.openrouteservice.org/v2/directions/${profile}?api_key=${apiKey}&start=${startLonLat}&end=${endLonLat}`;

  try {
    const orsResponse = await fetch(url);

    if (!orsResponse.ok) {
      let errorData: { error?: { message?: string } }; // Define expected shape
      try {
        errorData = (await orsResponse.json()) as {
          error?: { message?: string };
        }; // Add type assertion
      } catch {
        // Handle cases where the error response isn't valid JSON
        throw new Error(
          `ORS API Error: Status ${orsResponse.status} - ${orsResponse.statusText}`
        );
      }
      console.error("ORS API Error Data:", errorData);
      const errorMessage =
        errorData?.error?.message ||
        `HTTP error! status: ${orsResponse.status}`;
      // Don't expose the raw error message directly to the client if it might contain sensitive info
      // Instead, return a generic error or a sanitized one.
      return res.status(orsResponse.status).json({
        error: `Failed to fetch directions from ORS: ${errorMessage}`,
      });
    }

    const data = (await orsResponse.json()) as {
      features?: { geometry?: { coordinates?: unknown } }[];
    }; // Add type assertion

    // Extract coordinates from the first route's geometry
    if (data.features && data.features.length > 0) {
      const coordinates = data.features[0]?.geometry?.coordinates; // Add optional chaining for geometry
      // Basic validation that coordinates look like an array (further checks might be needed)
      if (Array.isArray(coordinates)) {
        return res.status(200).json({ routeCoordinates: coordinates });
      } else {
        // Handle case where coordinates are missing or not an array
        console.error("Invalid or missing coordinates in ORS response:", data);
        return res
          .status(500)
          .json({ error: "Invalid coordinates format received from ORS." });
      }
    } else {
      return res.status(404).json({ error: "No route found by ORS." });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to fetch directions (Serverless Function):", error);
    // Return a generic server error
    return res.status(500).json({ error: `Server error: ${message}` });
  }
}
