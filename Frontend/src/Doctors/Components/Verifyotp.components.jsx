
import React, { useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const DoctorVerifyOTP = ({ email, onBack }) => {
  const inputRef = useRef([]);
  const [digits, setDigits] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInput = (e, index) => {
    const val = (e.target.value || "").replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = val;
    setDigits(next);
    if (val && index < inputRef.current.length - 1) {
      inputRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRef.current[index - 1]?.focus();
    }
  };

  const pasteData = (e) => {
    const paste = e.clipboardData.getData("text");
    const numeric = paste.replace(/\D/g, "").slice(0, 6).split("");
    if (numeric.length === 0) return;
    const next = Array(6).fill("");
    numeric.forEach((d, i) => (next[i] = d));
    setDigits(next);
    const focusIndex = Math.min(numeric.length, 5);
    inputRef.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length !== 6) {
      toast.error("Enter 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/doctors/verify-otp`,
        { email, otp }
      );
      if (res.data?.data?.token) {
        localStorage.setItem("doctorToken", res.data.data.token);
        toast.success("Doctor registered and verified!");
        setTimeout(() => navigate("/doctor-home"), 1200);
      } else {
        toast.error(res.data?.message || "Invalid OTP");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center">
      <ToastContainer position="top-center" autoClose={2000} hideProgressBar />
      <h2 className="text-2xl font-semibold mb-2 text-gray-900">
        Verify your email
      </h2>
      <p className="text-sm text-gray-600 mb-6">Enter 6-digit OTP sent to {email}</p>

      <form onSubmit={handleSubmit} onPaste={pasteData} className="space-y-6">
        <div className="flex justify-center gap-2">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <input
                key={i}
                ref={(el) => (inputRef.current[i] = el)}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength="1"
                value={digits[i]}
                onChange={(e) => handleInput(e, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                className="w-12 h-12 border border-gray-300 rounded-md text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 bg-blue-600 text-white rounded-md font-medium transition disabled:opacity-60`}
        >
          {loading ? (
            <div className="flex justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            "Verify & Finish"
          )}
        </button>
      </form>

      <div className="mt-4">
        <button
          onClick={onBack}
          className="text-sm text-blue-600 hover:underline"
        >
          Back to Signup
        </button>
      </div>
    </div>
  );
};

export default DoctorVerifyOTP;
