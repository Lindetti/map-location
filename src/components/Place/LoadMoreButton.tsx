import { LoadMoreButtonProps } from "../../Interfaces";

const LoadMoreButton = ({
  isLoading,
  visibleCount,
  maxCount = 15,
  onClick,
}: LoadMoreButtonProps) => {
  if (isLoading) return null;

  if (visibleCount < maxCount) {
    return (
      <button
        className="mt-4 px-4 py-2 bg-[#FCF9F8] border border-gray-300 font-semibold rounded hover:bg-[#FFF8F5] hover:text-[#C53C07]"
        onClick={onClick}
      >
        Visa mer
      </button>
    );
  }

  return (
    <button
      className="mt-4 px-4 py-2 border border-orange-500 text-[#C2410C] hover:text-[#9A2A06] rounded font-semibold"
      onClick={onClick}
    >
      {visibleCount === maxCount ? "Visa mindre" : "Visa mer"}
    </button>
  );
};

export default LoadMoreButton;
