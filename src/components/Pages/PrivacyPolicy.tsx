import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  Eye,
  MapPin,
  Share2,
  Globe,
  Search,
} from "lucide-react";

const PrivacyPolicy = () => {
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
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-12 h-12 text-green-400 mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Integritetspolicy
            </h1>
          </div>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Transparent information om hur vi hanterar din data i PlatsGuiden
          </p>
        </div>

        {/* Innehåll */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Översikt */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <Eye className="w-6 h-6 mr-3 text-blue-400" />
              Översikt
            </h2>
            <div className="text-gray-200 space-y-4">
              <p>
                PlatsGuiden är en webbtjänst som hjälper dig hitta restauranger,
                snabbmatsställen, butiker och boende inom en 5-kilometers radie
                från din position. Vi värdesätter din integritet och är
                transparenta med hur vi hanterar din information.
              </p>
              <p className="font-semibold text-green-400">
                Viktigast av allt: Vi samlar inte in, lagrar eller delar någon
                personlig information. Alla sökningar och platsfunktioner sker
                lokalt på din enhet.
              </p>
            </div>
          </div>

          {/* Positionsdata */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <MapPin className="w-6 h-6 mr-3 text-red-400" />
              Platsinformation
            </h2>
            <div className="text-gray-200 space-y-4">
              <h3 className="text-lg font-semibold">Vad vi använder:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Din aktuella position (via webbläsarens Geolocation API) för
                  att hitta närliggande platser
                </li>
                <li>
                  En 5-kilometers sökradie för att visa relevanta restauranger
                  och butiker
                </li>
                <li>
                  Automatiska positionsuppdateringar för att hålla resultaten
                  aktuella
                </li>
              </ul>

              <h3 className="text-lg font-semibold mt-4">Vad vi INTE gör:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Sparar din positionshistorik</li>
                <li>Spårar dina rörelsemönster</li>
                <li>
                  Delar din position med tredje part (förutom för Google Maps
                  navigation)
                </li>
                <li>Lagrar din position efter att du stänger appen</li>
              </ul>
            </div>
          </div>

          {/* Sökningar och resultat */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <Search className="w-6 h-6 mr-3 text-purple-400" />
              Sökningar och resultat
            </h2>
            <div className="text-gray-200 space-y-4">
              <p>Information som visas i appen:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Platsdetaljer:</strong> Namn, adress, öppettider och
                  kontaktinformation från OpenStreetMap
                </li>
                <li>
                  <strong>Avstånd:</strong> Beräknas i realtid baserat på din
                  position
                </li>
                <li>
                  <strong>Kartor:</strong> Interaktiva kartor som visar
                  platserna relativt din position
                </li>
                <li>
                  <strong>Kategorisering:</strong> Typ av plats (restaurang,
                  snabbmat, butik, etc.)
                </li>
              </ul>
            </div>
          </div>

          {/* Externa tjänster */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <Globe className="w-6 h-6 mr-3 text-yellow-400" />
              Externa tjänster
            </h2>
            <div className="text-gray-200 space-y-4">
              <p>Vi använder följande externa tjänster:</p>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    OpenStreetMap & Overpass API
                  </h3>
                  <p className="ml-4">
                    - Används för att söka efter platser i närheten
                    <br />
                    - Din position skickas endast temporärt för sökningen
                    <br />- Ingen personlig information lagras av tjänsten
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg">Google Maps</h3>
                  <p className="ml-4">
                    - Används endast när du väljer att få vägbeskrivning
                    <br />
                    - Öppnas i en ny flik via Google Maps webb eller app
                    <br />- Vi har ingen kontroll över Googles datainsamling
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg">Delningsfunktioner</h3>
                  <p className="ml-4">
                    - Använder din enhets inbyggda delningsfunktioner
                    <br />
                    - Du väljer själv vem och hur du delar platser
                    <br />- Vi har ingen åtkomst till din delningshistorik
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dina rättigheter och kontroll */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <Shield className="w-6 h-6 mr-3 text-green-400" />
              Din kontroll
            </h2>
            <div className="text-gray-200 space-y-4">
              <p>Du har full kontroll över din information:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>Platsåtkomst:</strong> Du kan när som helst ändra
                  platsbehörigheter i din webbläsare
                </li>
                <li>
                  <strong>Sökningar:</strong> Alla sökresultat är temporära och
                  försvinner när du stänger appen
                </li>
                <li>
                  <strong>Delning:</strong> Du bestämmer själv om och när du
                  vill dela platser
                </li>
                <li>
                  <strong>Uppdateringar:</strong> Du kan stänga av automatiska
                  positionsuppdateringar
                </li>
              </ul>
            </div>
          </div>

          {/* Kontakt */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <Share2 className="w-6 h-6 mr-3 text-blue-400" />
              Kontakt & uppdateringar
            </h2>
            <div className="text-gray-200 space-y-4">
              <p>
                Denna policy uppdateras vid behov för att spegla nya funktioner
                i appen. Eftersom vi inte samlar in personuppgifter påverkar
                ändringar inte din integritet retroaktivt.
              </p>
              <p>
                <strong>Senast uppdaterad:</strong>{" "}
                {new Date().toLocaleDateString("sv-SE")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PrivacyPolicy;
