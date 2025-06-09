import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Logo from "../../assets/icons/platsguidenlogoDefault.png";
import LogoDarkMode from "../../assets/icons/platsguidenlogoDarkMode.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;

    if (isDark) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }

    setIsDark(!isDark);
  };

  const handleMenuClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="flex bg-gray-100 dark:bg-[#1a1a1a] h-[130px] md:h-[100px] w-full items-center justify-center px-4 relative font-sans">
      <div className="w-full lg:w-2/4 flex flex-col gap-3 md:flex-row justify-between items-center">
        <NavLink to="/">
          {!isDark ? (
            <img src={Logo} alt="Logo" className="h-[45px] w-[230px]" />
          ) : (
            <img src={LogoDarkMode} alt="Logo" className="h-[45px] w-[230px]" />
          )}
        </NavLink>

        {/* Desktop Menu */}

        <div className="hidden md:flex gap-5 font-semibold text-base">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "underline underline-offset-8 decoration-orange-500 text-orange-500"
                : "text-gray-700 dark:text-gray-300 hover:underline underline-offset-8 decoration-transparent hover:decoration-orange-500 transition-all ease-in-out duration-200"
            }
          >
            Hem
          </NavLink>
          <NavLink
            to="/mat&dryck"
            className={({ isActive }) =>
              isActive
                ? "underline underline-offset-8 decoration-orange-500 text-orange-500"
                : "text-gray-700 dark:text-gray-300 hover:underline underline-offset-8 decoration-transparent hover:decoration-orange-500 transition-all ease-in-out duration-200"
            }
          >
            Mat & Dryck
          </NavLink>
          <NavLink
            to="/butiker"
            className={({ isActive }) =>
              isActive
                ? "underline underline-offset-8 decoration-orange-500 text-orange-500"
                : "text-gray-700 dark:text-gray-200 hover:underline underline-offset-8 decoration-transparent hover:decoration-orange-500 transition-all ease-in-out duration-200"
            }
          >
            Butiker
          </NavLink>
          <NavLink
            to="/boende"
            className={({ isActive }) =>
              isActive
                ? "underline underline-offset-8 decoration-orange-500 text-orange-500"
                : "text-gray-700 dark:text-gray-300 hover:underline underline-offset-8 decoration-transparent hover:decoration-orange-500 transition-all ease-in-out duration-200"
            }
          >
            Boende
          </NavLink>
          <NavLink
            to="/om"
            className={({ isActive }) =>
              isActive
                ? "underline underline-offset-8 decoration-orange-500 text-orange-500"
                : "text-gray-700 dark:text-gray-300 hover:underline underline-offset-8 decoration-transparent hover:decoration-orange-500 transition-all ease-in-out duration-200"
            }
          >
            Om Platsguiden
          </NavLink>
          {/* New Toggle Switch for Desktop */}
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isDark}
              onChange={toggleTheme}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
          </label>
        </div>

        {/* Mobile Menu (Hamburger) */}
        <div className="md:hidden mt-2">
          <button
            onClick={handleMenuClick}
            className="flex flex-col gap-1.5 items-end"
          >
            <div className="w-8 h-1 bg-black dark:bg-gray-200"></div>
            <div className="w-6 h-1 bg-black dark:bg-gray-200"></div>
            <div className="w-4 h-1 bg-black dark:bg-gray-200"></div>
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
          <div className="fixed top-0 right-0 h-full w-1/2 bg-gray-800 dark:bg-[#1a1a1a] text-white z-50 shadow-lg transition-transform transform translate-x-0">
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
                    ? "block text-lg underline underline-offset-8 decoration-orange-500 text-orange-500"
                    : "block text-lg text-white dark:text-gray-300 hover:underline underline-offset-8 decoration-transparent hover:decoration-orange-500 transition-all ease-in-out duration-200"
                }
                onClick={handleMenuClick}
              >
                Hem
              </NavLink>
              <NavLink
                to="/mat&dryck"
                className={({ isActive }) =>
                  isActive
                    ? "block text-lg underline underline-offset-8 decoration-orange-500 text-orange-500"
                    : "block text-lg text-white dark:text-gray-300 hover:underline underline-offset-8 decoration-transparent hover:decoration-orange-500 transition-all ease-in-out duration-200"
                }
                onClick={handleMenuClick}
              >
                Mat & Dryck
              </NavLink>
              <NavLink
                to="/butiker"
                className={({ isActive }) =>
                  isActive
                    ? "block text-lg underline underline-offset-8 decoration-orange-500 text-orange-500"
                    : "block text-lg text-white dark:text-gray-300 hover:underline underline-offset-8 decoration-transparent hover:decoration-orange-500 transition-all ease-in-out duration-200"
                }
                onClick={handleMenuClick}
              >
                Butiker
              </NavLink>
              <NavLink
                to="/boende"
                className={({ isActive }) =>
                  isActive
                    ? "block text-lg underline underline-offset-8 decoration-orange-500 text-orange-500"
                    : "block text-lg text-white dark:text-gray-300 hover:underline underline-offset-8 decoration-transparent hover:decoration-orange-500 transition-all ease-in-out duration-200"
                }
                onClick={handleMenuClick}
              >
                Boende
              </NavLink>
              <NavLink
                to="/om"
                className={({ isActive }) =>
                  isActive
                    ? "block text-lg underline underline-offset-8 decoration-orange-500 text-orange-500"
                    : "block text-lg text-white dark:text-gray-300 hover:underline underline-offset-8 decoration-transparent hover:decoration-orange-500 transition-all ease-in-out duration-200"
                }
                onClick={handleMenuClick}
              >
                Om Platsguiden
              </NavLink>
              {/* New Toggle Switch for Mobile */}
              <label className="inline-flex items-center cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={isDark}
                  onChange={() => {
                    toggleTheme();
                  }}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 dark:after:bg-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
              </label>
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
