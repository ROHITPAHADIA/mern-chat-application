import React, { useState } from "react";
import { X, Mail, User as UserIcon } from "lucide-react";

const ProfileModal = ({ user, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      {children ? (
        <span onClick={() => setIsOpen(true)} className="cursor-pointer">
          {children}
        </span>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <UserIcon size={20} />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center text-center mt-2">
              <div className="relative mb-4">
                <img
                  src={user.pic || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-sky-500/30 shadow-lg shadow-sky-500/10"
                />
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" />
              </div>

              <h2 className="text-xl font-bold text-slate-100">{user.name}</h2>
              
              <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-slate-800/80 rounded-full text-sm text-slate-300 border border-slate-700/50">
                <Mail size={15} className="text-sky-400" />
                <span>{user.email}</span>
              </div>

              <div className="w-full mt-6 pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileModal;
