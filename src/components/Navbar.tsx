import { NavLink } from "react-router-dom";
const Navbar = () => {
  return (
    <nav className="flex bg-gray-100 h-[120px] md:h-[100px] w-full items-center justify-center  ">
      <div className="w-full md:w-2/4 flex flex-col gap-3 md:flex-row justify-between items-center pl-1.5 pr-1.5">
        <NavLink to="/">
          <h1 className="font-semibold text-2xl">
            Platsguiden<span className="text-orange-500 text-3xl">.</span>
          </h1>
        </NavLink>
        <div className="flex gap-5 font-semibold text-lg">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "text-black underline underline-offset-8 decoration-orange-500"
                : "text-black"
            }
          >
            Restauranger
          </NavLink>
          <NavLink
            to="/barer"
            className={({ isActive }) =>
              isActive
                ? "text-black underline underline-offset-8 decoration-orange-500"
                : "text-black"
            }
          >
            Barer
          </NavLink>
          <NavLink
            to="/om"
            className={({ isActive }) =>
              isActive
                ? "text-black underline underline-offset-8 decoration-orange-500"
                : "text-black"
            }
          >
            Om platsguiden
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
