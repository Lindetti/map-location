import { motion } from "framer-motion";

const About = () => {
  return (
    <motion.div
      className="w-full p-5 flex flex-col justify-center items-center mb-5 mt-3 md:mt-2 md:mb-0"
      initial={{ opacity: 0, y: 50, scale: 0.95 }} // Börja osynlig, lite nedanför och något mindre
      animate={{ opacity: 1, y: 0, scale: 1 }} // Fade in till fullt synlig, på plats och full storlek
      transition={{ duration: 0.5, ease: "easeOut" }} // 1 sekund lång animation med mjuk easing
    >
      <div className="flex flex-col gap-2 w-full md:w-2/4">
        <div className="flex flex-col gap-2 leading-7">
          <h1 className="text-lg font-semibold">Hitta Ställen Nära Dig</h1>
          <p>
            Oavsett om du är sugen på att prova en ny restaurang till lunch,
            hitta ett café för en kopp kaffe eller utforska områdets bästa
            barer, erbjuder Platsguiden en enkel och snabb översikt över de
            bästa alternativen i närheten. 
          </p>
        </div>

        <div className="flex flex-col gap-5 leading-7">
          <div className="flex flex-col gap-3 mt-5 mb-3">
            <h1 className="text-lg font-semibold">
              Vad kan du göra på Platsguiden?
            </h1>
            <ul className="flex flex-col gap-3">
              <li className="text-gray-800">
                <span className="font-semibold text-black">
                  Hitta närmaste platser:
                </span>{" "}
                Se de 15 närmaste restaurangerna, snabbmatsställen, kaffeer och
                barer baserat på din plats. Du får även information om avstånd
                och öppettider.
              </li>

              <li className="text-gray-800">
                <span className="font-semibold text-black">
                  Visa på karta:{" "}
                </span>
                Se varje restaurang eller bar på en interaktiv karta, med din
                egen position för att göra det enklare att hitta dit.
              </li>
              <li className="text-gray-800">
                <span className="font-semibold text-black">
                  Detaljerad information:{" "}
                </span>
                Om telefonnummer, webbplats eller öppettider finns tillgängliga
                visas dessa direkt. Saknas någon information kan du enkelt söka
                efter platsen på internet via en smidig genväg.
              </li>
              <li className="text-gray-800">
                <span className="font-semibold text-black">
                  Exakt position:{" "}
                </span>
                På mobil används din GPS-position för bästa träff, medan
                användare på datorer får en uppskattad plats baserat på
                IP-adressen (vilket kan vara något mindre exakt).
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-2  mb-3">
            <h1 className="text-lg font-semibold">Kategorier i Platsguiden:</h1>
            <ul className="flex flex-col gap-2">
              <li className="text-gray-800">
                <span className="font-semibold text-black">Mat & Dryck:</span>{" "}
                Restauranger, snabbmat, kaffeer och barer.
              </li>

              <li className="text-gray-800">
                <span className="font-semibold text-black">Butiker: </span>
                Klädbutiker, skobutiker, elektronikbutiker och Systembolaget.
              </li>
              <li className="text-gray-800">
                <span className="font-semibold text-black">Boende: </span>
                Hotell och vandrarhem
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default About;
