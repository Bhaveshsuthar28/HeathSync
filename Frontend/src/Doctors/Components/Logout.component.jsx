import React from "react";
import { LogOut } from "lucide-react";

export default function LogoutConfirm({ open, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      
      <div className="bg-white w-full max-w-sm rounded-xl p-6 border border-blue-600 shadow-lg relative">

        <div className="text-center">
          <LogOut className="mx-auto text-blue-600 mb-3" size={40} />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Logout Confirmation
          </h2>
          <p className="text-gray-600 text-sm">
            Are you sure you want to logout?
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Yes, Logout
          </button>
        </div>

      </div>

    </div>
  );
}
