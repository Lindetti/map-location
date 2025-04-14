import Location from "../../assets/icons/location.png";
import ArrowUp from "../../assets/icons/arrowUp.png";
import ArrowDown from "../../assets/icons/arrowDown.png";
import { PlaceCardProps } from "../../Interfaces";

const PlaceCard = ({
  place,
  isExpanded,
  onClick,
  typeLabel = "Restaurang",
  icon,
}: PlaceCardProps) => {
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
          </div>
            <p className="text-sm text-gray-500">{typeLabel}</p>
          </div>
        </div>

        <div className="bg-[#FFF8F5] h-[36px] flex items-center rounded-md">
          <p className="text-[#C53C07] font-semibold p-2 text-sm md:text-base ">
            {place.distance < 1
              ? `${Math.round(place.distance * 1000)} m`
              : `${place.distance.toFixed(2)} km`}
          </p>
        </div>
      </div>

      <div className="flex justify-between">
        {place.address ? (
          <div className="flex gap-1 items-center pl-1">
            <div className="h-[18px] w-[18px]">
              <img
                className="w-full h-full object-cover"
                src={Location}
                alt="location icon"
              />
            </div>
            <p className="text-sm text-gray-500">{place.address}</p>
          </div>
        ) : (
          <div></div>
        )}

        <span className="text-xl">
          <img
            src={isExpanded ? ArrowUp : ArrowDown}
            alt="toggle arrow"
            className="h-4 w-4"
          />
        </span>
      </div>
    </div>
  );
};

export default PlaceCard;
