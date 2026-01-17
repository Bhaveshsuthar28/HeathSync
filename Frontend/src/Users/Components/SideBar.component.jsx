import React, { useContext } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User2, Search, CalendarCheck, Clock4, LogOut, X } from "lucide-react";
import { UserContext } from "../context/UserContext.context.jsx";

export default function Sidebar({ open, onClose, onNavigate }) {
  const { user } = useContext(UserContext);



  const firstLetter = user?.userName?.trim()?.charAt(0)?.toUpperCase() || "U";

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
        className="fixed left-0 top-0 h-full w-72 bg-white shadow-xl border-r border-gray-200 z-40"
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-3 max-w-[70%]">
            <div className="w-16 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-semibold">
              {firstLetter}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold text-gray-800 truncate">
                Hi , {user?.userName}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {user?.email}
              </div>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
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
    <button onClick={onClick} className="flex items-center gap-3 bg-gray-100 hover:bg-gray-200 rounded-md px-3 py-3 text-left">
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">{icon}</div>
      <div className="flex-1 text-gray-800">{label}</div>
      <div className="text-gray-400">›</div>
    </button>
  );
}
