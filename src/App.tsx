import "./App.css";
import { CityProvider } from "./CityContext";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Layout/Navbar";
import Home from "./components/Pages/Home";
import Shops from "./components/Pages/Shops";
import Hotel from "./components/Pages/Hotel";
import About from "./components/Pages/About";
import Footer from "./components/Layout/Footer";

function App() {
  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center font-sans">
      <Navbar />
      <main className="flex-1 flex justify-center items-start w-full">
        <CityProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/butiker" element={<Shops />} />
            <Route path="/boende" element={<Hotel />} />
            <Route path="/om" element={<About />} />
          </Routes>
        </CityProvider>
      </main>
      <Footer />
    </div>
  );
}

export default App;
