import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Logo.png";
import doctorImg from "../assets/doctor.png";
import patientImg from "../assets/patient.png";
import TitleChanger from "../title";

export const Start = () => {
  const navigate = useNavigate();
  TitleChanger("Start Here")

  return (
    <main className="h-screen flex flex-col items-center justify-center bg-white text-gray-800 px-6 py-12 relative overflow-hidden">
      <motion.div
        className="absolute w-72 h-72 bg-blue-100 rounded-full blur-3xl top-10 left-10 opacity-30"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, repeatType: "mirror" }}
      />
      <motion.div
        className="absolute w-96 h-96 bg-blue-200 rounded-full blur-3xl bottom-10 right-10 opacity-30"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "mirror" }}
      />

      {/* Logo Section */}
      <div className="flex flex-col items-center mb-8 z-10">
        <img src={logo} alt="HealthSync Logo" className="h-36 w-auto" />
        <h1 className="text-3xl font-bold text-blue-700 tracking-wide">
          Welcome to <span className="text-blue-900">HealthSync</span>
        </h1>
        <p className="text-gray-600 mt-2 text-center max-w-md">
          Connect with top doctors, manage your health, and control your system
          — anytime, anywhere.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 z-10">
        {/* Doctor Card */}
        <div
          
          className="cursor-pointer bg-white rounded-2xl border-2 border-blue-600 p-6 flex flex-col items-center justify-between transition"
        >
          <img
            src={doctorImg}
            alt="Doctor"
            className="w-36 h-36 object-contain mb-4"
          />
          <h2 className="text-xl font-semibold text-blue-700 mb-2">
            Doctor Portal
          </h2>
          <p className="text-gray-600 text-sm text-center mb-4">
            Join our network of trusted doctors and manage your appointments
            efficiently.
          </p>
          <button 
          onClick={() => navigate("/doctor-auth")}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
            Join as Doctor
          </button>
        </div>

        {/* Patient Card */}
        <div
          
          className="cursor-pointer bg-white rounded-2xl border-2 border-blue-600 p-6 flex flex-col items-center justify-between transition"
        >
          <img
            src={patientImg}
            alt="Patient"
            className="w-36 h-36 object-contain mb-4"
          />
          <h2 className="text-xl font-semibold text-blue-700 mb-2">
            Patient Portal
          </h2>
          <p className="text-gray-600 text-sm text-center mb-4">
            Find the right doctor, book appointments, and manage your medical
            records with ease.
          </p>
          <button onClick={() => navigate("/user-auth")} className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
            Continue as Patient
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} HealthSync. All rights reserved.
      </footer>
    </main>
  );
};
