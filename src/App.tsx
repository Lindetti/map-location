import "./App.css";
import { CityProvider } from "./context/CityContext";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Layout/Navbar";
import Home from "./components/Pages/Home";
import FoodAndDrink from "./components/Pages/FoodAndDrink";
import Shops from "./components/Pages/Shops";
import Transport from "./components/Pages/Transport";
import Hotel from "./components/Pages/Hotel";
import About from "./components/Pages/About";
import Footer from "./components/Layout/Footer";

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center font-sans relative overflow-hidden bg-white">
      {/* Content */}
      <div className="relative w-full">
        <Navbar />
        <main className="flex-1 flex justify-center items-start w-full">
          <CityProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/mat&dryck" element={<FoodAndDrink />} />
              <Route path="/butiker" element={<Shops />} />
              <Route path="/boende" element={<Hotel />} />
              <Route path="/bensinstationer" element={<Transport />} />
              <Route path="/om" element={<About />} />
            </Routes>
          </CityProvider>
        </main>

        {/* Waves above footer */}
        <div className="relative w-full h-[200px] overflow-hidden">
          <svg
            className="absolute bottom-0 left-0 w-full h-full"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              fill="#F97316"
              fillOpacity="0.1"
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
          <svg
            className="absolute bottom-0 left-0 w-full h-full"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              fill="#F97316"
              fillOpacity="0.2"
              d="M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,181.3C672,181,768,203,864,208C960,213,1056,203,1152,186.7C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default App;
