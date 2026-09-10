import React, { useState } from "react";
import axios from "axios";
import { X, Settings, UserMinus, UserPlus, Loader2, Search } from "lucide-react";
import { ChatState } from "../../context/ChatProvider";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import UserListItem from "../UserAvatar/UserListItem";

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, fetchMessages }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameloading, setRenameLoading] = useState(false);
  const [error, setError] = useState("");

  const { selectedChat, setSelectedChat, user } = ChatState();

  const handleRename = async () => {
    if (!groupChatName.trim()) return;

    try {
      setRenameLoading(true);
      setError("");
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        "/api/chat/rename",
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);
      setGroupChatName("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to rename group");
      setRenameLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query.trim()) {
      setSearchResult([]);
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
      const { data } = await axios.get(`/api/user?search=${query}`, config);
      setSearchResult(data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load search results");
      setLoading(false);
    }
  };

  const handleAddUser = async (user1) => {
    if (selectedChat.users.find((u) => u._id === user1._id)) {
      setError("User already in group");
      return;
    }

    if (selectedChat.groupAdmin._id !== user._id) {
      setError("Only admins can add members");
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

      const { data } = await axios.put(
        "/api/chat/groupadd",
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add user");
      setLoading(false);
    }
  };

  const handleRemove = async (user1) => {
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      setError("Only admins can remove members");
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

      const { data } = await axios.put(
        "/api/chat/groupremove",
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );

      user1._id === user._id ? setSelectedChat(null) : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      if (fetchMessages) fetchMessages();
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove user");
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
        title="Group Settings"
      >
        <Settings size={20} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X size={18} />
            </button>

            <h2 className="text-xl font-bold text-slate-100 mb-2">{selectedChat.chatName}</h2>
            <p className="text-xs text-slate-400 mb-4">
              Admin: <span className="text-sky-400 font-semibold">{selectedChat.groupAdmin.name}</span>
            </p>

            {error && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
                {error}
              </div>
            )}

            {/* Member Badges */}
            <div className="flex flex-wrap gap-1 p-2 bg-slate-800/40 rounded-xl border border-slate-800 mb-4 max-h-28 overflow-y-auto">
              {selectedChat.users.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  admin={selectedChat.groupAdmin}
                  handleFunction={() => handleRemove(u)}
                />
              ))}
            </div>

            {/* Rename Form */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="New Group Name"
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm"
              />
              <button
                onClick={handleRename}
                disabled={renameloading}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition flex items-center gap-1.5"
              >
                {renameloading && <Loader2 size={15} className="animate-spin" />}
                Rename
              </button>
            </div>

            {/* Add User */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Add User to Group
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search user to add..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm"
                />
                <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
              </div>
            </div>

            {/* Search Results */}
            <div className="max-h-36 overflow-y-auto space-y-1 mb-4">
              {loading ? (
                <div className="flex items-center justify-center py-3 text-sky-400">
                  <Loader2 size={18} className="animate-spin" />
                </div>
              ) : (
                searchResult
                  ?.slice(0, 3)
                  .map((searchUser) => (
                    <UserListItem
                      key={searchUser._id}
                      user={searchUser}
                      handleFunction={() => handleAddUser(searchUser)}
                    />
                  ))
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <button
                onClick={() => handleRemove(user)}
                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-sm font-medium rounded-xl transition flex items-center gap-1.5"
              >
                <UserMinus size={15} />
                Leave Group
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UpdateGroupChatModal;
