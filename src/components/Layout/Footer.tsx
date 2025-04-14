import { useEffect, useState } from "react";

const Footer = () => {
  const [copyright, setCopyright] = useState<string | null>(null);

  useEffect(() => {
    const fetchCopyright = async () => {
      try {
        const response = await fetch(
          "https://overpass-api.de/api/interpreter?data=[out:json];node(around:5000,59.3293,18.0686)[amenity=restaurant];out;"
        );

        if (response.ok) {
          const data = await response.json();
          const copyrightInfo = data.osm3s.copyright;
          setCopyright(copyrightInfo); // Sätt copyright-infon
        } else {
          setCopyright("Kunde inte hämta copyright-info");
        }
      } catch {
        setCopyright("Något gick fel vid hämtning av copyright-info");
      }
    };

    fetchCopyright();
  }, []);

  return (
    <footer className="p-4 bg-gray-800 text-gray-400 text-center w-full h-[150px] md:h-[100px] flex items-center justify-center">
      <p>
        <span className="text-white font-semibold">
          © 2025 Platsguiden<span className="text-orange-500 text-3xl">.</span>
        </span>{" "}
        {copyright ? copyright : ""}
      </p>
    </footer>
  );
};

export default Footer;
