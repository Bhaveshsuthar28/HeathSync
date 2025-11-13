// src/components/Sidebar.jsx
import React from "react";
import { motion } from "framer-motion";
import { User2, Search, CalendarCheck, Clock4, LogOut, X } from "lucide-react";

export default function Sidebar({ open, onClose, onNavigate }) {
  return (
    <>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black z-30"
        />
      )}

      <motion.aside
        initial={{ x: -320 }}
        animate={{ x: open ? 0 : -320 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-full w-72 bg-blue-600 text-white z-40 shadow-xl"
      >
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-semibold">U</div>
            <div>
              <div className="text-sm font-semibold">Hi, User</div>
              <div className="text-xs text-white/80">user@example.com</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        <nav className="p-4 flex flex-col gap-3">
          <SidebarItem icon={<User2 />} label="Profile" onClick={() => onNavigate("profile")} />
          <SidebarItem icon={<Search />} label="Search Doctor" onClick={() => onNavigate("search")} />
          <SidebarItem icon={<CalendarCheck />} label="Appointments" onClick={() => onNavigate("appointments")} />
          <SidebarItem icon={<Clock4 />} label="History" onClick={() => onNavigate("history")} />
          <SidebarItem icon={<LogOut />} label="Logout" onClick={() => onNavigate("logout")} />
        </nav>
      </motion.aside>
    </>
  );
}

function SidebarItem({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 bg-white/8 hover:bg-white/12 rounded-md px-3 py-3 text-left"
    >
      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">{icon}</div>
      <div className="flex-1">{label}</div>
      <div className="text-white/70">›</div>
    </button>
  );
}
