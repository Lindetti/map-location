import { useEffect } from "react";

interface AutoLocationUpdaterProps {
  onLocationUpdate: () => Promise<void>;
}

const AutoLocationUpdater: React.FC<AutoLocationUpdaterProps> = ({
  onLocationUpdate,
}) => {
  useEffect(() => {
    // Funktion för att uppdatera plats varje minut
    const interval = setInterval(() => {
      onLocationUpdate();
    }, 180000);

    return () => clearInterval(interval);
  }, [onLocationUpdate]);

  return null;
};

export default AutoLocationUpdater;
