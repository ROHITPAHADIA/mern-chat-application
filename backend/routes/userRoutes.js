const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
} = require("../controllers/userController.js");
const { protect } = require("../middleware/authMiddleware.js");

const router = express.Router();

// Register new user & search users
router.route("/").post(registerUser).get(protect, allUsers);

// Login user
router.post("/login", authUser);

module.exports = router;
