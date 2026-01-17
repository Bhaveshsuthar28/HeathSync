import React, { useState } from "react";
import { ArrowLeft, Clock, MapPin , Pin} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

export default function DoctorDetails({ doctor, onBack }) {
  const token = localStorage.getItem("userToken");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ date: "", time: "", message: "" });

  function handleForm(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function createAppointment() {
    if (!form.date || !form.time) {
      toast.error("Please select date & time.");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/appointments/create`,
        {
          doctorId: doctor.id,
          date: form.date,
          time: form.time,
          message: form.message
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Appointment created! OTP sent.");
      onBack();
    } catch (error) {
      toast.error("Could not create appointment.");
    } finally {
      setLoading(false);
    }
  }

    function formatTime(t) {
        if (!t) return "";

        const [hour, minute] = t.split(":");
        const h = parseInt(hour);

        const suffix = h >= 12 ? "PM" : "AM";
        const formattedHour = h % 12 === 0 ? 12 : h % 12;

        return `${formattedHour}:${minute} ${suffix}`;
    }


  return (
    <main className="min-h-screen px-6 max-w-5xl mx-auto">

      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 font-medium mb-6"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="border border-blue-600 rounded-xl p-6 bg-white">

        <div className="flex gap-6">
          <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-blue-600">
            <img
              src={
                doctor.profileImageUrl ||
                "https://cdn-icons-png.flaticon.com/512/387/387561.png"
              }
              alt=""
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-semibold">{doctor.fullname}</h2>

            <p className="text-gray-600 text-sm">
              {doctor.specialization}
            </p>

            <div className="flex items-center gap-2 text-gray-600 mt-2 text-sm">
              <MapPin size={16} />
              {doctor.clinicName}, {doctor.city}, {doctor.state}
            </div>

            <div className="flex items-center gap-2 text-gray-600 mt-2 text-sm">
              <Pin size={16} />
              {doctor.clinicAddress}
            </div>

            <div className="flex items-center gap-2 text-gray-600 mt-1 text-sm">
                <Clock size={16} />
                {formatTime(doctor.clinicOpenTime)} to {formatTime(doctor.clinicCloseTime)}
            </div>


            <p className="text-sm mt-2 text-gray-700">
              <strong>Experience:</strong> {doctor.about}
            </p>

            <p className="text-sm mt-1 text-gray-700">
                <strong>Working Days:</strong>{" "}
                {doctor.workingDays
                    ?.map((day) => day.toLowerCase())
                    ?.sort((a, b) => {
                    const order = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
                    return order.indexOf(a) - order.indexOf(b);
                    })
                    ?.map((day) => day.charAt(0).toUpperCase() + day.slice(1))
                    ?.join(", ")
                }
            </p>

          </div>
        </div>

        {/* FORM */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="relative">
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleForm}
              className="peer w-full px-3 py-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600"
            />
            <label className="absolute left-3 -top-2.5 text-sm bg-white px-1 text-gray-600">
              Select Date
            </label>
          </div>

          <div className="relative">
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleForm}
              className="peer w-full px-3 py-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600"
            />
            <label className="absolute left-3 -top-2.5 text-sm bg-white px-1 text-gray-600">
              Select Time
            </label>
          </div>

        </div>

        <div className="relative mt-4">
          <textarea
            name="message"
            rows="3"
            value={form.message}
            onChange={handleForm}
            className="peer w-full px-3 py-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600"
            placeholder="Enter reason..."
          />
          <label className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600">
            Message
          </label>
        </div>

        <button
          onClick={createAppointment}
          disabled={loading}
          className="mt-6 w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Appointment"}
        </button>

      </div>
    </main>
  );
}
