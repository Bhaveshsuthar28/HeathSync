import React, { useEffect, useState } from "react";
import axios from "axios";
import { Clock, Mail, MapPin, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-toastify";

export default function DoctorUpcoming() {
  const [setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);

  const [resolveBox, setResolveBox] = useState(null);
  const [cancelBox, setCancelBox] = useState(null);

  const [otp, setOtp] = useState("");
  const [reason, setReason] = useState("");

  const token = localStorage.getItem("doctorToken");

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/appointments/doctor/upcoming`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAppointments(res.data?.data?.appointments || []);
    } catch {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }

  async function submitResolve(id) {
    if (!otp.trim()) {
      toast.error("Enter OTP");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/appointments/${id}/resolve`,
        { otp },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Appointment resolved!");
      setResolveBox(null);
      setOtp("");
      fetchAppointments();
    } catch {
      toast.error("Failed to resolve");
    }
  }

  async function submitCancel(id) {
    if (!reason.trim()) {
      toast.error("Enter reason");
      return;
    }

    try {
      await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/appointments/${id}/cancel`,
        { reason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Appointment cancelled!");
      setCancelBox(null);
      setReason("");
      fetchAppointments();
    } catch {
      toast.error("Failed to cancel");
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
    <div className="space-y-6">
      {appointments.map((a) => (
        <div key={a.id} className="border border-blue-600 rounded-xl p-6 bg-white">
          <div className="flex gap-4">

            <div className="flex-1">
              <h2 className="text-lg font-semibold">{a.patient.userName}</h2>
              <p className="text-sm text-gray-500">{a.patient.email}</p>

              <div className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                <MapPin size={16} /> {a.patient.city}
              </div>

              <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                <Clock size={16} /> {formatDateTime(a.scheduledAt)}
              </div>

              {a.message && (
                <div className="mt-3 bg-gray-100 p-2 rounded-md text-sm">
                  <strong>Note:</strong> {a.message}
                </div>
              )}

              {/* RESOLVE BOX */}
              {resolveBox === a.id && (
                <div className="mt-4 bg-gray-100 p-3 rounded-md border border-gray-300">
                  <label className="text-sm font-medium">Enter OTP</label>
                  <input
                    type="number"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="OTP"
                  />

                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => submitResolve(a.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md text-sm"
                    >
                      Submit
                    </button>

                    <button
                      onClick={() => setResolveBox(null)}
                      className="px-4 py-2 bg-gray-300 rounded-md text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* CANCEL BOX */}
              {cancelBox === a.id && (
                <div className="mt-4 bg-gray-100 p-3 rounded-md border border-gray-300">
                  <label className="text-sm font-medium">Cancel Reason</label>
                  <textarea
                    rows="3"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter reason..."
                  />

                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => submitCancel(a.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md text-sm"
                    >
                      Submit
                    </button>

                    <button
                      onClick={() => setCancelBox(null)}
                      className="px-4 py-2 bg-gray-300 rounded-md text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {/* BUTTONS (ONLY when no box open) */}
              {resolveBox !== a.id && cancelBox !== a.id && (
                <div className="mt-4 flex gap-3">

                  <button
                    onClick={() => setResolveBox(a.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm flex items-center gap-2"
                  >
                    <CheckCircle size={16} /> Resolve
                  </button>

                  <button
                    onClick={() => setCancelBox(a.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-md text-sm flex items-center gap-2"
                  >
                    <XCircle size={16} /> Cancel
                  </button>

                </div>
              )}

            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
