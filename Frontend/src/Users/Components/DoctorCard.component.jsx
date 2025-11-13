import React from "react";
import { CheckCircle } from "lucide-react";

export default function DoctorCard({ doctor }) {
  return (
    <div className="w-64 min-w-[16rem] bg-white rounded-xl border border-blue-500 shadow-sm overflow-hidden flex flex-col">

      {/* Image Section */}
      <div className="w-full bg-white p-2">
        <img
          src={doctor.profileImageUrl}
          alt={doctor.fullname}
          className="w-full h-40 object-cover rounded-lg"
        />
      </div>

      {/* Info Section */}
      <div className="p-4 flex flex-col items-center text-center gap-2">
        <div className="flex items-center gap-4">
          <h3 className="text-base font-semibold">{doctor.fullname}</h3>
          {doctor.verified && <CheckCircle size={17} className="text-green-500 right-2" />}
          <p className="text-sm text-gray-600">{doctor.specialization}</p>
        </div>

        

        {/* Timings */}
        <div className="flex justify-between w-full text-xs text-gray-600 mt-2">
          <div>
            <div className="text-[11px] text-gray-500">Opens</div>
            <div className="font-medium">
              {doctor.clinicOpenTime ?? "--:--"}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-gray-500">Closes</div>
            <div className="font-medium">
              {doctor.clinicCloseTime ?? "--:--"}
            </div>
          </div>
        </div>

        {/* View Button */}
        <button className="mt-3 w-full py-2 text-sm bg-blue-600 text-white rounded-md">
          View
        </button>
      </div>
    </div>
  );
}
