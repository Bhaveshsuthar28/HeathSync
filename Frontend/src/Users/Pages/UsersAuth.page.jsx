import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { OtpVerify } from "../Components/VerifyOTP.component.jsx";
import logo from "../../assets/Logo.png";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {useNavigate} from "react-router-dom"
import TitleChanger from "../../title.jsx";

export const UserAuth = () => {
  TitleChanger("Authantication");
  const [state, setState] = useState("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const formSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (state === "signup") {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/users/register`,
          form
        );
        if (response.data.status === "success") {
          setUserEmail(form.email);
          setState("verify");
          toast.success("O.T.P sent on your email.");
        }
      } else if (state === "login") {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/users/login`,
          {
            email: form.email,
            password: form.password,
          }
        );
        if (response.data.status === "success") {
          const token = response.data?.data?.token;
          localStorage.setItem("userToken", token);
          toast.success("Login successful!");
          setTimeout(() => {
            navigate("/user-home")
          }, 1500);
        } else {
          toast.error(response.data.message || "Login failed");
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-8 relative overflow-hidden">
      <div className="absolute top-0 left-0">
        <img src={logo} alt="HealthSync Logo" className="h-40 w-auto object-cover" />
      </div>
      <ToastContainer position="top-center" autoClose={2000} hideProgressBar />
      <div className="w-full max-w-md bg-white rounded-2xl border-2 border-blue-600 p-8 perspective">
        <AnimatePresence mode="wait">
          {state !== "verify" ? (
            <motion.div
              key={state}
              initial={{ rotateY: 180, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -180, opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  {state === "signup" ? "Create your account" : "Sign in"}
                </h1>
                <p className="text-sm text-gray-600">to continue to HealthSync</p>
              </div>

              <form onSubmit={formSubmit} className="space-y-6">
                {state === "signup" && (
                  <div className="relative">
                    <input
                      name="username"
                      type="text"
                      id="username"
                      onChange={handleForm}
                      value={form.username}
                      className="peer w-full px-3 py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-transparent"
                      placeholder="Fullname"
                      required
                    />
                    <label
                      htmlFor="username"
                      className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
                    >
                      Fullname
                    </label>
                  </div>
                )}

                <div className="relative">
                  <input
                    name="email"
                    type="email"
                    id="email"
                    onChange={handleForm}
                    value={form.email}
                    className="peer w-full px-3 py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-transparent"
                    placeholder="Email"
                    required
                  />
                  <label
                    htmlFor="email"
                    className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
                  >
                    Email
                  </label>
                </div>

                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    id="password"
                    onChange={handleForm}
                    value={form.password}
                    className="peer w-full px-3 py-4 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-transparent"
                    placeholder="Password"
                    required
                  />
                  <label
                    htmlFor="password"
                    className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <button
                  className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    loading ? "opacity-75" : ""
                  }`}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : state === "signup" ? (
                    "Create account"
                  ) : (
                    "Sign in"
                  )}
                </button>

                <div className="text-center mt-6">
                  <p className="text-sm text-gray-600">
                    {state === "signup"
                      ? "Already have an account?"
                      : "Don't have an account?"}{" "}
                    <button
                      type="button"
                      onClick={() =>
                        setState(state === "signup" ? "login" : "signup")
                      }
                      className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition"
                    >
                      {state === "signup" ? "Sign in" : "Create account"}
                    </button>
                  </p>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="verify"
              initial={{ rotateY: 180, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -180, opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <OtpVerify email={userEmail} onBack={() => setState("signup")} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};
