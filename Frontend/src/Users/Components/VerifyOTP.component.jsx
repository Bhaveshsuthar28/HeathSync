import axios from "axios";
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const OtpVerify = ({ onBack, email }) => {
  const inputRef = useRef([]);
  const [digits, setDigits] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInput = (e, index) => {
    const val = (e.target.value || "").replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = val;
    setDigits(next);
    if (e.target.value.length > 0 && index < inputRef.current.length - 1) {
      inputRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRef.current[index - 1].focus();
    }
  };

  const pasteData = (e) => {
    const paste = e.clipboardData.getData("text");
    const numeric = paste.replace(/\D/g, "").slice(0, 6).split("");
    if (numeric.length === 0) return;
    const next = [...digits];
    for (let i = 0; i < numeric.length; i++) next[i] = numeric[i];
    setDigits(next);
    const firstEmpty = numeric.length < 6 ? numeric.length : 5;
    inputRef.current[firstEmpty]?.focus();
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
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/users/verify-otp`,
        { email, otp }
      );
      if (response.data.data?.token) {
        localStorage.setItem("userToken", response.data.data.token);
        toast.success("Email verified successfully!");
        setTimeout(() => navigate("/user-home"), 1500);
      } else {
        toast.error(response.data.message || "Invalid OTP");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Something went wrong. Try again."
      );
    } finally {
      setTimeout(() => setLoading(false), 1500);
    }
  };

  return (
    <div className="text-center">
      <ToastContainer position="top-center" autoClose={2000} hideProgressBar />
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">
        Verify your email
      </h1>
      <p className="text-sm text-gray-600 mb-8">
        Enter the 6-digit code sent to your email
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-2" onPaste={pasteData}>
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength="1"
                value={digits[index]}
                onChange={(e) => handleInput(e, index)}
                className="w-12 h-12 border border-gray-300 rounded-md text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
                ref={(e) => (inputRef.current[index] = e)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                required
              />
            ))}
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition disabled:opacity-50 ${
            loading ? "opacity-75" : ""
          }`}
        >
          {loading ? (
            <div className="flex justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            "Verify Email"
          )}
        </button>
      </form>
      <div className="text-center mt-6">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
        >
          Back to Signup
        </button>
      </div>
    </div>
  );
};
