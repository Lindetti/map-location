import { useEffect } from "react";

// Uppdatera typen för 'onLocationUpdate' för att acceptera en asynkron funktion
interface AutoLocationUpdaterProps {
  onLocationUpdate: () => Promise<void>; // Funktion som returnerar en Promise
}

const AutoLocationUpdater: React.FC<AutoLocationUpdaterProps> = ({
  onLocationUpdate,
}) => {
  useEffect(() => {
    // Funktion för att uppdatera plats varje minut
    const interval = setInterval(() => {
      onLocationUpdate(); 
    }, 180000); 

    return () => clearInterval(interval); // Städa upp intervallet när komponenten tas bort
  }, [onLocationUpdate]);

  return null; // Kommer inte rendera något, används endast för att uppdatera plats
};

export default AutoLocationUpdater;
