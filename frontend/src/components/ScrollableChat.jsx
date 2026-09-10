import React, { useEffect, useRef } from "react";
import { ChatState } from "../context/ChatProvider";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages &&
        messages.map((m, i) => {
          const isMe = m.sender._id === user._id;

          return (
            <div
              key={m._id}
              className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
            >
              {/* Other user's avatar */}
              {!isMe && (
                <div className="w-7 h-7 flex-shrink-0">
                  {isSameSender(messages, m, i, user._id) ||
                  isLastMessage(messages, i, user._id) ? (
                    <img
                      src={
                        m.sender.pic ||
                        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
                      }
                      alt={m.sender.name}
                      title={m.sender.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-700"
                    />
                  ) : null}
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm break-words ${
                  isMe
                    ? "bg-sky-500 text-white rounded-br-xs"
                    : "bg-slate-800 text-slate-100 border border-slate-700/60 rounded-bl-xs"
                }`}
              >
                {/* Sender Name in Group Chat if not current user */}
                {!isMe && (
                  <p className="text-[11px] font-bold text-sky-400 mb-1">
                    {m.sender.name}
                  </p>
                )}
                <span>{m.content}</span>
                <div
                  className={`text-[9px] mt-1 text-right ${
                    isMe ? "text-sky-100/80" : "text-slate-400"
                  }`}
                >
                  {new Date(m.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ScrollableChat;
