import React from "react";
import { X } from "lucide-react";

const UserBadgeItem = ({ user, handleFunction, admin }) => {
  const isAdmin = admin && admin._id === user._id;

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 m-1 text-xs font-medium rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
      <span>{user.name}</span>
      {isAdmin && <span className="text-[10px] text-amber-400 font-bold">(Admin)</span>}
      <button
        type="button"
        onClick={handleFunction}
        className="text-sky-400 hover:text-rose-400 transition-colors focus:outline-none"
      >
        <X size={13} />
      </button>
    </span>
  );
};

export default UserBadgeItem;
