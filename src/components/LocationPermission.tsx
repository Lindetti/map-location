import React, { useState } from "react";
import Modal from "./Modal";

interface LocationPermissionProps {
  onPermissionGranted: () => void; // Callback när platsåtkomst beviljas
}

const LocationPermission: React.FC<LocationPermissionProps> = ({
  onPermissionGranted,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkLocationPermission = async () => {
    if (!navigator.permissions) {
      setError("Din webbläsare stöder inte platsbehörigheter.");
      setIsModalOpen(true);
      return;
    }

    try {
      const permissionStatus = await navigator.permissions.query({
        name: "geolocation",
      });

      if (permissionStatus.state === "granted") {
        // Platsåtkomst är redan tillåten
        navigator.geolocation.getCurrentPosition(() => {
          onPermissionGranted();
        });
      } else if (permissionStatus.state === "denied") {
        // Platsåtkomst är nekad
        setError(
          "Du har nekat åtkomst till platsen. Tillåt platsåtkomst i webbläsarens inställningar för att använda Platsguiden."
        );
        setIsModalOpen(true);
      } else {
        // Platsåtkomst har inte frågats ännu
        requestLocation();
      }
    } catch (err) {
      console.error("Kunde inte kontrollera platsbehörighet:", err);
      setError("Ett fel inträffade vid kontroll av platsbehörighet.");
      setIsModalOpen(true);
    }
  };

  const requestLocation = () => {
    navigator.geolocation.getCurrentPosition(
      () => {
        onPermissionGranted();
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setError(
            "Du har nekat åtkomst till platsen. Tillåt platsåtkomst i webbläsarens inställningar för att använda Platsguiden."
          );
          setIsModalOpen(true);
        }
      }
    );
  };

  return (
    <>
      <button
        onClick={checkLocationPermission}
        className="mt-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
      >
        Försök igen
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Platsåtkomst nekad"
      >
        <p className="text-gray-700">{error}</p>
      </Modal>
    </>
  );
};

export default LocationPermission;
