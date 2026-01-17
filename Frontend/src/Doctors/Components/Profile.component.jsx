import React, { useState, useContext } from "react";
import axios from "axios";
import { DoctorContext } from "../context/DoctorContext.context.jsx";
import { ArrowLeft, Eye, EyeOff, Camera } from "lucide-react";

export default function DoctorProfile() {
  const { doctor, setDoctor } = useContext(DoctorContext);

  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const defaultIMG =
    doctor.profileImageUrl ||
    "https://cdn-icons-png.flaticon.com/512/387/387561.png";

  // store image as FILE (important)
  const [selectedImage, setSelectedImage] = useState(null);

  const [form, setForm] = useState({
    fullname: doctor.fullname || "",
    clinicName: doctor.clinicName || "",
    clinicAddress: doctor.clinicAddress || "",
    city: doctor.city || "",
    state: doctor.state || "",
    about: doctor.about || "",
    clinicOpenTime: doctor.clinicOpenTime || "",
    clinicCloseTime: doctor.clinicCloseTime || "",
    workingDays: doctor.workingDays || [],
    password: "",
    profileImageUrl: doctor.profileImageUrl || "",
  });

  const weekDays = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];

  function handleForm(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function toggleDay(day) {
    if (form.workingDays.includes(day)) {
      setForm({
        ...form,
        workingDays: form.workingDays.filter((d) => d !== day),
      });
    } else {
      setForm({
        ...form,
        workingDays: [...form.workingDays, day],
      });
    }
  }

  // image file handler (IMPORTANT)
  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImage(file); // actual file
    const preview = URL.createObjectURL(file);
    setForm({ ...form, profileImageUrl: preview });
  }

  async function save() {
    setLoading(true);
    const token = localStorage.getItem("doctorToken");

    // Create FormData for multipart upload
    const fd = new FormData();

    fd.append("fullname", form.fullname);
    fd.append("clinicName", form.clinicName);
    fd.append("clinicAddress", form.clinicAddress);
    fd.append("city", form.city);
    fd.append("state", form.state);
    fd.append("about", form.about);
    fd.append("clinicOpenTime", form.clinicOpenTime);
    fd.append("clinicCloseTime", form.clinicCloseTime);
    fd.append("workingDays", form.workingDays.join(",")); // CSV string

    if (form.password.trim() !== "") {
      fd.append("password", form.password);
    }

    if (selectedImage) {
      fd.append("profileImage", selectedImage);
    }

    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/doctors/update`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.status === "success") {
        setDoctor(res.data.data);
        setEdit(false);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center bg-white px-4">
      <div className="w-full max-w-4xl bg-white border-2 border-blue-600 rounded-2xl p-10">
        {/* Top Section */}
        <div className="flex items-center justify-between mb-10">
          <div className="relative">
            <img
              src={form.profileImageUrl || defaultIMG}
              className="w-24 h-24 rounded-full object-cover border-2 border-blue-600"
            />

            {edit && (
              <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white cursor-pointer">
                <Camera size={16} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          <button
            onClick={() => setEdit(!edit)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm"
          >
            {edit ? "Cancel" : "Edit"}
          </button>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <InputField label="Full Name" name="fullname" value={form.fullname} onChange={handleForm} disabled={!edit} />
          <InputField label="Clinic Name" name="clinicName" value={form.clinicName} onChange={handleForm} disabled={!edit} />
          <InputField label="Clinic Address" name="clinicAddress" value={form.clinicAddress} onChange={handleForm} disabled={!edit} />
          <InputField label="City" name="city" value={form.city} onChange={handleForm} disabled={!edit} />
          <InputField label="State" name="state" value={form.state} onChange={handleForm} disabled={!edit} />
          <InputField label="Clinic Open Time" name="clinicOpenTime" type="time" value={form.clinicOpenTime} onChange={handleForm} disabled={!edit} />
          <InputField label="Clinic Close Time" name="clinicCloseTime" type="time" value={form.clinicCloseTime} onChange={handleForm} disabled={!edit} />

          {/* About */}
          <div className="col-span-2">
            <label className="font-medium text-sm text-gray-700">About</label>
            <textarea
              name="about"
              disabled={!edit}
              value={form.about}
              onChange={handleForm}
              className="w-full mt-2 px-3 py-3 border border-gray-300 rounded-md"
              rows="3"
            />
          </div>

          {/* Working Days */}
          {edit && (
            <div className="col-span-2 grid grid-cols-3 md:grid-cols-7 gap-2">
              {weekDays.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-2 rounded-md border text-sm ${
                    form.workingDays.includes(day)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          )}

          {/* Password */}
          <PasswordField
            label="Change Password"
            name="password"
            value={form.password}
            onChange={handleForm}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            disabled={!edit}
          />

          {/* Read only */}
          <ReadOnlyField label="Email (Read Only)" value={doctor.email} />
          <ReadOnlyField label="Specialization (Fixed)" value={doctor.specialization} />
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

/* -------------------- Input Components -------------------- */

function InputField({ label, name, value, onChange, disabled, type = "text" }) {
  return (
    <div className="relative">
      <input
        type={type}
        name={name}
        disabled={disabled}
        value={value}
        onChange={onChange}
        className="peer w-full px-3 py-4 border border-gray-300 rounded-md placeholder-transparent disabled:bg-gray-100 focus:ring-2 focus:ring-blue-600"
        placeholder={label}
      />
      <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm text-gray-600 peer-focus:text-blue-600">
        {label}
      </label>
    </div>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div className="relative">
      <input
        value={value}
        disabled
        className="peer w-full px-3 py-4 border border-gray-300 rounded-md bg-gray-100 placeholder-transparent"
        placeholder={label}
      />
      <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm text-gray-600">
        {label}
      </label>
    </div>
  );
}

function PasswordField({
  label,
  name,
  value,
  onChange,
  disabled,
  showPassword,
  setShowPassword,
}) {
  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        disabled={disabled}
        value={value}
        onChange={onChange}
        className="peer w-full px-3 py-4 pr-12 border border-gray-300 rounded-md placeholder-transparent disabled:bg-gray-100 focus:ring-2 focus:ring-blue-600"
        placeholder={label}
      />

      <label className="absolute left-3 -top-2.5 px-1 bg-white text-sm text-gray-600 peer-focus:text-blue-600">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
}
