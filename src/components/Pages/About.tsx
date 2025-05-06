import { motion } from "framer-motion";
import HeroImage from "../../assets/homeImages/about.jpg";

const About = () => {
  return (
    <motion.div
      className="w-full p-5 flex flex-col justify-center items-center mb-5 mt-3 md:mt-2 md:mb-0"
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex flex-col gap-8 w-full lg:w-2/4">
        {/* Header Section */}
        <div className="relative h-[300px] w-full rounded-md overflow-hidden shadow-md">
          <img
            src={HeroImage}
            alt="Hero"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-60 dark:bg-opacity-55 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Om Platsguiden<span className="text-orange-500">.</span>
              </h1>
              <p className="text-lg md:text-xl">
                Din guide till de bästa platserna i närheten
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col gap-8">
          {/* Introduction */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg md:text-2xl font-semibold text-gray-800 dark:text-gray-300">
              Hitta Ställen Nära Dig
            </h2>
            <p className="text-gray-600 dark:text-gray-200 leading-relaxed">
              Oavsett om du är sugen på att prova en ny restaurang till lunch,
              hitta ett café för en kopp kaffe eller utforska områdets bästa
              barer, erbjuder Platsguiden en enkel och snabb översikt över de
              bästa alternativen i närheten.
            </p>
          </div>

          {/* Features */}
          <div className="flex flex-col gap-6">
            <h2 className="text-lg md:text-2xl font-semibold text-gray-800 dark:text-gray-300">
              Vad kan du göra på Platsguiden
              <span className="text-orange-500">?</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-white dark:bg-[#282828] rounded-lg shadow-sm dark:border-[1.5px] dark:border-[#ffffff20]">
                <h3 className="font-semibold text-gray-800 dark:text-gray-300 mb-2">
                  Hitta närmaste platser 📍
                </h3>
                <p className="text-gray-600 dark:text-gray-200">
                  Se de 15 närmaste restaurangerna, snabbmatsställen, kaffeer
                  och barer baserat på din plats. Du får även information om
                  avstånd och öppettider.
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-[#282828] rounded-lg shadow-sm dark:border-[1.5px] dark:border-[#ffffff20]">
                <h3 className="font-semibold text-gray-800 dark:text-gray-300 mb-2">
                  Visa på karta 🗺️
                </h3>
                <p className="text-gray-600 dark:text-gray-200">
                  Se varje restaurang eller bar på en interaktiv karta, med din
                  egen position för att göra det enklare att hitta dit.
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-[#282828] rounded-lg shadow-sm dark:border-[1.5px] dark:border-[#ffffff20]">
                <h3 className="font-semibold text-gray-800 dark:text-gray-300 mb-2">
                  Detaljerad information ℹ️
                </h3>
                <p className="text-gray-600 dark:text-gray-200">
                  Om telefonnummer, webbplats eller öppettider finns
                  tillgängliga visas dessa direkt. Saknas någon information kan
                  du enkelt söka efter platsen på internet via en smidig genväg.
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-[#282828] rounded-lg shadow-sm dark:border-[1.5px] dark:border-[#ffffff20]">
                <h3 className="font-semibold text-gray-800 dark:text-gray-300 mb-2">
                  Exakt position 📡
                </h3>
                <p className="text-gray-600 dark:text-gray-200">
                  På mobil används din GPS-position för bästa träff, medan
                  användare på datorer får en uppskattad plats baserat på
                  IP-adressen (vilket kan vara något mindre exakt).
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-[#282828] rounded-lg shadow-sm dark:border-[1.5px] dark:border-[#ffffff20]">
                <h3 className="font-semibold text-gray-800 dark:text-gray-300 mb-2">
                  Aktivera GPS 📡
                </h3>
                <p className="text-gray-600 dark:text-gray-200">
                  Med funktionen "Aktivera GPS" får du realtidsuppdatering av
                  din position och den valda platsen, så att du alltid vet var
                  du är och om du börjar närma dig stället du letar efter.
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-[#282828] rounded-lg shadow-sm dark:border-[1.5px] dark:border-[#ffffff20]">
                <h3 className="font-semibold text-gray-800 dark:text-gray-300 mb-2">
                  Väder på aktuell plats 🌤️
                </h3>
                <p className="text-gray-600 dark:text-gray-200">
                  Få väderinformation baserat på din aktuella position – så att
                  du alltid vet om det är bra väder att ge sig ut på en promenad
                  till din nästa destination.
                </p>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-col gap-6">
            <h2 className="text-lg md:text-2xl font-semibold text-gray-800 dark:text-gray-300">
              Kategorier i Platsguiden
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-[#282828] rounded-lg shadow-sm dark:border-[1.5px] dark:border-[#ffffff20]">
                <h3 className="font-semibold text-gray-800 dark:text-gray-300 mb-2">
                  Mat & Dryck
                </h3>
                <p className="text-gray-600 dark:text-gray-200">
                  Restauranger, Livsmedel, kiosker, snabbmat, kaffeer och barer
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-[#282828] rounded-lg shadow-sm dark:border-[1.5px] dark:border-[#ffffff20]">
                <h3 className="font-semibold text-gray-800 dark:text-gray-300 mb-2">
                  Butiker
                </h3>
                <p className="text-gray-600 dark:text-gray-200">
                  kläder, skor, elektronik och Systembolag
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-[#282828] rounded-lg shadow-sm dark:border-[1.5px] dark:border-[#ffffff20]">
                <h3 className="font-semibold text-gray-800 dark:text-gray-300 mb-2">
                  Boende
                </h3>
                <p className="text-gray-600 dark:text-gray-200">
                  Hotell och vandrarhem
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-[#282828] rounded-lg shadow-sm dark:border-[1.5px] dark:border-[#ffffff20]">
                <h3 className="font-semibold text-gray-800 dark:text-gray-300 mb-2">
                  Vård & Hälsa
                </h3>
                <p className="text-gray-600 dark:text-gray-200">
                  Hitta vård och apotek nära dig
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default About;
