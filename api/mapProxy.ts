import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end("Method Not Allowed");
  }

  const mapPath = req.query.mapPath as string;

  if (!mapPath) {
    return res.status(400).json({ error: "Missing mapPath query parameter." });
  }

  const apiKey = process.env.MAPTILER_API_KEY_PROXY;

  if (!apiKey) {
    console.error(
      "MapTiler API key (MAPTILER_API_KEY_PROXY) not configured in environment variables."
    );
    return res
      .status(500)
      .json({ error: "Server configuration error: API key missing." });
  }

  // Ensure mapPath is a string and doesn't try to escape the intended domain (basic security)
  if (typeof mapPath !== "string" || mapPath.includes("..")) {
    return res.status(400).json({ error: "Invalid mapPath." });
  }

  const mapTilerUrl = `https://api.maptiler.com/${mapPath}?key=${apiKey}`;

  try {
    const mapTilerResponse = await fetch(mapTilerUrl, {
      headers: {
        // Pass through relevant headers if needed, or keep it simple
        Accept: req.headers.accept || "*/*",
      },
    });

    if (!mapTilerResponse.ok) {
      console.error(
        `MapTiler API Error: Status ${mapTilerResponse.status}`,
        await mapTilerResponse.text()
      );
      return res
        .status(mapTilerResponse.status)
        .json({ error: "Failed to fetch data from MapTiler." });
    }

    // Pass through headers from MapTiler to the client
    // Especially Content-Type is important for PBF, PNG, JSON etc.
    mapTilerResponse.headers.forEach((value, name) => {
      // Avoid setting "transfer-encoding" if it's "chunked" as Vercel handles this
      if (
        name.toLowerCase() !== "transfer-encoding" &&
        name.toLowerCase() !== "connection" &&
        name.toLowerCase() !== "keep-alive"
      ) {
        res.setHeader(name, value);
      }
    });

    // Stream the response body
    if (mapTilerResponse.body) {
      const reader = mapTilerResponse.body.getReader();
      const stream = new ReadableStream({
        async start(controller) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }
            controller.enqueue(value);
          }
          controller.close();
          reader.releaseLock();
        },
      });
      // Pipe the stream to Vercel's response
      // Vercel handles this well with Node.js streams
      const nodeStream = require("stream").Readable.fromWeb(stream);
      nodeStream.pipe(res);
    } else {
      res.status(200).end(); // Should have body, but handle case
    }
  } catch (error) {
    console.error("Error in mapProxy handler:", error);
    res.status(500).json({ error: "Internal server error in proxy." });
  }
}
