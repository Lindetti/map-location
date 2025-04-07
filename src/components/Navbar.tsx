import { NavLink } from "react-router-dom";
const Navbar = () => {
  return (
    <nav className="flex bg-gray-800 h-[100px] w-full items-center justify-center text-white">
      <div className="flex gap-4">
        <NavLink to="/">Restauranger</NavLink>
        <NavLink to="/barer">Barer</NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
