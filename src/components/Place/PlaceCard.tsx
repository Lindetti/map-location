import { useEffect, useState } from "react";
import Location from "../../assets/icons/location.png";
import ArrowUp from "../../assets/icons/arrowUp.png";
import ArrowDown from "../../assets/icons/arrowDown.png";
import ArrowUpDarkMode from "../../assets/icons/arrowUpDarkMode.png";
import ArrowDownDarkmode from "../../assets/icons/arrowDownDarkMode.png";
import { PlaceCardProps } from "../../Interfaces";
import OpeningHours from "opening_hours";

const PlaceCard = ({
  place,
  isExpanded,
  onClick,
  typeLabel = "Restaurang",
  icon,
}: PlaceCardProps) => {
  const now = new Date();
  let isOpen: boolean | null = null;
  let nextChange: Date | null | undefined;

  if (place.openingHours) {
    try {
      const oh = new OpeningHours(place.openingHours);
      isOpen = oh.getState(now); // true/false beroende på aktuell tid
      nextChange = oh.getNextChange(now);
    } catch (err) {
      console.warn("Kunde inte tolka opening_hours:", err);
    }
  }

  return (
    <div className="flex flex-col gap-4 cursor-pointer" onClick={onClick}>
      <div className="flex justify-between">
        <div className="flex gap-2">
          <div className="h-[25px] w-[25px]">
            <img
              className="w-full h-full object-cover"
              src={icon}
              alt={`${typeLabel} ikon`}
            />
          </div>
          <div className="flex flex-col">
            <div className="w-[180px] md:w-[450px]">
              <p className="text-base md:text-lg font-semibold leading-5 truncate">
                {place.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-orange-400">
                {typeLabel}
              </p>
              {isOpen !== null && (
                <div className="flex gap-2 items-center mt-2">
                  <div
                    className={`text-sm font-medium py-1 px-2 rounded-md text-white ${
                      isOpen ? "bg-green-600" : "bg-red-500"
                    }`}
                  >
                    {isOpen ? "Öppet nu" : "Stängt"}
                  </div>
                  {nextChange && (
                    <p className="text-xs text-gray-500 dark:text-gray-300">
                      {isOpen
                        ? `Stänger kl. ${nextChange.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`
                        : `Öppnar kl. ${nextChange.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="h-[36px] flex items-center rounded-md bg-[#FFF8F5]">
            <div className="flex items-center gap-2 p-2">
              <p className="font-semibold text-sm md:text-base text-[#C53C07] dark:text-gray-800">
                {place.distance < 1
                  ? `${Math.round(place.distance * 1000)} m`
                  : `${place.distance.toFixed(2)} km`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        {place.address ? (
          <div className="flex gap-1 items-center pl-7">
            <div className="h-[18px] w-[18px]">
              <img
                className="w-full h-full object-cover"
                src={Location}
                alt="location icon"
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-300">
              {place.address}
            </p>
          </div>
        ) : (
          <div></div>
        )}

        <span className="text-xl">
          <img
            src={isExpanded ? ArrowUp : ArrowDown}
            alt="toggle arrow"
            className="h-4 w-4 block dark:hidden"
          />
          <img
            src={isExpanded ? ArrowUpDarkMode : ArrowDownDarkmode}
            alt="toggle arrow dark"
            className="h-4 w-4 hidden dark:block"
          />
        </span>
      </div>
    </div>
  );
};

export default PlaceCard;
