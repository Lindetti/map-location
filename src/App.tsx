import "./App.css";
import { CityProvider } from "./context/CityContext";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Pages/Home";
import About from "./components/Pages/About";
import PrivacyPolicy from "./components/Pages/PrivacyPolicy";

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center font-sans relative overflow-hidden from-indigo-900 via-purple-800 to-pink-700 z-0">
      {/* Content */}
      <div className="relative w-full">
        <main className="flex-1 flex justify-center items-start w-full">
          <CityProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/om" element={<About />} />
              <Route path="/privacypolicy" element={<PrivacyPolicy />} />
            </Routes>
          </CityProvider>
        </main>
      </div>
    </div>
  );
}

export default App;
