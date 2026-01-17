import axios from "axios";
import { createContext, useEffect, useState } from "react";
import doctorImage from "../../assets/doctor.png";

export const DoctorContext = createContext();

export const DoctorProvider = ({ children }) => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("doctorToken");
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchDoctorProfile = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/doctors/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const doctorData = response.data?.data;
        setDoctor({
          ...doctorData,
          profileImage: doctorImage,
        });
      } catch (error) {
        console.error("Doctor profile fetch error:", error);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, []);

  return (
    <DoctorContext.Provider value={{ doctor, setDoctor, loading }}>
      {children}
    </DoctorContext.Provider>
  );
};
