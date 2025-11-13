import React, { useEffect, useState } from "react";
import Sidebar from "../Components/SideBar.component.jsx";
import RecommendedSlider from "../Components/RecommendDoctor.components.jsx";
import { Menu, SidebarClose } from "lucide-react";

export function UserHome() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    requestLocationAndFetch();
  }, []);

  async function requestLocationAndFetch() {
    if (!("geolocation" in navigator)) {
      setLocationError("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
          const resp = await fetch(url, {
            headers: { "User-Agent": "HealthSync" },
          });
          const json = await resp.json();
          const addr = json.address || {};

          const c = addr.city || addr.town || addr.village || addr.county || "";
          const st = addr.state || addr.region || "";

          setCity(c);
          setStateName(st);
        } catch (err) {
          console.error("Reverse geocode failed", err);
          setLocationError("Reverse geocode failed");
        }
      },
      () => {
        setLocationError("Location permission denied");
      }
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={(x) => console.log("nav:", x)}
      />

      {/* Floating Sidebar Button */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded-full bg-blue-600"
        >
          <Menu className="text-white"/>
        </button>
      )}


      <main className="px-4 sm:px-6 lg:px-8 pt-20 max-w-6xl mx-auto">
        {/* Location Text */}
        <div className="mb-4 text-gray-600 text-sm">
          {city && stateName
            ? `Showing doctors in ${city}, ${stateName}`
            : locationError ?? "Detecting location..."}
        </div>

        {/* Recommended Doctors by City */}
        <RecommendedSlider
          fetchUrl={`${import.meta.env.VITE_BASE_URL}/users/recommend/city`}
          params={{ city }}
          limit={6}
        />

        {/* Recommended Doctors by State */}
        <RecommendedSlider
          fetchUrl={`${import.meta.env.VITE_BASE_URL}/users/recommend/state`}
          params={{ state: stateName }}
          limit={8}
        />
      </main>
    </div>
  );
}
