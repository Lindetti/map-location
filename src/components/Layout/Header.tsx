import { useState } from "react";
import { ClipLoader, PulseLoader } from "react-spinners";
import { HeaderProps, iconMapping } from "../../Interfaces";
import Refresh1 from "../../assets/icons/refresh1.png";
import Refresh2 from "../../assets/icons/refresh2.png";

const Header = ({
  city,
  isLoading,
  onRefresh,
  placeType,
  selectedType,
  placeOptions,
  onTypeChange,
  showTypeSelect,
  isHome = false,
}: HeaderProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className=" flex flex-col gap-4 w-full md:w-2/4 mt-3 md:mt-2">
      {isHome ? (
        <div className="w-full md:w-[550px] ">
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-gray-500">
              Upptäck restauranger, butiker och boenden i närheten där du
              befinner dig.
            </p>
            <div className="flex gap-1.5 items-center">
              <em>Du befinner dig i </em>
              {city ? (
                <p className="font-semibold">{city}</p>
              ) : (
                <PulseLoader color="#F97316" loading={true} size={5} />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className=" w-full flex flex-col gap-4 md:gap-0 md:flex-row md:justify-between mb-3 items-start">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl md:text-3xl font-bold">
              {placeType} i närheten
            </h1>
            <div className="flex gap-1.5 items-center">
              <em>Du befinner dig i </em>
              {city ? (
                <p className="font-semibold">{city}</p>
              ) : (
                <PulseLoader color="#F97316" loading={true} size={5} />
              )}
            </div>
          </div>
          <div className="flex gap-2 relative justify-center">
            {showTypeSelect && placeOptions && selectedType && onTypeChange && (
              <div className="relative flex flex-grow">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-between w-[160px] text-sm bg-[#FCF9F8] px-3 h-[40px] border border-gray-300 rounded font-semibold"
                >
                  {placeOptions.find((option) => option.value === selectedType)
                    ?.label || "Välj"}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transform transition-transform ${
                      isDropdownOpen ? "rotate-180" : "rotate-0"
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {isDropdownOpen && (
                  <ul className="absolute z-10 mt-10 w-[160px] bg-white border border-gray-300 rounded shadow-md">
                    {placeOptions
                      .filter((option) => option.value !== selectedType) // Ta bort valt alternativ
                      .map((option) => (
                        <li
                          key={option.value}
                          onClick={() => {
                            onTypeChange(option.value);
                            setIsDropdownOpen(false);
                          }}
                          className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                            selectedType === option.value
                              ? "font-bold bg-[#FCF9F8]"
                              : ""
                          }`}
                        >
                          {iconMapping[
                            option.value as keyof typeof iconMapping
                          ] && (
                            <img
                              src={
                                iconMapping[
                                  option.value as keyof typeof iconMapping
                                ]
                              } // Hämta rätt ikon från iconMapping
                              alt={`${option.value} icon`}
                              className="h-5 w-5 mr-2 inline" // Lägg till margin till höger för att separera ikonen och texten
                            />
                          )}
                          {option.label}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center gap-2 text-sm bg-[#FCF9F8] px-3 h-[40px] border border-gray-300 rounded font-semibold">
                <ClipLoader color="#F97316" loading={true} size={20} />
                <span className="text-sm text-gray-600">
                  Hämtar position...
                </span>
              </div>
            ) : (
              <button
                onClick={onRefresh}
                className="group flex items-center gap-2 text-sm bg-[#FCF9F8] text-black px-3 h-[40px] border border-gray-300 rounded hover:bg-[#FFF8F5] hover:text-[#C53C07] font-semibold transition"
              >
                <img
                  src={Refresh1}
                  alt="refresh"
                  className="h-5 w-5 group-hover:hidden"
                />
                <img
                  src={Refresh2}
                  alt="refresh hover"
                  className="h-5 w-5 hidden group-hover:block"
                />
                Uppdatera position
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
