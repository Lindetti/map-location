import { useState, useEffect, useRef } from "react";
import { ClipLoader, PulseLoader } from "react-spinners";
import { HeaderProps } from "../../Interfaces";
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className=" flex flex-col gap-4 w-full lg:w-2/4 mt-3 md:mt-2">
      {isHome ? (
        <div className="w-full lg:w-[800px] ">
          <div className="flex flex-col gap-1">
            <p className="lg:text-lg text-gray-500 dark:text-gray-300">
              Upptäck vad som finns runt dig – från lokala matställen till
              praktiska boendealternativ.
            </p>
            <div className="flex gap-1.5 items-center dark:text-gray-300">
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
          <div className="flex flex-col gap-1 dark:text-gray-300 text-gray-700">
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
              <div className="relative flex flex-grow" ref={dropdownRef}>
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
                  <ul className="absolute z-10 mt-11 w-[160px] bg-white dark:bg-[#1e1e1e] dark:text-gray-300 border border-gray-300 dark:border-gray-500 rounded shadow-md">
                    {placeOptions.map((option) => (
                      <li
                        key={option.value}
                        onClick={() => {
                          onTypeChange(option.value);
                          setIsDropdownOpen(false);
                        }}
                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 ${
                          selectedType === option.value
                            ? "font-bold bg-slate-100 dark:bg-gray-700"
                            : ""
                        }`}
                      >
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
