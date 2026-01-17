import React, { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, Clock, Mail, MapPin, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-toastify";

export default function HistoryAppointments({ onBack }) {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);

  const token = localStorage.getItem("userToken");

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/appointments/user/history`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAppointments(res.data?.data?.appointments || []);
    } catch (err) {
      toast.error("Failed to load appointment history.");
    } finally {
      setLoading(false);
    }
  }

  function formatDateTime(dt) {
    const date = new Date(dt);
    return (
      date.toLocaleDateString("en-IN") +
      " | " +
      date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 max-w-5xl mx-auto">

      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 font-medium mb-6"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <h1 className="text-2xl font-semibold mb-8">Appointment History</h1>

      {loading && <div className="text-center text-gray-600">Loading...</div>}

      {!loading && appointments.length === 0 && (
        <div className="text-center text-gray-600 mt-10">
          No past appointments found.
        </div>
      )}

      <div className="space-y-6">
        {appointments.map((a) => (
          <div
            key={a.id}
            className="border border-blue-600 rounded-xl p-6 bg-white"
          >
            <div className="flex items-start gap-4">

              <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden border-2 border-blue-600">
                <img
                  src={
                    a.doctor.profileImageUrl ||
                    "https://cdn-icons-png.flaticon.com/512/387/387561.png"
                  }
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                
                {/* Doctor Name */}
                <h2 className="text-lg font-semibold text-gray-800">
                  {a.doctor.fullname}
                </h2>

                <p className="text-sm text-gray-500">
                  {a.doctor.specialization}
                </p>

                {/* Status */}
                <div className="mt-2">
                  {a.status === "CANCELLED" && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-red-100 text-red-600">
                      <XCircle size={16} /> Cancelled
                    </span>
                  )}

                  {a.status === "RESOLVED" && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-green-100 text-green-600">
                      <CheckCircle size={16} /> Resolved
                    </span>
                  )}
                </div>

                {/* Clinic Location */}
                <div className="text-sm text-gray-600 mt-3 flex items-center gap-2">
                  <MapPin size={16} /> {a.doctor.clinicName}, {a.doctor.city}
                </div>

                {/* Appointment Time */}
                <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                  <Clock size={16} /> {formatDateTime(a.scheduledAt)}
                </div>

                {/* Email */}
                <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                  <Mail size={16} /> {a.doctor.email}
                </div>

                {/* Message Provided by User */}
                {a.message && (
                  <div className="mt-3 text-gray-700 text-sm bg-gray-100 p-3 rounded-md">
                    <strong>Patient Message:</strong> {a.message}
                  </div>
                )}

                {/* Cancel Reason */}
                {a.status === "CANCELLED" && a.cancelReason && (
                  <div className="mt-3 bg-red-50 p-3 rounded-md text-sm text-red-700 border border-red-300">
                    <strong>Cancelled By:</strong> {a.cancelledBy}<br />
                    <strong>Reason:</strong> {a.cancelReason}
                  </div>
                )}

                {/* Resolved Info */}
                {a.status === "RESOLVED" && (
                  <div className="mt-3 bg-green-50 p-3 rounded-md text-sm text-green-700 border border-green-300">
                    <strong>Resolved By:</strong> Doctor #{a.resolvedBy}<br />
                    <strong>Resolved At:</strong> {formatDateTime(a.resolvedAt)}
                  </div>
                )}

              </div>
            </div>
          </div>
        ))}
      </div>

    </main>
  );
}
