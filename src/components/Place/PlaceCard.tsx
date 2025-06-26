import { ExtendedOverpassElement } from "../../Interfaces";

import {
  MapPin,
  Utensils,
  Clock,
  Phone,
  Globe,
  Navigation,
  Share2,
  Store,
  Hotel,
  Zap,
  Fuel,
  Bus,
} from "lucide-react";

const PlaceCard = ({
  place,
  onClick,
  typeLabel = "Restaurang",
}: {
  place: ExtendedOverpassElement;
  onClick?: () => void;
  typeLabel?: string;
}) => {
  const openInGoogleMaps = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`;
    window.open(url, "_blank");
  };

  const openGoogleMapsPlace = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`;
    window.open(url, "_blank");
  };

  const sharePlace = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: place.name || "Delad plats",
      text: `Kolla in ${place.name} på RestaurantFinder!`,
      url: `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`,
    };

    try {
      await navigator.share(shareData);
    } catch (err) {
      console.log("Error sharing:", err);
    }
  };

  // Get the proper type label for transport types
  const getTypeLabel = () => {
    if (place.tags?.amenity === "taxi") {
      return "Taxi station";
    }
    if (
      place.tags?.highway === "bus_stop" ||
      place.tags?.amenity === "bus_station"
    ) {
      return "Busshållsplats";
    }
    return typeLabel;
  };

  const getIcon = () => {
    if (place.tags?.amenity === "taxi") {
      return <Bus className="w-5 h-5 text-blue-400" />;
    }
    if (
      place.tags?.highway === "bus_stop" ||
      place.tags?.amenity === "bus_station"
    ) {
      return <Bus className="w-5 h-5 text-blue-400" />;
    }

    switch (typeLabel) {
      case "Restaurang":
        return <Utensils className="w-5 h-5 text-blue-400" />;
      case "Snabbmat":
        return <Zap className="w-5 h-5 text-blue-400" />;
      case "Butik":
        return <Store className="w-5 h-5 text-blue-400" />;
      case "Boende":
        return <Hotel className="w-5 h-5 text-blue-400" />;
      case "Bensinstationer":
        return <Fuel className="w-5 h-5 text-blue-400" />;
      default:
        return <Store className="w-5 h-5 text-blue-400" />;
    }
  };

  const showLines = () => {
    if (place.lines && place.lines.length > 0) {
      return (
        <div className="flex items-center text-gray-300 mt-2">
          <Bus className="w-4 h-4 mr-2" />
          <span className="text-sm">Linjer: {place.lines.join(", ")}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="bg-slate-800/70 backdrop-blur-md border border-slate-600 rounded-xl p-6 shadow-lg hover:bg-slate-700/70 transition-all duration-300 hover:scale-105 flex flex-col min-h-[320px]"
      onClick={onClick}
    >
      {/* Content section */}
      <div className="flex-grow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {getIcon()}
              <span className="text-sm text-gray-300">{getTypeLabel()}</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{place.name}</h3>
            <div className="space-y-2">
              <div className="flex items-center text-blue-400">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm font-semibold">
                  {place.distance < 1
                    ? `${Math.round(place.distance * 1000)} m bort`
                    : `${place.distance.toFixed(2)} km bort`}
                </span>
              </div>
              {place.lines && place.lines.length > 0 && (
                <div className="flex items-center text-blue-400">
                  <Bus className="w-4 h-4 mr-1" />
                  <span className="text-xs text-gray-300">
                    Linjer: {place.lines.join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {place.tags?.cuisine && (
            <div className="flex items-center text-gray-300">
              <Utensils className="w-4 h-4 mr-2" />
              <span className="text-sm capitalize">
                {place.tags.cuisine.replace(";", ", ")}
              </span>
            </div>
          )}

          {place.tags?.["addr:street"] && (
            <div className="flex items-center text-gray-300">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="text-sm">
                {`${place.tags["addr:street"]} ${
                  place.tags["addr:housenumber"] || ""
                }`}
              </span>
            </div>
          )}

          {place.tags?.opening_hours && (
            <div className="flex items-center text-gray-300">
              <Clock className="w-4 h-4 mr-2" />
              <span className="text-sm">{place.tags.opening_hours}</span>
            </div>
          )}

          {place.tags?.["contact:phone"] && (
            <div className="flex items-center text-gray-300">
              <Phone className="w-4 h-4 mr-2" />
              <span className="text-sm">{place.tags["contact:phone"]}</span>
            </div>
          )}

          {place.tags?.website && (
            <div className="flex items-center text-gray-300">
              <Globe className="w-4 h-4 mr-2" />
              <a
                href={place.tags.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300 underline"
                onClick={(e) => e.stopPropagation()}
              >
                Besök webbsida
              </a>
            </div>
          )}

          {showLines()}
        </div>
      </div>

      {/* Button section */}
      <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
        <button
          onClick={openInGoogleMaps}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-600  hover:to-cyan-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
        >
          <Navigation className="w-4 h-4" />
          <span>Vägbeskrivning</span>
        </button>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <button
            onClick={openGoogleMapsPlace}
            className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <MapPin className="w-4 h-4" />
            <span>Karta</span>
          </button>

          <button
            onClick={sharePlace}
            className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Dela</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;
