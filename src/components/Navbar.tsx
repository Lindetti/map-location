import { NavLink } from "react-router-dom";
const Navbar = () => {
  return (
    <nav className="flex bg-gray-800 h-[100px] w-full items-center justify-center text-white">
      <div className="flex gap-4 font-semibold text-2xl">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive
              ? "text-white underline underline-offset-8 decoration-blue-400"
              : "text-white"
          }
        >
          Restauranger
        </NavLink>
        <NavLink
          to="/barer"
          className={({ isActive }) =>
            isActive
              ? "text-white underline underline-offset-8 decoration-blue-400"
              : "text-white"
          }
        >
          Barer
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
