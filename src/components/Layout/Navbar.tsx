import { useState } from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleMenuClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="flex bg-gray-100 h-[120px] md:h-[100px] w-full items-center justify-center px-4 relative">
      <div className="w-full md:w-2/4 flex flex-col gap-3 md:flex-row justify-between items-center">
        <NavLink to="/">
          <h1 className="font-semibold text-2xl">
            Platsguiden<span className="text-orange-500 text-3xl">.</span>
          </h1>
        </NavLink>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-5 font-semibold text-lg">
          <NavLink to="/">Matställen</NavLink>
          <NavLink to="/barer">Barer</NavLink>
          <NavLink to="/mataffärer">Mataffärer</NavLink>
          <NavLink to="/om">Om platsguiden</NavLink>
        </div>

        {/* Mobile Menu (Hamburger) */}
        <div className="md:hidden">
          <button
            onClick={handleMenuClick}
            className="flex flex-col gap-1.5 items-end"
          >
            <div className="w-8 h-1 bg-black"></div>
            <div className="w-6 h-1 bg-black"></div>
            <div className="w-4 h-1 bg-black"></div>
          </button>
        </div>
      </div>

      {/* Overlay and Sliding Menu */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
            onClick={handleMenuClick}
          ></div>

          {/* Sliding Menu */}
          <div className="fixed top-0 right-0 h-full w-1/2 bg-gray-800 text-white z-50 shadow-lg transition-transform transform translate-x-0">
            <button
              onClick={handleMenuClick}
              className="absolute top-4 right-4 text-white text-2xl"
            >
              &times;
            </button>
            <nav className="flex flex-col gap-4 p-6 mt-10">
              <NavLink
                to="/"
                className="block text-lg hover:text-orange-500"
                onClick={handleMenuClick}
              >
                Matställen
              </NavLink>
              <NavLink
                to="/barer"
                className="block text-lg hover:text-orange-500"
                onClick={handleMenuClick}
              >
                Barer
              </NavLink>
              <NavLink
                to="/mataffärer"
                className="block text-lg hover:text-orange-500"
                onClick={handleMenuClick}
              >
                Mataffärer
              </NavLink>
              <NavLink
                to="/om"
                className="block text-lg hover:text-orange-500"
                onClick={handleMenuClick}
              >
                Om platsguiden
              </NavLink>
            </nav>

            <div className=" w-full flex justify-center mt-10">
              <h1 className="font-semibold text-2xl">
                Platsguiden<span className="text-orange-500 text-3xl">.</span>
              </h1>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
