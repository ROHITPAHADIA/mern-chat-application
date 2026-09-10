import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User as UserIcon,
  X,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { ChatState } from "../../context/ChatProvider";
import ProfileModal from "./ProfileModal";
import UserListItem from "../UserAvatar/UserListItem";
import { getSender } from "../../config/ChatLogics";

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [error, setError] = useState("");

  const {
    user,
    setSelectedChat,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();

  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      setError("Please enter a name or email to search");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (err) {
      setLoading(false);
      setError("Failed to load search results");
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(`/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }

      setSelectedChat(data);
      setLoadingChat(false);
      setIsDrawerOpen(false);
    } catch (err) {
      setLoadingChat(false);
      setError("Error accessing chat");
    }
  };

  return (
    <>
      {/* Top Navbar */}
      <header className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800/80">
        {/* Search button */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-slate-300 hover:text-white text-sm transition"
        >
          <Search size={16} className="text-sky-400" />
          <span className="hidden sm:inline">Search User</span>
        </button>

        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-xl text-white shadow-md shadow-sky-500/20">
            <MessageSquare size={20} />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Talk-A-Tive
          </span>
        </div>

        {/* Actions: Notifications & Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsProfileOpen(false);
              }}
              className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              <Bell size={20} />
              {notification.length > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-rose-500 rounded-full animate-pulse">
                  {notification.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50">
                <div className="text-xs font-semibold text-slate-400 px-3 py-1 border-b border-slate-800">
                  Notifications
                </div>
                <div className="max-h-56 overflow-y-auto mt-1">
                  {!notification.length ? (
                    <div className="p-3 text-xs text-slate-500 text-center">
                      No new messages
                    </div>
                  ) : (
                    notification.map((notif) => (
                      <div
                        key={notif._id}
                        onClick={() => {
                          setSelectedChat(notif.chat);
                          setNotification(notification.filter((n) => n !== notif));
                          setIsNotifOpen(false);
                        }}
                        className="p-2 hover:bg-slate-800/80 rounded-xl cursor-pointer text-xs text-slate-200 transition mb-1"
                      >
                        {notif.chat.isGroupChat
                          ? `New Message in ${notif.chat.chatName}`
                          : `New Message from ${getSender(user, notif.chat.users)}`}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotifOpen(false);
              }}
              className="flex items-center gap-2 p-1 pl-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition"
            >
              <img
                src={user?.pic || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"}
                alt={user?.name}
                className="w-7 h-7 rounded-full object-cover"
              />
              <span className="hidden md:inline text-xs font-medium text-slate-200">
                {user?.name}
              </span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-1 z-50">
                <ProfileModal user={user}>
                  <button
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
                  >
                    <UserIcon size={15} className="text-sky-400" />
                    My Profile
                  </button>
                </ProfileModal>

                <button
                  onClick={logoutHandler}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl transition mt-1"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Slide-out Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Content */}
          <div className="relative w-80 max-w-full bg-slate-900 border-r border-slate-800 h-full p-4 flex flex-col z-10 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">Search Users</h3>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="mt-3 p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
                {error}
              </div>
            )}

            {/* Search Input Form */}
            <div className="flex gap-2 my-4">
              <input
                type="text"
                placeholder="Name or Email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1 px-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500"
              />
              <button
                onClick={handleSearch}
                className="px-3.5 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-xl transition"
              >
                Go
              </button>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto space-y-1">
              {loading ? (
                <div className="flex items-center justify-center py-8 text-sky-400">
                  <Loader2 size={24} className="animate-spin" />
                </div>
              ) : (
                searchResult.map((u) => (
                  <UserListItem
                    key={u._id}
                    user={u}
                    handleFunction={() => accessChat(u._id)}
                  />
                ))
              )}
              {loadingChat && (
                <div className="flex items-center justify-center py-4 text-sky-400">
                  <Loader2 size={20} className="animate-spin" />
                  <span className="ml-2 text-xs">Opening chat...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SideDrawer;
