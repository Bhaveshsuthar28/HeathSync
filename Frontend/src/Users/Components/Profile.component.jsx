import React, { useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../context/UserContext.context";
import { ArrowLeft } from "lucide-react";
import { State, City } from "country-state-city";

export default function UserProfile({ onBack }) {
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useContext(UserContext);

  const [form, setForm] = useState({
    userName: user.userName || "",
    state: user.state || "",
    city: user.city || "",
  });

  if (!user) {
    return (
      <div className="w-full text-center py-20 text-gray-600">
        Loading profile...
      </div>
    );
  }

  const defaultIMG = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const indianStates = State.getStatesOfCountry("IN");
  const selectedState = indianStates.find((s) => s.name === form.state);
  const cities = selectedState
    ? City.getCitiesOfState("IN", selectedState.isoCode)
    : [];

  const handle = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleStateChange = (e) => {
    const selected = e.target.value;
    setForm({ ...form, state: selected, city: "" });
  };

  const save = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("userToken");

      const payload = {
        userName: form.userName,
        city: form.city,
        state: form.state,
      };

      const res = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/users/update`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.status === "success") {
        setUser(res.data.data);
        setEdit(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center bg-white px-4">
      
      <div className="w-full max-w-4xl mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 font-medium"
        >
          <ArrowLeft size={18} />
          Back
        </button>
      </div>

      <div className="w-full max-w-4xl bg-white border-2 border-blue-600 rounded-2xl p-10">

        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-6">
            <img
              src={defaultIMG}
              className="w-24 h-24 rounded-full bg-gray-200 object-cover"
            />

            <div>
              <h2 className="text-xl font-semibold">{form.userName}</h2>
              <p className="text-gray-500 text-sm">{user.email}</p>
            </div>
          </div>

          <button
            onClick={() => setEdit(!edit)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm"
          >
            {edit ? "Cancel" : "Edit"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">

          <div className="relative">
            <input
              name="userName"
              value={form.userName}
              disabled={!edit}
              onChange={handle}
              placeholder="Full Name"
              className="peer w-full px-3 py-4 border border-gray-300 rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-blue-600
                         placeholder-transparent disabled:bg-gray-100"
            />
            <label
              className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-gray-600 
              transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
              peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
            >
              Full Name
            </label>
          </div>

          <div className="relative">
            <select
              name="state"
              value={form.state}
              disabled={!edit}
              onChange={handleStateChange}
              className="peer w-full px-3 py-4 border border-gray-300 rounded-md bg-white
                         focus:outline-none focus:ring-2 focus:ring-blue-600
                         placeholder-transparent disabled:bg-gray-100"
            >
              <option value="">Select State</option>
              {indianStates.map((s) => (
                <option key={s.isoCode}>{s.name}</option>
              ))}
            </select>

            <label
              className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-gray-600 
              transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
              peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
            >
              State
            </label>
          </div>

          <div className="relative">
            <select
              name="city"
              value={form.city}
              disabled={!edit || !form.state}
              onChange={handle}
              className="peer w-full px-3 py-4 border border-gray-300 rounded-md bg-white
                         focus:outline-none focus:ring-2 focus:ring-blue-600
                         placeholder-transparent disabled:bg-gray-100"
            >
              <option value="">Select City</option>
              {cities.map((c) => (
                <option key={c.name}>{c.name}</option>
              ))}
            </select>

            <label
              className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-gray-600 
              transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
              peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
            >
              City
            </label>
          </div>

          <div className="relative">
            <input
              value={user.email}
              disabled
              placeholder="Email"
              className="peer w-full px-3 py-4 border border-gray-300 rounded-md bg-gray-100 
                         placeholder-transparent"
            />

            <label
              className="absolute left-3 -top-2.5 px-1 bg-white text-sm font-medium text-gray-600 
              transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
              peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
            >
              Email (Read Only)
            </label>
          </div>

        </div>

        {edit && (
          <div className="flex justify-end mt-10">
            <button
              onClick={save}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-md text-sm"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
