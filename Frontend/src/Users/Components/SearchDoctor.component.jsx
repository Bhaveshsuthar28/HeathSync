import React, { useState } from "react";
import axios from "axios";
import DoctorCard from "./DoctorCard.component";
import { State, City } from "country-state-city";
import { ArrowLeft } from "lucide-react";
import { SPECIALIZATIONS } from "../../Spec.jsx";

export default function SearchDoctor({ onBack  , onOpenDoctor }) {
  const [stateName, setStateName] = useState("");
  const [city, setCity] = useState("");
  const [specialization, setSpecialization] = useState("");

  const [cities, setCities] = useState([]);
  const [doctorList, setDoctorList] = useState([]);

  const token = localStorage.getItem("userToken");
  const states = State.getStatesOfCountry("IN");

  function handleStateChange(e) {
    const selected = e.target.value;
    setStateName(selected);
    setCity("");

    const stObj = states.find((s) => s.name === selected);
    if (stObj) {
      const allCities = City.getCitiesOfState("IN", stObj.isoCode);
      setCities(allCities || []);
    } else {
      setCities([]);
    }
  }

  async function searchDoctors() {
    if (!stateName || !city || !specialization) return;

    const res = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/users/recommend/advanced`,
      {
        params: { state: stateName, city: city, specialization },
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setDoctorList(res.data?.data?.doctors || []);
  }

  return (
    <main className="min-h-screen bg-white max-w-5xl mx-auto px-4">
      
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 font-medium mb-8"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <h1 className="text-2xl font-semibold text-gray-800 mb-8">
        Search Doctors
      </h1>

      {/* Form Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* STATE */}
        <div className="relative">
          <select
            value={stateName}
            onChange={handleStateChange}
            className="peer w-full px-3 py-4 border border-gray-300 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
          >
            <option value="">Select State</option>
            {states.map((s) => (
              <option key={s.isoCode} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm text-gray-600 
                             transition-all peer-focus:text-blue-600">
            State
          </label>
        </div>

        {/* CITY */}
        <div className="relative">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="peer w-full px-3 py-4 border border-gray-300 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white 
                       disabled:bg-gray-100"
            disabled={!stateName}
          >
            <option value="">Select City</option>
            {cities.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm text-gray-600 
                             transition-all peer-focus:text-blue-600">
            City
          </label>
        </div>

        {/* SPECIALIZATION */}
        <div className="relative">
          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="peer w-full px-3 py-4 border border-gray-300 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white 
                       disabled:bg-gray-100"
            disabled={!city}
          >
            <option value="">Select Specialization</option>

            {SPECIALIZATIONS.map((sp) => (
              <option key={sp} value={sp}>
                {sp}
              </option>
            ))}
          </select>

          <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm text-gray-600 
                             transition-all peer-focus:text-blue-600">
            Specialization
          </label>
        </div>

        {/* SEARCH BUTTON */}
        <div className="flex items-end">
          <button
            onClick={searchDoctors}
            className="w-full py-4 bg-blue-600 text-white rounded-md 
                       text-sm hover:bg-blue-700 transition"
          >
            Search
          </button>
        </div>
      </div>

      {doctorList.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Results</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctorList.map((doc) => (
                <DoctorCard
                    doctor={doc}
                    key={doc._id || doc.id}
                    onOpenDoctor={(d) => onBack("doctorDetails", d)}
                />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
