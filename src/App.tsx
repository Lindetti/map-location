import "./App.css";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Layout/Navbar";
import Home from "./components/Pages/Home";
import BarsNearby from "./components/Pages/BarsNearby";
import SuperMarket from "./components/Pages/SuperMarket";
import About from "./components/Pages/About";
import Footer from "./components/Layout/Footer";

function App() {
  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center">
      <Navbar />
      <main className="flex-1 flex justify-center items-start w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/barer" element={<BarsNearby />} />
          <Route path="/mataffärer" element={<SuperMarket />} />
          <Route path="/om" element={<About />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
