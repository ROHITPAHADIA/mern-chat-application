import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Users, MessageSquare } from "lucide-react";
import { ChatState } from "../context/ChatProvider";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { getSender } from "../config/ChatLogics";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      console.error("Failed to load chats:", error);
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain]);

  return (
    <div
      className={`${
        selectedChat ? "hidden md:flex" : "flex"
      } flex-col w-full md:w-80 lg:w-96 bg-slate-900 border-r border-slate-800 h-[calc(100vh-61px)] p-4`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <span>Conversations</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-sky-400 font-semibold">
            {chats ? chats.length : 0}
          </span>
        </h2>

        <GroupChatModal>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-xl text-xs font-semibold transition">
            <Plus size={14} />
            <span>New Group</span>
          </button>
        </GroupChatModal>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 mt-3 pr-1">
        {chats ? (
          chats.map((chat) => {
            const isSelected = selectedChat?._id === chat._id;
            const chatTitle = !chat.isGroupChat
              ? getSender(loggedUser, chat.users)
              : chat.chatName;

            return (
              <div
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                  isSelected
                    ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                    : "bg-slate-800/60 hover:bg-slate-800 text-slate-200 border border-slate-700/40"
                }`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-slate-700 text-sky-400"
                  }`}
                >
                  {chat.isGroupChat ? (
                    <Users size={18} />
                  ) : (
                    chatTitle ? chatTitle.charAt(0).toUpperCase() : "?"
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <p
                      className={`text-sm font-semibold truncate ${
                        isSelected ? "text-white" : "text-slate-100"
                      }`}
                    >
                      {chatTitle}
                    </p>
                  </div>

                  {chat.latestMessage && (
                    <p
                      className={`text-xs truncate ${
                        isSelected ? "text-sky-100" : "text-slate-400"
                      }`}
                    >
                      <span className="font-medium">
                        {chat.latestMessage.sender._id === loggedUser?._id
                          ? "You: "
                          : `${chat.latestMessage.sender.name}: `}
                      </span>
                      {chat.latestMessage.content}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-48 text-xs text-slate-500">
            Loading conversations...
          </div>
        )}
      </div>
    </div>
  );
};

export default MyChats;
