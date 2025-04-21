import { useState } from "react";
import { NavLink } from "react-router-dom";
import Logo from "../../assets/icons/logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleMenuClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="flex bg-gray-100 h-[130px] md:h-[100px] w-full items-center justify-center px-4 relative font-sans">
      <div className="w-full md:w-2/4 flex flex-col gap-3 md:flex-row justify-between items-center">
        <NavLink to="/">
          <img src={Logo} alt="Logo" className="h-[45px] w-[230px]" />
        </NavLink>

        {/* Desktop Menu */}

        <div className="hidden md:flex gap-5 font-semibold text-lg">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "text-black underline underline-offset-8 decoration-orange-500"
                : "text-black hover hover:text-orange-600 transition ease-in-out duration-200"
            }
          >
            Hem
          </NavLink>
          <NavLink
            to="/mat&dryck"
            className={({ isActive }) =>
              isActive
                ? "text-black underline underline-offset-8 decoration-orange-500"
                : "text-black hover hover:text-orange-600 transition ease-in-out duration-200"
            }
          >
            Mat & Dryck
          </NavLink>
          <NavLink
            to="/butiker"
            className={({ isActive }) =>
              isActive
                ? "text-black underline underline-offset-8 decoration-orange-500"
                : "text-black hover hover:text-orange-600 transition ease-in-out duration-200"
            }
          >
            Butiker
          </NavLink>
          <NavLink
            to="/boende"
            className={({ isActive }) =>
              isActive
                ? "text-black underline underline-offset-8 decoration-orange-500"
                : "text-black hover hover:text-orange-600 transition ease-in-out duration-200"
            }
          >
            Boende
          </NavLink>
          <NavLink
            to="/om"
            className={({ isActive }) =>
              isActive
                ? "text-black underline underline-offset-8 decoration-orange-500"
                : "text-black hover hover:text-orange-600 transition ease-in-out duration-200"
            }
          >
            Information
          </NavLink>
        </div>

        {/* Mobile Menu (Hamburger) */}
        <div className="md:hidden mt-2">
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
              className="absolute top-4 right-5 text-white text-3xl"
            >
              &times;
            </button>
            <nav className="flex flex-col gap-4 p-7 mt-10">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive
                    ? "block text-lg hover:text-orange-500 underline underline-offset-8 decoration-orange-500"
                    : "block text-lg hover:text-orange-500"
                }
                onClick={handleMenuClick}
              >
                Hem
              </NavLink>
              <NavLink
                to="/mat&dryck"
                className={({ isActive }) =>
                  isActive
                    ? "block text-lg hover:text-orange-500 underline underline-offset-8 decoration-orange-500"
                    : "block text-lg hover:text-orange-500"
                }
                onClick={handleMenuClick}
              >
                Mat & Dryck
              </NavLink>
              <NavLink
                to="/butiker"
                className={({ isActive }) =>
                  isActive
                    ? "block text-lg hover:text-orange-500 underline underline-offset-8 decoration-orange-500"
                    : "block text-lg hover:text-orange-500"
                }
                onClick={handleMenuClick}
              >
                Butiker
              </NavLink>
              <NavLink
                to="/boende"
                className={({ isActive }) =>
                  isActive
                    ? "block text-lg hover:text-orange-500 underline underline-offset-8 decoration-orange-500"
                    : "block text-lg hover:text-orange-500"
                }
                onClick={handleMenuClick}
              >
                Hotell
              </NavLink>
              <NavLink
                to="/om"
                className={({ isActive }) =>
                  isActive
                    ? "block text-lg hover:text-orange-500 underline underline-offset-8 decoration-orange-500"
                    : "block text-lg hover:text-orange-500"
                }
                onClick={handleMenuClick}
              >
                Information
              </NavLink>
            </nav>

            <div className=" w-full flex justify-center mt-10">
              <NavLink onClick={handleMenuClick} to="/">
                <h1 className="font-semibold text-2xl">
                  Platsguiden<span className="text-orange-500 text-3xl">.</span>
                </h1>
              </NavLink>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
