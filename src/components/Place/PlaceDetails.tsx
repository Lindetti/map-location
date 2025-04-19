import Map from "../Map";
import { PlaceDetailsProps } from "../../Interfaces";
import Phone from "../../assets/icons/phone.png";
import Email from "../../assets/icons/email.png";
import Link from "../../assets/icons/link.png";
import Open from "../../assets/icons/open.png";

const PlaceDetails = ({
  place,
  onShowUserPosition,
  showUserPosition,
  showPolyline,
  icon,
  city,
}: PlaceDetailsProps) => {
  const translateCuisine = (cuisine: string): string => {
    const translations: Record<string, string> = {
      burger: "Hamburgare",
      italian_pizza: "Italiensk pizza",
      pizza: "Pizza",
      sushi: "Sushi",
      chinese: "Kinesiskt",
      japanese: "Japanskt",
      american: "Amerikanskt",
      greek: "Grekiskt",
      indian: "Indiskt",
      kebab: "Kebab",
      mexican: "Mexikanskt",
      thai: "Thailändskt",
      coffee_shop: "Café",
      cafe: "Café",
      bakery: "Bageri",
      fast_food: "Snabbmat",
      sandwich: "Smörgåsar",
      seafood: "Skaldjur",
      asian: "Asiatiskt",
      italian: "Italienskt",
      steak_house: "Grill",
      bubble_tea: "Bubbelte",
      regional: "Husmanskost",
    };

    const trimmed = cuisine.trim().toLowerCase();
    return (
      translations[trimmed] ??
      trimmed
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
  };

  return (
    <div className="h-auto flex flex-col gap-5 border-t-2 border-gray-200">
      <div className="h-[350px] mt-5">
        <Map
          lat={place.lat}
          lon={place.lon}
          name={place.name}
          showUserPosition={showUserPosition}
          showPolyLine={showPolyline}
        />
      </div>

      <div className="flex flex-col gap-8 md:gap-0 md:flex-row md:justify-between md:items-center">
        <div className="flex flex-col gap-5 p-2 w-full ">
          <div className="flex flex-col gap-2">
            {place.cuisine && (
              <div className="flex gap-2 items-center">
                <img src={icon} alt="link icon" className="h-6 w-6" />
                {(place.cuisine ?? "")
                  .split(";")
                  .slice(0, 3)
                  .map((cuisine) => translateCuisine(cuisine))
                  .join(", ")}
              </div>
            )}

            <div className="flex flex-col gap-2">
              {place.brand && (
                <div className="flex gap-2 items-center">
                  <p className="text-gray-500"> Hotellkedja:</p>
                  <p className="font-semibold text-gray-500">{place.brand}</p>
                </div>
              )}
              {place.operator && (
                <div className="flex gap-2 items-center">
                  <p className="text-gray-500"> Hotellkedja:</p>
                  <p className="font-semibold text-gray-500">
                    {place.operator}
                  </p>
                </div>
              )}
              {place.levels && (
                <div className="flex gap-2 items-center">
                  <p className="text-gray-500">Antal våningar:</p>
                  <p className="font-semibold text-gray-500">{place.levels}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {place.phone && (
                <div className="flex gap-2 items-center">
                  <img src={Phone} alt="phone icon" className="h-5 w-5" />
                  <a
                    href={`${place.phone}`}
                    className="text-blue-500 hover:underline"
                  >
                    {place.phone}
                  </a>
                </div>
              )}
              {place.email && (
                <div className="flex gap-2 items-center">
                  <img src={Email} alt="link icon" className="h-5 w-5" />
                  <a
                    href={`mailto:${place.email}`}
                    className="text-blue-500 hover:underline"
                  >
                    {place.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {place.openingHours && (
            <div className="flex flex-col gap-1">
              <div className="flex gap-2 items-center">
                <img src={Open} alt="open icon" className="h-5 w-5" />
                <p>Öppettider:</p>
              </div>
              <ul className="list-none pl-1 text-gray-500">
                {place.openingHours.split(";").map((hour, i) => (
                  <li key={i}>{hour.trim()}</li>
                ))}
              </ul>
            </div>
          )}
          {place.website ? (
            <></>
          ) : (
            <div>
              <p className="text-sm text-gray-500">
                Om du känner att informationen är otillräcklig, prova gärna att
                söka vidare via webben – du hittar knappen "Sök på Google" här
                nedanför.
              </p>
            </div>
          )}

          <div className="flex justify-between p-1">
            {place.website ? (
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#F97316] hover:text-[#C2410C] font-semibold text-sm underline"
              >
                <img src={Link} alt="link icon" className="h-4 w-4" />
                Besök webbplats
              </a>
            ) : (
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(
                  place.name + " " + city
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#F97316] hover:text-[#C2410C] font-semibold text-sm underline"
              >
                <img src={Link} alt="link icon" className="h-4 w-4" />
                Sök på Google
              </a>
            )}

            <button
              className="group flex items-center gap-2 text-sm bg-[#FCF9F8] text-black px-3 h-[35px] border border-gray-300 rounded hover:bg-[#FFF8F5] hover:text-[#C53C07] font-semibold transition"
              onClick={onShowUserPosition}
            >
              Visa min position
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetails;
