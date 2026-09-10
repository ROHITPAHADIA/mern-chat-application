const Chat = require("../models/chatModel.js");
const User = require("../models/userModel.js");

/**
 * @desc    Create or fetch a One-to-One Chat
 * @route   POST /api/chat
 * @access  Protected
 */
const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "UserId param not sent with request" });
  }

  // Check if chat already exists
  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    // Create new one-on-one chat
    const chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(fullChat);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

/**
 * @desc    Fetch all chats for the logged in user
 * @route   GET /api/chat
 * @access  Protected
 */
const fetchChats = async (req, res) => {
  try {
    let chats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    chats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    res.status(200).send(chats);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Create a new Group Chat
 * @route   POST /api/chat/group
 * @access  Protected
 */
const createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).json({ message: "Please fill in all the fields" });
  }

  let users = typeof req.body.users === "string" ? JSON.parse(req.body.users) : req.body.users;

  if (users.length < 2) {
    return res
      .status(400)
      .json({ message: "More than 2 users are required to form a group chat" });
  }

  // Add the current logged-in user to the group
  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Rename a Group Chat
 * @route   PUT /api/chat/rename
 * @access  Protected
 */
const renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;

  if (!chatId || !chatName) {
    return res.status(400).json({ message: "ChatId and new ChatName are required" });
  }

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404).json({ message: "Chat Not Found" });
  } else {
    res.json(updatedChat);
  }
};

/**
 * @desc    Add a user to a group chat
 * @route   PUT /api/chat/groupadd
 * @access  Protected
 */
const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  if (!chatId || !userId) {
    return res.status(400).json({ message: "ChatId and UserId are required" });
  }

  // Check if user is already in group
  const existingChat = await Chat.findById(chatId);
  if (!existingChat) {
    return res.status(404).json({ message: "Chat Not Found" });
  }

  if (existingChat.users.includes(userId)) {
    return res.status(400).json({ message: "User is already in the group" });
  }

  const added = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.json(added);
};

/**
 * @desc    Remove a user from a group chat (or leave group)
 * @route   PUT /api/chat/groupremove
 * @access  Protected
 */
const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  if (!chatId || !userId) {
    return res.status(400).json({ message: "ChatId and UserId are required" });
  }

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404).json({ message: "Chat Not Found" });
  } else {
    res.json(removed);
  }
};

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
