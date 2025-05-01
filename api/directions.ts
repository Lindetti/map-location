import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { start, end, profile = 'driving-car' } = req.query;

  if (!start || !end) {
    return res.status(400).json({ error: "Start och end krävs som query-parametrar." });
  }

  const apiKey = process.env.ORS_KEY;
  if (!apiKey) {
    console.error("ORS_KEY saknas i miljövariabler.");
    return res.status(500).json({ error: "Servern saknar ORS API-nyckel." });
  }

  const url = `https://api.openrouteservice.org/v2/directions/${profile}?start=${start}&end=${end}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: apiKey,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ORS svarade med fel:", errorText);
      return res.status(response.status).json({ error: "Fel från ORS", details: errorText });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error("Fetch misslyckades:", err);
    return res.status(500).json({ error: "Något gick fel vid kontakt med ORS." });
  }
}