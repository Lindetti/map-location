import React, { useState, useEffect } from "react";
import Modal from "./Modal";

interface LocationPermissionProps {
  onLocationReceived: (position: GeolocationPosition) => void;
}

const LocationPermission: React.FC<LocationPermissionProps> = ({
  onLocationReceived,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    checkLocationPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reloadPage = () => {
    window.location.reload();
  };

  const checkLocationPermission = async () => {
    if (!navigator.permissions) {
      requestLocation();
      return;
    }

    try {
      const permissionStatus = await navigator.permissions.query({
        name: "geolocation" as PermissionName,
      });

      if (permissionStatus.state === "granted") {
        getCurrentPosition();
      } else if (permissionStatus.state === "denied") {
        // Platsåtkomst är nekad
        setError(
          "Du har nekat åtkomst till platsen. Tillåt platsåtkomst i webbläsarens inställningar för att använda RestaurantFinder."
        );
        setIsModalOpen(true);
      } else {
        // Platsåtkomst har inte frågats ännu, be om den
        requestLocation();
      }
    } catch (err) {
      console.error("Kunde inte kontrollera platsbehörighet:", err);
      requestLocation();
    }
  };

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Validate accuracy before accepting the position
          if (position.coords.accuracy <= 100) {
            onLocationReceived(position);
          } else {
            // If accuracy is poor, try again with stricter settings
            navigator.geolocation.getCurrentPosition(
              (newPosition) => {
                onLocationReceived(newPosition);
              },
              (err) => {
                console.error("Kunde inte hämta exakt plats:", err);
                // Fall back to the original position if the second attempt fails
                onLocationReceived(position);
              },
              {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
              }
            );
          }
        },
        (err) => {
          console.error("Kunde inte hämta plats:", err);
          let errorMessage = "Ett fel inträffade vid hämtning av din plats.";

          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage =
                "Du har nekat åtkomst till platsen. Tillåt platsåtkomst i webbläsarens inställningar för att använda RestaurantFinder.";
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = "Platsinformation är otillgänglig.";
              break;
            case err.TIMEOUT:
              errorMessage = "Förfrågan att hämta din plats tog för lång tid.";
              break;
          }

          setError(errorMessage);
          setIsModalOpen(true);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // Increased timeout for better accuracy
          maximumAge: 0,
        }
      );
    } else {
      setError("Din webbläsare stöder inte geolokalisering.");
      setIsModalOpen(true);
    }
  };

  const getCurrentPosition = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onLocationReceived(position);
        },
        (err) => {
          console.error("Kunde inte hämta plats:", err);
          setError("Ett fel inträffade vid hämtning av din plats.");
          setIsModalOpen(true);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    }
  };

  return (
    <>
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Platsbehörighet krävs"
        >
          <div className="p-4">
            <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
            <div className="flex justify-end">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                onClick={reloadPage}
              >
                Ladda om sidan
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default LocationPermission;
