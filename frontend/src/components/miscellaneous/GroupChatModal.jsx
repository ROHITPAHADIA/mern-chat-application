import React, { useState } from "react";
import axios from "axios";
import { X, Users, Search, Loader2 } from "lucide-react";
import { ChatState } from "../../context/ChatProvider";
import UserListItem from "../UserAvatar/UserListItem";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";

const GroupChatModal = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");

  const { user, chats, setChats } = ChatState();

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

  const handleGroup = (userToAdd) => {
    if (selectedUsers.some((u) => u._id === userToAdd._id)) {
      setError("User already added");
      return;
    }
    setError("");
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupChatName.trim() || selectedUsers.length === 0) {
      setError("Please provide a group name and add at least 2 members");
      return;
    }

    if (selectedUsers.length < 2) {
      setError("Please add at least 2 other members to create a group");
      return;
    }

    try {
      setSubmitLoading(true);
      setError("");
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        "/api/chat/group",
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );

      setChats([data, ...chats]);
      setSubmitLoading(false);
      setIsOpen(false);
      setGroupChatName("");
      setSelectedUsers([]);
      setSearchResult([]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create group chat");
      setSubmitLoading(false);
    }
  };

  return (
    <>
      <span onClick={() => setIsOpen(true)}>{children}</span>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl">
                <Users size={22} />
              </div>
              <h2 className="text-xl font-bold text-slate-100">Create Group Chat</h2>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Chat Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Project Collaborators"
                  value={groupChatName}
                  onChange={(e) => setGroupChatName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Add Users
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm transition"
                  />
                  <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                </div>
              </div>

              {/* Selected Users Badges */}
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-1 p-2 bg-slate-800/40 rounded-xl border border-slate-800">
                  {selectedUsers.map((u) => (
                    <UserBadgeItem
                      key={u._id}
                      user={u}
                      handleFunction={() => handleDelete(u)}
                    />
                  ))}
                </div>
              )}

              {/* Search Results */}
              <div className="max-h-40 overflow-y-auto space-y-1">
                {loading ? (
                  <div className="flex items-center justify-center py-4 text-sky-400">
                    <Loader2 size={20} className="animate-spin" />
                  </div>
                ) : (
                  searchResult
                    ?.slice(0, 4)
                    .map((searchUser) => (
                      <UserListItem
                        key={searchUser._id}
                        user={searchUser}
                        handleFunction={() => handleGroup(searchUser)}
                      />
                    ))
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex items-center gap-2 px-5 py-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-md shadow-sky-500/20 transition"
                >
                  {submitLoading && <Loader2 size={16} className="animate-spin" />}
                  Create Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupChatModal;
