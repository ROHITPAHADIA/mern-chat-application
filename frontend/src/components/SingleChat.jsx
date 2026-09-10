import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import {
  ArrowLeft,
  Send,
  Loader2,
  Users,
  User as UserIcon,
  Smile,
} from "lucide-react";
import { ChatState } from "../context/ChatProvider";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import ScrollableChat from "./ScrollableChat";

const ENDPOINT = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : window.location.origin);

let socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const {
    user,
    selectedChat,
    setSelectedChat,
    notification,
    setNotification,
  } = ChatState();

  // Socket Connection setup
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Fetch messages when selected chat changes
  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );

      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      console.error("Failed to load messages", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
    setIsTyping(false);
  }, [selectedChat]);

  // Listen for incoming messages
  useEffect(() => {
    const handleNewMessage = (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        // If message is for another chat, add notification
        if (!notification.includes(newMessageReceived)) {
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        // Append to current chat messages
        setMessages((prev) => [...prev, newMessageReceived]);
      }
    };

    socket.on("message received", handleNewMessage);

    return () => {
      socket.off("message received", handleNewMessage);
    };
  });

  // Send Message
  const sendMessage = async (e) => {
    if ((e.type === "click" || e.key === "Enter") && newMessage.trim()) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };

        const messageToSend = newMessage;
        setNewMessage("");

        const { data } = await axios.post(
          "/api/message",
          {
            content: messageToSend,
            chatId: selectedChat._id,
          },
          config
        );

        socket.emit("new message", data);
        setMessages((prev) => [...prev, data]);
        setFetchAgain(!fetchAgain);
      } catch (error) {
        console.error("Failed to send message", error);
      }
    }
  };

  // Typing Handler
  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    const lastTypingTime = new Date().getTime();
    const timerLength = 3000;

    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <div className="flex flex-col h-full bg-slate-950/40">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedChat(null)}
                className="md:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                <ArrowLeft size={20} />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 font-bold text-sm">
                  {selectedChat.isGroupChat ? (
                    <Users size={18} />
                  ) : (
                    getSender(user, selectedChat.users)?.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 leading-none">
                    {!selectedChat.isGroupChat
                      ? getSender(user, selectedChat.users)
                      : selectedChat.chatName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedChat.isGroupChat
                      ? `${selectedChat.users.length} members`
                      : "Direct Message"}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile or Group Settings */}
            <div>
              {!selectedChat.isGroupChat ? (
                <ProfileModal user={getSenderFull(user, selectedChat.users)}>
                  <button className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition">
                    <UserIcon size={20} />
                  </button>
                </ProfileModal>
              ) : (
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              )}
            </div>
          </div>

          {/* Messages Feed Area */}
          <div className="flex-1 flex flex-col justify-between overflow-hidden relative">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-sky-400 gap-2">
                <Loader2 size={32} className="animate-spin" />
                <span className="text-xs text-slate-400">Loading messages...</span>
              </div>
            ) : (
              <ScrollableChat messages={messages} />
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 px-6 py-1 text-xs text-sky-400 italic">
                <span className="inline-flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </span>
                <span>Someone is typing...</span>
              </div>
            )}

            {/* Message Input Box */}
            <div className="p-4 bg-slate-900 border-t border-slate-800">
              <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-2xl px-4 py-1.5 focus-within:border-sky-500 transition">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={typingHandler}
                  onKeyDown={sendMessage}
                  className="flex-1 bg-transparent py-2 text-slate-100 placeholder-slate-400 text-sm focus:outline-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:hover:bg-sky-500 text-white rounded-xl transition shadow-md shadow-sky-500/20"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
          <div className="p-4 bg-slate-800/60 border border-slate-700/50 rounded-3xl mb-4 text-sky-400">
            <Users size={40} />
          </div>
          <h2 className="text-xl font-bold text-slate-200 mb-1">
            No Conversation Selected
          </h2>
          <p className="text-sm text-slate-400 max-w-sm">
            Select a conversation from the sidebar or search for a user to start chatting in real-time.
          </p>
        </div>
      )}
    </>
  );
};

export default SingleChat;
