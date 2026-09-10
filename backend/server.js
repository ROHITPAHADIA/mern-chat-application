const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db.js");
const userRoutes = require("./routes/userRoutes.js");
const chatRoutes = require("./routes/chatRoutes.js");
const messageRoutes = require("./routes/messageRoutes.js");
const { notFound, errorHandler } = require("./middleware/errorMiddleware.js");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // to accept JSON data in req.body

// Base API route
app.get("/", (req, res) => {
  res.send("Talk-A-Tive Chat API is running successfully");
});

// Mount Routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Create HTTP server wrapping Express
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*", // allow any origin in dev or set specific frontend URL
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  // User joins their own personal room for direct notification delivery
  socket.on("setup", (userData) => {
    if (!userData || !userData._id) return;
    socket.join(userData._id);
    console.log(`User ${userData.name} (${userData._id}) connected to socket setup`);
    socket.emit("connected");
  });

  // User joins a specific chat room
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined room: " + room);
  });

  // Typing indicators
  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });

  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing");
  });

  // Real-time message broadcasting
  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chat;

    if (!chat || !chat.users) {
      return console.log("chat.users not defined in message");
    }

    // Broadcast message to all users in the chat except the sender
    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected from socket");
  });
});

server.listen(PORT, () => {
  console.log(`Server started on PORT ${PORT}`);
});
