import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ExtendedOverpassElement, PlaceType } from "../../Interfaces";
import LocationPermission from "../LocationPermission";
import AutoLocationUpdater from "../AutoLocationUpdater";
import { ClipLoader } from "react-spinners";
import { MapPin, Info, Shield, LayoutGrid, Map } from "lucide-react";
import PlaceCard from "../Place/PlaceCard";
import SearchOptionsSelector from "../SearchOptionsSelector";
import PlacesMap from "../PlacesMap";
import {
  fetchRestaurants,
  fetchFastFood,
  fetchShops,
  fetchAccommodation,
  fetchGasStations,
  fetchTransport,
} from "../CategoryFetchers";

// Use the ExtendedOverpassElement from Interfaces

const Home = () => {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [nearbyPlaces, setNearbyPlaces] = useState<ExtendedOverpassElement[]>(
    []
  );
  const [showPlaces, setShowPlaces] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] =
    useState<PlaceType>("restaurant");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  // När komponenten laddas, återställ showPlaces om platsdata saknas
  useEffect(() => {
    if (!location) {
      setShowPlaces(false);
    }
  }, [location]);

  // Reset notification when starting new search
  useEffect(() => {
    if (isSearching || isUpdatingLocation) {
      setShowNotification(false);
    }
  }, [isSearching, isUpdatingLocation]);

  // Show notification when results are loaded
  useEffect(() => {
    if (!isSearching && !isUpdatingLocation && showPlaces) {
      setShowNotification(true);
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000); // Hide after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isSearching, isUpdatingLocation, showPlaces]);

  function getDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }

  const getPlacesNearby = async (lat: number, lon: number, type: PlaceType) => {
    setIsLoading(true);
    try {
      let places: ExtendedOverpassElement[] = [];

      switch (type) {
        case "restaurant":
          places = await fetchRestaurants(lat, lon, getDistance);
          break;
        case "fast_food":
          places = await fetchFastFood(lat, lon, getDistance);
          break;
        case "fuel":
          places = await fetchGasStations(lat, lon, getDistance);
          break;
        case "transport":
          places = await fetchTransport(lat, lon, getDistance);
          break;
        case "clothes":
        case "shoes":
        case "electronics":
          places = await fetchShops(lat, lon, getDistance);
          break;
        case "hotel":
        case "hostel":
          places = await fetchAccommodation(lat, lon, getDistance);
          break;
        default:
          console.warn("Unsupported category type:", type);
          places = [];
      }

      setNearbyPlaces(places);
    } catch (error) {
      console.error("Error fetching nearby places:", error);
      setNearbyPlaces([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (category: PlaceType) => {
    setSelectedCategory(category);
    setShowPlaces(false);
    setNearbyPlaces([]);
  };

  const handleFindNearby = async () => {
    if (location) {
      setIsSearching(true);
      await getPlacesNearby(location.lat, location.lon, selectedCategory);
      setShowPlaces(true);
      setIsSearching(false);
    }
  };

  const handleUpdate = async () => {
    setIsUpdatingLocation(true);
    setIsSearching(true);
    setShowPlaces(false); // Hide current results

    if ("geolocation" in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            });
          }
        );

        const newLocation = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };

        setLocation(newLocation);
        await getPlacesNearby(
          newLocation.lat,
          newLocation.lon,
          selectedCategory
        );
        setShowPlaces(true);
      } catch (error) {
        console.error("Error getting location:", error);
      } finally {
        setIsUpdatingLocation(false);
        setIsSearching(false);
      }
    }
  };

  const getCategoryButtonText = () => {
    if (isSearching) {
      switch (selectedCategory) {
        case "restaurant":
          return "Söker efter restauranger...";
        case "fast_food":
          return "Söker efter snabbmat...";
        case "clothes":
        case "shoes":
        case "electronics":
          return "Söker efter butiker...";
        case "hotel":
        case "hostel":
          return "Söker efter boende...";
        case "fuel":
          return "Söker efter bensinstationer...";
        case "transport":
          return "Söker efter buss eller texi...";
        default:
          return "Söker efter platser...";
      }
    }

    switch (selectedCategory) {
      case "restaurant":
        return "Hitta restauranger nära mig";
      case "fast_food":
        return "Hitta snabbmat nära mig";
      case "clothes":
      case "shoes":
      case "electronics":
        return "Hitta butiker nära mig";
      case "hotel":
      case "hostel":
        return "Hitta boende nära mig";
      case "fuel":
        return "Hitta bensinstationer nära mig";
      case "transport":
        return "Hitta buss eller taxi nära mig";
      default:
        return "Hitta platser nära mig";
    }
  };

  const getCategoryTypeLabel = (type: PlaceType): string => {
    switch (type) {
      case "restaurant":
        return "Restaurang";
      case "fast_food":
        return "Snabbmat";
      case "clothes":
      case "shoes":
      case "electronics":
        return "Butiker";
      case "hotel":
      case "hostel":
        return "Boende";
      case "fuel":
        return "Bensinstationer";
      case "transport":
        return "Busshållplats/Taxi";
      default:
        return type;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen text-white relative">
      {/* Background gradient - positioned below hero */}
      <div className="absolute inset-0 bg-gradient-to-br" />

      {/* Hero section with solid background */}
      <div className="relative w-full pt-16 h-[350px] ">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/20 to-blue-900/20"></div>
        <div className="relative w-full px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-3 md:p-4 mr-4">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              Plats
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Guiden
              </span>
            </h1>
          </div>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-4xl mx-auto leading-relaxed">
            Upptäck fantastiska restauranger, snabbmat, butiker och boende i din
            närhet
          </p>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Link
              to="/om"
              className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-full transition-all duration-300"
            >
              <Info className="w-4 h-4 mr-2" />
              Om appen
            </Link>
            <Link
              to="/privacypolicy"
              className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-full transition-all duration-300"
            >
              <Shield className="w-4 h-4 mr-2" />
              Integritetspolicy
            </Link>
          </div>
        </div>
      </div>

      {/* Category grid - directly under hero */}
      <SearchOptionsSelector
        selectedType={selectedCategory}
        onTypeChange={handleCategorySelect}
      />

      {/* Main content */}
      <div className="w-full flex-1 relative z-10 mt-6 mb-10">
        {!showPlaces && (
          <div className="flex gap-2 items-center justify-center mt-0 md:mt-4">
            <button
              onClick={handleFindNearby}
              disabled={isSearching}
              className={`
    relative overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-600 
        hover:from-blue-600 hover:to-cyan-700 text-white font-bold py-4 px-8 
        rounded-full shadow-xl transform transition-all duration-300 
        inline-flex items-center gap-3
        ${isSearching ? "scale-95" : "hover:scale-105"} 
        ${isSearching ? "animate-pulse-glow" : ""}
        disabled:cursor-not-allowed
      `}
            >
              <span className="flex items-center">
                {isSearching ? (
                  <ClipLoader color="#ffffff" size={20} />
                ) : (
                  <MapPin className="h-5 w-5" />
                )}
              </span>
              <span>{getCategoryButtonText()}</span>
            </button>
          </div>
        )}

        {/* Location handlers */}
        <LocationPermission
          onLocationReceived={(pos: GeolocationPosition) =>
            setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude })
          }
        />

        {location && (
          <AutoLocationUpdater
            onLocationUpdate={(pos: GeolocationPosition) =>
              setLocation({
                lat: pos.coords.latitude,
                lon: pos.coords.longitude,
              })
            }
          />
        )}

        {/* Results section */}
        {showPlaces && (
          <div className="w-full md:max-w-[90rem] mx-auto px-4 md:px-8">
            {location && (
              <>
                {/* Info */}
                <div className="mb-5 md:mb-8 max-w-[90rem] mx-auto md:px-4">
                  <div className="bg-slate-800/80 backdrop-blur-md border border-slate-600 text-slate-200 shadow-lg p-4 rounded-lg">
                    <div className="flex gap-2 items-center justify-center">
                      <Info className="h-4 w-4 text-blue-300 mt-1" />
                      <p className="text-gray-200 text-sm ">
                        <strong>Observera:</strong> Viss information kan vara
                        inaktuell. Vissa platser kan ha stängt permanent,
                        flyttat eller förändrats utan att det ännu har
                        uppdaterats i tjänsten.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mb-6 md:mb-4 max-w-[90rem] mx-auto px-4 md:px-8">
                  <div className="inline-flex items-center bg-slate-800/80 backdrop-blur-md border border-slate-600 text-slate-200 shadow-lg rounded-full px-6 py-3">
                    <MapPin className="h-5 w-5 mr-2" />
                    Din position: {location.lat.toFixed(4)},{" "}
                    {location.lon.toFixed(4)}
                  </div>
                </div>
              </>
            )}

            <div className="flex flex-col md:flex-row md:justify-between mb-4 px-4">
              <h2 className="text-2xl font-bold text-center md:text-left order-2 md:order-1 mt-8 md:mt-0">
                {selectedCategory === "restaurant"
                  ? "Restauranger"
                  : selectedCategory === "fast_food"
                  ? "Snabbmat"
                  : getCategoryTypeLabel(selectedCategory)}{" "}
                i närheten ({nearbyPlaces.length})
              </h2>
              <div className="flex justify-center md:justify-end items-center gap-4 order-1 md:order-2">
                <div className="bg-slate-800/80 backdrop-blur-md border border-slate-600 text-slate-200 shadow-lg rounded-lg p-1 flex gap-1 ">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-colors flex items-center gap-2 ${
                      viewMode === "grid"
                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                        : "text-white hover:bg-slate-700/70"
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span>Lista</span>
                  </button>
                  <button
                    onClick={() => setViewMode("map")}
                    className={`p-2 rounded-md transition-colors flex items-center gap-2 ${
                      viewMode === "map"
                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                        : "text-white hover:bg-slate-700/70"
                    }`}
                  >
                    <Map className="w-4 h-4" />
                    <span>Karta</span>
                  </button>
                </div>
                <button
                  onClick={handleUpdate}
                  disabled={isUpdatingLocation || isSearching}
                  className="bg-slate-800/80 backdrop-blur-md border border-slate-600 hover:bg-slate-700/80 text-slate-200 font-semibold py-2 px-6 rounded-full transition-all duration-300 shadow-lg"
                >
                  {isUpdatingLocation || isSearching ? (
                    <>
                      <ClipLoader color="#ffffff" size={16} />
                      <span>Uppdaterar...</span>
                    </>
                  ) : (
                    <>
                      <span>Uppdatera</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {isLoading || isUpdatingLocation || (isSearching && !showPlaces) ? (
              <div className="flex flex-col items-center justify-center py-12">
                <ClipLoader color="#ffffff" size={40} className="mb-4" />
                <p className="text-white text-lg">
                  {isUpdatingLocation
                    ? "Uppdaterar position..."
                    : `Söker ${getCategoryTypeLabel(
                        selectedCategory
                      ).toLowerCase()}er...`}
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:px-4">
                {nearbyPlaces.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={{
                      ...place,
                      name: place.tags?.name || place.name || "",
                      lat: place.lat || place.center?.lat || 0,
                      lon: place.lon || place.center?.lon || 0,
                      type: place.type || "node",
                      id: place.id || Math.random(),
                      distance: place.distance || 0,
                      tags: place.tags || {},
                    }}
                    onClick={() => {}}
                    typeLabel={getCategoryTypeLabel(selectedCategory)}
                    // icon prop removed as we now use Lucide icons directly in PlaceCard
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden shadow-lg h-[400px]">
                <PlacesMap
                  places={nearbyPlaces}
                  userLocation={location}
                  selectedCategory={selectedCategory}
                />
              </div>
            )}

            {nearbyPlaces.length === 0 && !isLoading && (
              <div className="bg-blue-200 bg-opacity-50 p-8 rounded-lg text-center mx-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto mb-4 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p>
                  Inga platser hittades i närheten. Försök med en annan kategori
                  eller uppdatera din position.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results notification */}
      {showNotification && nearbyPlaces.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white text-black px-6 py-4 rounded-lg shadow-lg transform transition-all duration-500 ease-in-out opacity-90 hover:opacity-100 z-50">
          <p className="font-medium">Platser hittade!</p>
          <p className="text-sm text-blue-800">
            Hittade {nearbyPlaces.length}{" "}
            {selectedCategory === "restaurant"
              ? "restauranger"
              : selectedCategory === "fast_food"
              ? "snabbmatsställen"
              : selectedCategory === "hotel" || selectedCategory === "hostel"
              ? "boenden"
              : selectedCategory === "fuel"
              ? "bensinstationer"
              : selectedCategory === "transport"
              ? "transportalternativ"
              : "butiker"}{" "}
            i närheten.
          </p>
        </div>
      )}

      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 py-8 w-full mt-5">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-300">
            Byggd med Overpass API och Geolocation
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
