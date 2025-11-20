import React from "react";

export default function DoctorCard({ doctor, onOpenDoctor }) {
  return (
    <div className="w-56 min-w-[14rem] bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">

      <div className="bg-blue-600 w-full flex flex-col items-center pt-6 pb-10">
        <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg overflow-hidden border-4 border-blue-400">
          <img
            src={doctor.profileImageUrl || "https://cdn-icons-png.flaticon.com/512/387/387561.png"}
            alt={doctor.fullname}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="px-4 pb-5 flex flex-col items-center text-center">
        <h3 className="text-base font-semibold text-gray-800 mt-2">
          {doctor.fullname}
        </h3>

        <p className="text-xs text-gray-500 mt-1">
          {doctor.specialization}
        </p>

        <button
          onClick={() => onOpenDoctor(doctor)}
          className="mt-4 w-full py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
        >
          View More
        </button>
      </div>

    </div>
  );
}
