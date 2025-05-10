import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
          setCopyright(copyrightInfo); 
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
    <footer className="p-4 bg-gray-800 dark:bg-[#202020] text-gray-400 text-center w-full h-[250px] md:h-[200px] flex flex-col gap-8 items-center justify-center">
      <p>
        <span className="text-white font-semibold">
          © 2025 Platsguiden<span className="text-orange-500 text-3xl">.</span>
        </span>{" "}
        {copyright ? copyright : ""}
      </p>

      <div className="w-full flex justify-center">
        <Link to="/privacypolicy">
          <p className="text-orange-500">Privacy Policy</p>
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
