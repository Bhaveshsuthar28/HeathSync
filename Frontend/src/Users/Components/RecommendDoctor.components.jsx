// src/components/RecommendedSlider.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import DoctorCard from "./DoctorCard.component.jsx";
import DoctorCardSkeleton from "./DoctorCardLoader.component.jsx";

export default function RecommendedSlider({ fetchUrl, params = {}, limit = 6 }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUrl, JSON.stringify(params)]);

  async function fetchDoctors() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(fetchUrl, {
        params: { ...params, page: 0, size: limit },
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const docs = res.data?.data?.doctors ?? res.data?.data ?? [];
      setDoctors(docs);
    } catch (err) {
      console.error("Failed fetching doctors", err);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mb-6">
      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide py-2 px-1"
        style={{ scrollBehavior: "smooth" }}
      >
        {loading ? (
          <div className="flex gap-4">
            {[1, 2, 3, 4 , 5 , 6].map((i) => (
              <DoctorCardSkeleton key={i} />
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-sm text-gray-500 p-4">No doctors found.</div>
        ) : (
          doctors.map((d) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <DoctorCard doctor={d} />
            </motion.div>
          ))
        )}

      </div>
    </section>
  );
}
