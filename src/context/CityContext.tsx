import { createContext, useContext, useState, ReactNode } from "react";

interface CityContextProps {
  city: string | null;
  setCity: (city: string) => void;
}

const CityContext = createContext<CityContextProps | undefined>(undefined);

export const CityProvider = ({ children }: { children: ReactNode }) => {
  const [city, setCity] = useState<string | null>(null);

  return (
    <CityContext.Provider value={{ city, setCity }}>
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error("useCity must be used within a CityProvider");
  }
  return context;
};