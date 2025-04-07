import "./App.css";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import BarsNearby from "./components/BarsNearby";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="bg-slate-100 min-h-screen flex flex-col items-center justify-center">
      <Navbar />
      <main className="flex-1 flex justify-center items-start w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/barer" element={<BarsNearby />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
