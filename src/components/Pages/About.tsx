import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Search,
  Navigation,
  Shield,
  Share2,
  Compass,
  Clock,
} from "lucide-react";

const About = () => {
  return (
    <motion.div
      className="w-full min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Tillbaka-knapp */}
        <Link
          to="/"
          className="inline-flex items-center text-white hover:text-gray-300 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Tillbaka till start
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Om{" "}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              PlatsGuiden
            </span>
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Din smarta guide till restauranger, butiker och mycket mer i din
            närhet
          </p>
        </div>

        {/* Innehåll */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Platssökning */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Search className="w-8 h-8 text-blue-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">
                Smart platssökning
              </h2>
            </div>
            <div className="space-y-4 text-gray-200">
              <p>
                Utforska närliggande restauranger, snabbmatsställen, butiker och
                hotell. PlatsGuiden använder OpenStreetMap-data för att hitta de
                bästa alternativen inom 5 kilometers radie från din position.
              </p>
              <p>
                Se detaljerad information om öppettider, kontaktuppgifter och
                webbplatser direkt i appen.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Navigation className="w-8 h-8 text-green-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">
                Enkel navigation
              </h2>
            </div>
            <div className="space-y-4 text-gray-200">
              <p>
                Få direkt vägbeskrivning till valfri plats via Google Maps. Se
                exakta avstånd till varje destination och välj mellan kartvy
                eller listvy för bästa överblick.
              </p>
              <p>
                Interaktiva kartor hjälper dig att hitta rätt och få en tydlig
                bild av var alla platser ligger i förhållande till din position.
              </p>
            </div>
          </div>

          {/* Realtidsuppdateringar */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Clock className="w-8 h-8 text-purple-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">
                Realtidsuppdateringar
              </h2>
            </div>
            <div className="space-y-4 text-gray-200">
              <p>
                Din position uppdateras automatiskt medan du rör dig, vilket ger
                dig alltid aktuell information om platser i närheten.
              </p>
              <p>
                Se direkt vilka platser som är öppna just nu och hur långt bort
                de ligger från din nuvarande position.
              </p>
            </div>
          </div>

          {/* Delning och integritet */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Share2 className="w-8 h-8 text-yellow-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">
                Dela och integrera
              </h2>
            </div>
            <div className="space-y-4 text-gray-200">
              <p>
                Dela intressanta platser med vänner och familj direkt från
                appen. All delning sker via din enhets inbyggda
                delningsfunktioner.
              </p>
              <p>
                Din integritet är viktig - vi sparar ingen personlig information
                och använder endast din platsdata för att visa relevanta
                resultat.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-300">
            Byggd med OpenStreetMap och Overpass API för att ge dig den bästa
            möjliga lokala sökupplevelsen.
          </p>
          <div className="flex items-center justify-center mt-4 space-x-2">
            <Compass className="w-5 h-5 text-blue-400" />
            <Shield className="w-5 h-5 text-green-400" />
            <MapPin className="w-5 h-5 text-purple-400" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default About;
