import React, { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, Clock, Mail, MapPin, XCircle } from "lucide-react";
import { toast } from "react-toastify";

export default function UpcomingAppointments({ onBack }) {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);

  const [cancelBox, setCancelBox] = useState(null); // appointment.id which is opened
  const [cancelReason, setCancelReason] = useState("");

  const token = localStorage.getItem("userToken");

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/appointments/user/upcoming`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAppointments(res.data?.data?.appointments || []);
    } catch (err) {
      toast.error("Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmCancel(id) {
    if (!cancelReason.trim()) {
      toast.error("Please enter a cancellation reason.");
      return;
    }

    try {
      await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/appointments/${id}/cancel`,
        { reason: cancelReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Appointment cancelled!");
      setCancelBox(null);
      setCancelReason("");
      fetchAppointments();
    } catch (err) {
      toast.error("Cancellation failed.");
    }
  }

  async function resendOtp(id) {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/appointments/${id}/resend-otp`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      res.data.status === "error"
        ? toast.error(res.data.message)
        : toast.success("OTP sent successfully!");
    } catch (err) {
      toast.error("Could not resend OTP.");
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
    <main className="min-h-screen bg-white px-4 py-8 max-w-5xl mx-auto">

      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 font-medium mb-6"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <h1 className="text-2xl font-semibold mb-8">Upcoming Appointments</h1>

      {loading && <div className="text-center text-gray-600">Loading...</div>}

      {!loading && appointments.length === 0 && (
        <div className="text-center text-gray-600 mt-10">
          No upcoming appointments.
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
                <h2 className="text-lg font-semibold text-gray-800">
                  {a.doctor.fullname}
                </h2>
                <p className="text-sm text-gray-500">
                  {a.doctor.specialization}
                </p>

                <div className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                  <MapPin size={16} /> {a.doctor.clinicName}, {a.doctor.city}
                </div>

                <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                  <Clock size={16} /> {formatDateTime(a.scheduledAt)}
                </div>

                <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                  <Mail size={16} /> {a.doctor.email}
                </div>

                {a.message && (
                  <div className="mt-3 text-gray-700 text-sm bg-gray-100 p-2 rounded-md">
                    <strong>Message:</strong> {a.message}
                  </div>
                )}

                {/* SHOW CANCEL BOX ONLY FOR THIS CARD */}
                {cancelBox === a.id && (
                  <div className="mt-4 bg-gray-100 p-3 rounded-md border border-gray-300">
                    <label className="text-sm font-medium text-gray-700">
                      Cancellation Reason
                    </label>

                    <textarea
                      rows="3"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md 
                                 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="Enter reason..."
                    />

                    <div className="mt-3 flex gap-3">
                      <button
                        onClick={() => confirmCancel(a.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                      >
                        Confirm Cancel
                      </button>

                      <button
                        onClick={() => setCancelBox(null)}
                        className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 text-sm"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}

                {/* BUTTONS */}
                {cancelBox !== a.id && (
                  <div className="mt-4 flex gap-3">

                    {/* Cancel Button */}
                    <button
                      onClick={() => setCancelBox(a.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm flex items-center gap-2"
                    >
                      <XCircle size={16} /> Cancel Appointment
                    </button>

                    {/* Resend OTP */}
                    {a.status === "PENDING" && (
                      <button
                        onClick={() => resendOtp(a.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                      >
                        Resend OTP
                      </button>
                    )}
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
