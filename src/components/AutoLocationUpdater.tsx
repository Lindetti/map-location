import { useEffect, useCallback } from "react";

interface AutoLocationUpdaterProps {
  onLocationUpdate: (position: GeolocationPosition) => void;
}

const AutoLocationUpdater: React.FC<AutoLocationUpdaterProps> = ({
  onLocationUpdate,
}) => {
  const getPosition = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onLocationUpdate(position);
        },
        (error) => {
          // Hantera specifika feltyper
          let errorMessage = "Ett fel uppstod vid uppdatering av position";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Åtkomst till platsinformation nekades";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Platsinformation är inte tillgänglig";
              break;
            case error.TIMEOUT:
              // Vid timeout, försök igen med längre timeout
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  onLocationUpdate(position);
                },
                (retryError) => {
                  console.error("Error after retry:", retryError);
                },
                {
                  enableHighAccuracy: true,
                  timeout: 20000, // Längre timeout vid andra försöket
                  maximumAge: 0,
                }
              );
              return; // Avsluta här eftersom vi gör ett nytt försök
          }
          console.error("Error updating location:", errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000, // Ökad från 5000 till 15000
          maximumAge: 0,
        }
      );
    }
  }, [onLocationUpdate]);

  useEffect(() => {
    // Initial position update
    getPosition();

    // Uppdatera position var 3:e minut
    const interval = setInterval(getPosition, 180000);

    return () => clearInterval(interval);
  }, [getPosition]);

  return null;
};

export default AutoLocationUpdater;
