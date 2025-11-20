import React, { useEffect, useState } from "react";
import axios from "axios";
import { Clock, MapPin, CheckCircle, XCircle, Mail } from "lucide-react";
import { toast } from "react-toastify";

export default function DoctorHistory() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("doctorToken");

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/appointments/doctor/history`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAppointments(res.data?.data?.appointments || []);
    } catch (err) {
      toast.error("Failed to load appointment history");
    } finally {
      setLoading(false);
    }
  }

  function formatDateTime(dt) {
    const d = new Date(dt);
    return (
      d.toLocaleDateString("en-IN") +
      " | " +
      d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }

  function StatusBadge({ status }) {
    if (status === "RESOLVED")
      return (
        <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md font-semibold">
          RESOLVED
        </span>
      );

    if (status === "CANCELLED")
      return (
        <span className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md font-semibold">
          CANCELLED
        </span>
      );

    return (
      <span className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-md">
        UNKNOWN
      </span>
    );
  }

  return (
    <div className="space-y-6">

      {loading && (
        <div className="text-center text-gray-600">Loading...</div>
      )}

      {!loading && appointments.length === 0 && (
        <div className="text-center text-gray-600">No history found.</div>
      )}

      {appointments.map((a) => (
        <div key={a.id} className="border-2 border-blue-600 rounded-xl p-6 bg-white">
          <div className="flex gap-4">

            {/* Patient Section */}
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">{a.patient.userName}</h2>
                <StatusBadge status={a.status} />
              </div>

              <p className="text-sm text-gray-500">{a.patient.email}</p>

              <div className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                <MapPin size={16} /> {a.patient.city}, {a.patient.state}
              </div>

              <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                <Clock size={16} /> {formatDateTime(a.scheduledAt)}
              </div>

              {/* NOTE */}
              {a.message && (
                <div className="mt-3 bg-gray-100 p-2 rounded-md text-sm">
                  <strong>Message:</strong> {a.message}
                </div>
              )}

              {/* CANCEL INFORMATION */}
              {a.status === "CANCELLED" && (
                <div className="mt-3 bg-red-50 border border-red-300 p-3 rounded-md text-sm text-red-700">
                  <strong>Cancelled By:</strong> {a.cancelledBy} <br />
                  <strong>Reason:</strong> {a.cancelReason}
                </div>
              )}

              {/* RESOLVE INFORMATION */}
              {a.status === "RESOLVED" && (
                <div className="mt-3 bg-green-50 border border-green-300 p-3 rounded-md text-sm text-green-700">
                  <strong>Resolved At:</strong> {formatDateTime(a.resolvedAt)}
                </div>
              )}

            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
