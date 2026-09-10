const User = require("../models/userModel.js");
const generateToken = require("../config/generateToken.js");

/**
 * @desc    Register a new user
 * @route   POST /api/user
 * @access  Public
 */
const registerUser = async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please fill in all required fields" });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User with this email already exists" });
  }

  const user = await User.create({
    name,
    email,
    password,
    pic: pic || undefined,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: "Failed to create the user" });
  }
};

/**
 * @desc    Authenticate user & get token (Login)
 * @route   POST /api/user/login
 * @access  Public
 */
const authUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide both email and password" });
  }

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
};

/**
 * @desc    Get or search all users (except currently logged-in user)
 * @route   GET /api/user?search=
 * @access  Protected
 */
const allUsers = async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword)
    .find({ _id: { $ne: req.user._id } })
    .select("-password");

  res.send(users);
};

module.exports = { registerUser, authUser, allUsers };
