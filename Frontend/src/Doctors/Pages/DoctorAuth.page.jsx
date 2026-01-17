import React, { useState} from "react";
import axios from "axios";
import { State, City } from "country-state-city";
import { Eye, EyeOff , MapPin , Clock} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DoctorVerifyOTP from "../Components/Verifyotp.components.jsx";
import logo from "../../assets/Logo.png";
import doctorImg from "../../assets/doctor.png";
import { useNavigate } from "react-router-dom";
import { SPECIALIZATIONS } from "../../Spec.jsx";
import TitleChanger from "../../title.jsx";

export const DoctorAuth = () => {
  TitleChanger("Authantication");
  const [state, setState] = useState("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [doctorEmail, setDoctorEmail] = useState("");
  const navigate = useNavigate();

  const initialForm = {
    fullname: "",
    email: "",
    password: "",
    phoneNumber: "",
    specialization: "",
    clinicName: "",
    clinicAddress: "",
    city: "",
    clinicOpenTime: "",
    clinicCloseTime: "",
    state: "",
    about: "",
    regNumber: "",
    profileImage: null,
  };

  const [form, setForm] = useState(initialForm);

  const handleForm = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setForm((prev) => ({ ...prev, profileImage: file }));
  };

  const indianStates = State.getStatesOfCountry("IN");
  const selectedState = indianStates.find((s) => s.name === form.state);
  const cities = selectedState ? City.getCitiesOfState("IN", selectedState.isoCode) : [];

  const handleStateChange = (e) => {
    const selected = e.target.value;
    setForm((p) => ({ ...p, state: selected, city: "" }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          formData.append(key, value);
        }
      });

      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/doctors/register`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (res.data?.status === "success") {
        toast.success("OTP sent to email. Please verify.");
        setDoctorEmail(form.email);
        setState("verify");
      } else {
        toast.error(res.data?.message || "Signup failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/doctors/login`,
        {
          email: form.email,
          password: form.password,
        }
      );
      if (res.data?.status === "success") {
        const token = res.data?.data?.token;
        localStorage.setItem("doctorToken", token);
        toast.success("Login successful");
        setTimeout(() => {
          navigate("/doctor-home");
          setLoading(false);
        }, 1200);
      } else {
        toast.error(res.data?.message || "Login failed");
        setLoading(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login error");
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    if (geoLoading || form.clinicAddress) return;

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported.");
      return;
    }
    setGeoLoading(true);
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`
            );
            if (!res.ok) {
              throw new Error("Reverse geocoding failed");
            }
            const data = await res.json();
            const address = data?.display_name ?? "";
            const addrDetails = data?.address ?? {};
            const cityValue =
              addrDetails.city ||
              addrDetails.town ||
              addrDetails.village ||
              addrDetails.suburb ||
              "";

            setForm((prev) => ({
              ...prev,
              clinicAddress: prev.clinicAddress || address,
              city: prev.city || cityValue,
            }));

            if (!cityValue) {
              toast.info("Location fetched, but city name was not available.");
            } else {
              toast.success("Clinic address updated from current location.");
            }
          } catch (error) {
            toast.error("Unable to fetch location details." , error.message);
          } finally {
            setGeoLoading(false);
          }
        },
        (error) => {
          const message =
            error.code === error.PERMISSION_DENIED
              ? "Location permission denied."
              : "Unable to fetch current location.";
          toast.error(message);
          setGeoLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    };

  return (
    <main className="min-h-screen flex items-center justify-center bg-white p-6">
      <ToastContainer position="top-center" autoClose={2000} hideProgressBar />
      <div className="absolute top-6 left-6">
        <img src={logo} alt="HealthSync" className="h-28 w-auto" />
      </div>

      <div className="w-full max-w-4xl bg-white rounded-2xl border-2 border-blue-600 p-8 shadow-lg">
        <AnimatePresence mode="wait">
          {state !== "verify" ? (
            <motion.div
              key={state}
              initial={{ rotateY: 180, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -180, opacity: 0 }}
              transition={{ duration: 0.55 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                      {state === "signup" ? "Doctor Signup" : "Doctor Login"}
                    </h1>
                    <p className="text-sm text-gray-600">
                      Access HealthSync Doctor Panel
                    </p>
                  </div>

                  <form
                    onSubmit={state === "signup" ? handleSignup : handleLogin}
                    className="space-y-4"
                  >
                    {state === "signup" && (
                      <>
                        <div className="relative">
                          <input
                            name="fullname"
                            id="fullname"
                            value={form.fullname}
                            onChange={handleForm}
                            className="peer w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-transparent"
                            placeholder="Fullname"
                            required
                          />
                          <label
                            htmlFor="fullname"
                            className="absolute left-3 -top-2.5 px-1 bg-white text-sm text-gray-600 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
                          >
                            Fullname
                          </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="relative">
                            <input
                              name="phoneNumber"
                              id="phoneNumber"
                              value={form.phoneNumber}
                              onChange={handleForm}
                              className="peer w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-transparent"
                              placeholder="Phone Number"
                              required
                            />
                            <label
                              htmlFor="phoneNumber"
                              className="absolute left-3 -top-2.5 px-1 bg-white text-sm text-gray-600 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
                            >
                              Phone Number
                            </label>
                          </div>

                          <div className="relative">
                            <select
                              name="specialization"
                              id="specialization"
                              value={form.specialization}
                              onChange={handleForm}
                              className="peer w-full px-3 py-3 border border-gray-300 rounded-md 
                                        bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                              required
                            >
                              <option value="">Select Specialization</option>

                              {SPECIALIZATIONS.map((spec) => (
                                <option key={spec} value={spec}>
                                  {spec}
                                </option>
                              ))}
                            </select>

                            <label
                              htmlFor="specialization"
                              className="absolute left-3 -top-2.5 px-1 bg-white text-sm text-gray-600
                                        transition-all peer-focus:text-blue-600"
                            >
                              Specialization
                            </label>
                          </div>

                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="relative">
                            <select
                              name="state"
                              id="state"
                              value={form.state}
                              onChange={handleStateChange}
                              className="peer w-full px-3 py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                              required
                            >
                              <option value="">Select State</option>
                              {indianStates.map((s) => (
                                <option key={s.isoCode} value={s.name}>
                                  {s.name}
                                </option>
                              ))}
                            </select>
                            <label
                              htmlFor="state"
                              className="absolute left-3 -top-2.5 px-1 bg-white text-sm text-gray-600 transition-all peer-focus:text-blue-600"
                            >
                              State
                            </label>
                          </div>

                          <div className="relative">
                            <select
                              name="city"
                              id="city"
                              value={form.city}
                              onChange={handleForm}
                              className="peer w-full px-3 py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                              disabled={!form.state}
                              required
                            >
                              <option value="">Select City</option>
                              {cities.map((c) => (
                                <option key={c.name} value={c.name}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                            <label
                              htmlFor="city"
                              className="absolute left-3 -top-2.5 px-1 bg-white text-sm text-gray-600 transition-all peer-focus:text-blue-600"
                            >
                              City
                            </label>
                          </div>
                        </div>

                        <div className="relative">
                          <input
                            name="clinicName"
                            id="clinicName"
                            value={form.clinicName}
                            onChange={handleForm}
                            className="peer w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-transparent"
                            placeholder="Clinic Name"
                          />
                          <label
                            htmlFor="clinicName"
                            className="absolute left-3 -top-2.5 px-1 bg-white text-sm text-gray-600 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
                          >
                            Clinic Name
                          </label>
                        </div>

                        <div className="relative">
                          <input
                            name="clinicAddress"
                            id="clinicAddress"
                            value={form.clinicAddress}
                            onChange={handleForm}
                            className="peer w-full px-3 py-3 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-transparent"
                            placeholder="Clinic Address"
                          />
                          <label
                            htmlFor="clinicAddress"
                            className="absolute left-3 -top-2.5 px-1 bg-white text-sm text-gray-600 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
                          >
                            Clinic Address
                          </label>
                          {!form.clinicAddress && (
                            <button
                              type="button"
                              onClick={handleUseCurrentLocation}
                              disabled={geoLoading}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 disabled:opacity-60"
                              title="Use current location"
                            >
                              <MapPin className="w-5 h-5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          <div className="relative">
                            <input
                              type="time"
                              id="clinicOpenTime"
                              name="clinicOpenTime"
                              value={form.clinicOpenTime}
                              onChange={handleForm}
                              className="peer w-full px-3 py-3 pr-10 border border-gray-300 rounded-md
                                        focus:outline-none focus:ring-2 focus:ring-blue-600
                                        placeholder-transparent"
                              placeholder="Clinic Opens"
                              required
                            />

                            <label
                              htmlFor="clinicOpenTime"
                              className="absolute left-3 -top-2.5 px-1 bg-white text-sm text-gray-600
                                        transition-all
                                        peer-placeholder-shown:top-3 
                                        peer-placeholder-shown:text-base 
                                        peer-placeholder-shown:text-gray-400 
                                        peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
                            >
                              Clinic opens
                            </label>

                            <Clock className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 w-5 h-5 pointer-events-none" />
                          </div>

                          <div className="relative">
                            <input
                              type="time"
                              id="clinicCloseTime"
                              name="clinicCloseTime"
                              value={form.clinicCloseTime}
                              onChange={handleForm}
                              className="peer w-full px-3 py-3 pr-10 border border-gray-300 rounded-md
                                        focus:outline-none focus:ring-2 focus:ring-blue-600
                                        placeholder-transparent"
                              placeholder="Clinic Closes"
                              required
                            />

                            <label
                              htmlFor="clinicCloseTime"
                              className="absolute left-3 -top-2.5 px-1 bg-white text-sm text-gray-600
                                        transition-all
                                        peer-placeholder-shown:top-3 
                                        peer-placeholder-shown:text-base 
                                        peer-placeholder-shown:text-gray-400 
                                        peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
                            >
                              Clinic closes
                            </label>

                            <Clock className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 w-5 h-5 pointer-events-none" />
                          </div>

                        </div>

                        <div className="relative">
                          <textarea
                            name="about"
                            id="about"
                            value={form.about}
                            onChange={handleForm}
                            rows="3"
                            className="peer w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-transparent"
                            placeholder="About (experience, specialties)"
                          />
                          <label
                            htmlFor="about"
                            className="absolute left-3 -top-2.5 px-1 bg-white text-sm text-gray-600 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
                          >
                            About (experience, specialties)
                          </label>
                        </div>

                        <div className="relative">
                          <input
                            name="regNumber"
                            id="regNumber"
                            value={form.regNumber}
                            onChange={handleForm}
                            className="peer w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-transparent"
                            placeholder="Registration Number"
                          />
                          <label
                            htmlFor="regNumber"
                            className="absolute left-3 -top-2.5 px-1 bg-white text-sm text-gray-600 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
                          >
                            Registration Number
                          </label>
                        </div>

                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-600 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Upload profile photo (required)
                          </p>
                        </div>
                      </>
                    )}

                    <div className="relative">
                      <input
                        name="email"
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={handleForm}
                        className="peer w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-transparent"
                        placeholder="Email"
                        required
                      />
                      <label
                        htmlFor="email"
                        className="absolute left-3 -top-2.5 px-1 bg-white text-sm text-gray-600 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
                      >
                        Email
                      </label>
                    </div>

                    <div className="relative">
                      <input
                        name="password"
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={handleForm}
                        className="peer w-full px-3 py-3 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-transparent"
                        placeholder="Password"
                        required={state === "login"}
                      />
                      <label
                        htmlFor="password"
                        className="absolute left-3 -top-2.5 px-1 bg-white text-sm text-gray-600 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-blue-600 text-white rounded-md font-medium disabled:opacity-60"
                    >
                      {loading ? (
                        <div className="flex justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : state === "signup" ? (
                        "Create Doctor Account"
                      ) : (
                        "Sign In"
                      )}
                    </button>

                    <div className="text-center mt-4">
                      <p className="text-sm text-gray-600">
                        {state === "signup"
                          ? "Already registered?"
                          : "Need an account?"}{" "}
                        <button
                          type="button"
                          onClick={() =>
                            setState(state === "signup" ? "login" : "signup")
                          }
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {state === "signup" ? "Sign in" : "Create account"}
                        </button>
                      </p>
                    </div>
                  </form>
                </div>

                <div className="hidden md:flex items-center justify-center p-4 bg-white rounded-lg">
                  <div>
                    <img
                      src={doctorImg}
                      alt="Doctor Illustration"
                      className="w-64 h-auto mb-4 object-contain"
                    />
                    <h3 className="text-lg font-semibold mb-2">
                      Doctor Portal
                    </h3>
                    <p className="text-sm text-gray-600">
                      Register with your professional details. We'll send an OTP
                      to verify your email before finishing registration.
                    </p>
                    <ul className="mt-4 text-sm text-gray-700 list-disc list-inside space-y-1">
                      <li>Use a valid professional email</li>
                      <li>Provide registration number for verification</li>
                      <li>You will get access to doctor dashboard after verification</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="verify"
              initial={{ rotateY: 180, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -180, opacity: 0 }}
              transition={{ duration: 0.55 }}
            >
              <div className="max-w-md mx-auto">
                <DoctorVerifyOTP
                  email={doctorEmail}
                  onBack={() => setState("signup")}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};
