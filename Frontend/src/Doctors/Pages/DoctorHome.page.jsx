import React, { useRef, useState, useContext } from "react";
import SidebarDoctor from "../Components/Sidebar.component.jsx";
import LogoutConfirm from "../Components/Logout.component.jsx";
import DoctorUpcoming from "../Components/Upcomming.component.jsx";
import { Menu, ArrowLeft } from "lucide-react";
import { DoctorContext } from "../context/DoctorContext.context.jsx";
import { useNavigate } from "react-router-dom";
import DoctorHistory from "../Components/DoctorHistory.component.jsx";
import DoctorProfile from "../Components/Profile.component.jsx";
import TitleChanger from "../../title.jsx";

export function DoctorHome() {
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const screenRef = useRef("home");
  const [logoutOpen, setLogoutOpen] = useState(false);

  const { doctor , setDoctor } = useContext(DoctorContext);
  TitleChanger(doctor?.fullname);
  const navigate = useNavigate();

  const [, setRender] = useState(false);
  const forceUpdate = () => setRender((x) => !x);

  function switchScreen(to) {
    if (to === "logout") {
      setLogoutOpen(true);
      setSidebarOpen(false);
      return;
    }

    screenRef.current = to;
    setSidebarOpen(false);
    forceUpdate();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarDoctor
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={switchScreen}
      />

      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded-full bg-blue-600 shadow-md"
        >
          <Menu className="text-white" />
        </button>
      )}

      <main className="pt-14 px-4 sm:px-6 max-w-6xl mx-auto">

        {/* 🔙 SHOW BACK button ONLY on profile OR history */}
        {(screenRef.current === "profile" || screenRef.current === "history") && (
          <button
            onClick={() => switchScreen("home")}
            className="flex items-center gap-2 text-blue-600 font-medium mb-6"
          >
            <ArrowLeft size={18} /> Back
          </button>
        )}

        {/* HOME (Upcoming Appointments) */}
        {screenRef.current === "home" && (
          <>
            <h1 className="text-2xl font-semibold text-gray-800">Doctor Dashboard</h1>
            <p className="text-sm text-gray-500 mb-6">Upcoming Appointments</p>
            <DoctorUpcoming />
          </>
        )}

        {/* PROFILE */}
        {screenRef.current === "profile" && <DoctorProfile/>}

        {screenRef.current === "history" && <DoctorHistory />}

        <LogoutConfirm
          open={logoutOpen}
          onClose={() => setLogoutOpen(false)}
          onConfirm={() => {
            localStorage.removeItem("doctorToken");
            setDoctor(null);
            navigate("/doctor-auth");
          }}
        />
      </main>
    </div>
  );
}
