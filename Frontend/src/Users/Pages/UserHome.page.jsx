import React, { useEffect, useState, useRef, useContext } from "react";
import Sidebar from "../Components/SideBar.component.jsx";
import RecommendedSlider from "../Components/RecommendDoctor.components.jsx";
import { Menu } from "lucide-react";
import axios from "axios";

import Profile from "../Components/Profile.component.jsx";
import SearchDoctor from "../Components/SearchDoctor.component.jsx";
import UpcomingAppointments from "../Components/Appointment.component.jsx";
import HistoryAppointments from "../Components/History.component.jsx";
import LogoutConfirm from "../Components/Logout.component.jsx";
import DoctorDetails from "../Components/DoctorDetail.component.jsx";

import { UserContext } from "../context/UserContext.context.jsx";
import { useNavigate } from "react-router-dom";
import TitleChanger from "../../title.jsx";

export function UserHome() {
  const { user , setUser } = useContext(UserContext);
  TitleChanger(user?.userName);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const screenRef = useRef("home");

  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [recommendedCity, setRecommendedCity] = useState([]);
  const [recommendedState, setRecommendedState] = useState([]);

  const [logoutOpen, setLogoutOpen] = useState(false);

  const token = localStorage.getItem("userToken");
  
  const navigate = useNavigate();

  const [, setRender] = useState(false);
  const forceUpdate = () => setRender((x) => !x);

  useEffect(() => {
    requestLocation();
  }, []);

  function switchScreen(to, doctor = null) {
    if (to === "logout") {
      setLogoutOpen(true);
      setSidebarOpen(false);
      return;
    }

    if (to === "doctorDetails") {
      setSelectedDoctor(doctor);
      screenRef.current = "doctorDetails";
      forceUpdate();
      return;
    }

    screenRef.current = to;
    setSidebarOpen(false);
    forceUpdate();
  }

  async function requestLocation() {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
      const res = await fetch(url);
      const json = await res.json();
      const addr = json.address || {};

      const c = addr.city || addr.town || addr.village || "";
      const st = addr.state || "";

      setCity(c);
      setStateName(st);

      fetchCityDoctors(c);
      fetchStateDoctors(st);
    });
  }

  async function fetchCityDoctors(c) {
    if (!c) return;
    const res = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/users/recommend/city`,
      {
        params: { city: c },
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setRecommendedCity(res.data?.data?.doctors || []);
  }

  async function fetchStateDoctors(s) {
    if (!s) return;
    const res = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/users/recommend/state`,
      {
        params: { state: s },
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setRecommendedState(res.data?.data?.doctors || []);
  }

  return (
    <div className="min-h-screen">

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={switchScreen}
      />

      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded-full bg-blue-600"
        >
          <Menu className="text-white" />
        </button>
      )}

      <main className="pt-20">

        {/* HOME */}
        {screenRef.current === "home" && (
          <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            <div className="text-lg font-semibold text-gray-800 mb-6">
              Doctors in {city}, {stateName}
            </div>

            <div className="bg-blue-600 p-6 rounded-xl bottom-4 relative mb-8">
              <h2 className="text-white text-lg font-semibold mb-3">
                City Recommendations
              </h2>

              <RecommendedSlider
                doctors={recommendedCity}
                onOpenDoctor={(doc) => switchScreen("doctorDetails", doc)}
              />
            </div>

            <div className="bg-blue-600 p-6 rounded-xl bottom-4 relative">
              <h2 className="text-white text-lg font-semibold mb-3">
                State Recommendations
              </h2>

              <RecommendedSlider
                doctors={recommendedState}
                onOpenDoctor={(doc) => switchScreen("doctorDetails", doc)}
              />
            </div>
          </div>
        )}

        {/* DOCTOR DETAILS */}
        {screenRef.current === "doctorDetails" && (
          <DoctorDetails
            doctor={selectedDoctor}
            onBack={() => switchScreen("home")}
          />
        )}

        {/* OTHER SCREENS */}
        {screenRef.current === "profile" && (
          <Profile onBack={() => switchScreen("home")} />
        )}

        {screenRef.current === "search" && (
          <SearchDoctor
            onBack={() => switchScreen("home")}
            onOpenDoctor={(doc) => switchScreen("doctorDetails", doc)}
          />
        )}

        {screenRef.current === "appointments" && (
          <UpcomingAppointments onBack={() => switchScreen("home")} />
        )}

        {screenRef.current === "history" && (
          <HistoryAppointments onBack={() => switchScreen("home")} />
        )}

        {/* LOGOUT POPUP */}
        <LogoutConfirm
          open={logoutOpen}
          onClose={() => setLogoutOpen(false)}
          onConfirm={() => {
            setTimeout(() => {
              localStorage.removeItem("userToken");
              setUser(null);
              navigate("/user-auth");
            } , 1000)
          }}
        />

      </main>
    </div>
  );
}
