import React from "react";

const UserListItem = ({ user, handleFunction }) => {
  return (
    <div
      onClick={handleFunction}
      className="flex items-center gap-3 w-full p-2.5 mb-2 bg-slate-800/80 hover:bg-sky-600/30 border border-slate-700/60 hover:border-sky-500/50 rounded-xl cursor-pointer transition-all duration-200"
    >
      <img
        src={user.pic || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"}
        alt={user.name}
        className="w-10 h-10 rounded-full object-cover border border-slate-600"
      />
      <div className="flex flex-col overflow-hidden text-left">
        <span className="text-sm font-semibold text-slate-100 truncate">{user.name}</span>
        <span className="text-xs text-slate-400 truncate">{user.email}</span>
      </div>
    </div>
  );
};

export default UserListItem;
