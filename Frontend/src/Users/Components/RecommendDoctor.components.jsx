import React, { useRef } from "react";
import { motion } from "framer-motion";
import DoctorCard from "./DoctorCard.component.jsx";
import DoctorCardSkeleton from "./DoctorCardLoader.component.jsx";

export default function RecommendedSlider({ doctors, onOpenDoctor }) {
  const containerRef = useRef(null);

  return (
    <section className="mb-6">
      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide py-2 px-1"
      >
        {!doctors || doctors.length === 0 ? (
          <div className="flex gap-4">
            {[...Array(6)].map((_, i) => (
              <DoctorCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          doctors.map((doc) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <DoctorCard doctor={doc} onOpenDoctor={onOpenDoctor} />
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
}
