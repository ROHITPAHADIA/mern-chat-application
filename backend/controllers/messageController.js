const Message = require("../models/messageModel.js");
const User = require("../models/userModel.js");
const Chat = require("../models/chatModel.js");

/**
 * @desc    Send a new message
 * @route   POST /api/message
 * @access  Protected
 */
const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return res.status(400).json({ message: "Invalid data passed into request" });
  }

  const newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    // Update latest message in the Chat document
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });

    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Get all messages for a specific chat
 * @route   GET /api/message/:chatId
 * @access  Protected
 */
const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { sendMessage, allMessages };
