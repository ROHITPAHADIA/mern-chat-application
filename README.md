# Full Stack Real-Time MERN Chat Application

A modern, production-ready real-time chatting application inspired by the **TPulseChat** architecture built with **React (Vite), Tailwind CSS, Node.js, Express, Socket.IO, and MongoDB**.

---

## 🌟 Key Features

1. **Authentication & Security**
   - User Registration & Login with JSON Web Tokens (JWT).
   - Password hashing and encryption using `bcryptjs`.
   - Protected API routes using Express middleware (`protect`).
   - Profile avatar support (custom upload or automated avatars).

2. **Real-Time Communication (Socket.IO)**
   - Instant 1-on-1 direct messaging.
   - Real-time animated **typing indicators** (*"Someone is typing..."*).
   - Seamless room joining and real-time message broadcasting without page reload.

3. **User Search & Discovery**
   - Slide-over user search drawer to find registered users by name or email.
   - Fast user lookup with MongoDB regex search queries.

4. **Conversations & Group Chats**
   - **One-on-One Chat**: Automatically creates or fetches existing conversations between two users.
   - **Group Chats**: Create group chats with custom names and multiple members.
   - **Group Management**: Group admin can rename group, add new members, and remove members. Any member can leave the group.

5. **Real-Time Notifications**
   - Unread message counter badge on the top navigation bar.
   - Notification dropdown listing unread messages and chats.
   - Instant notification sound / badges when receiving messages while in a different chat.

6. **User Profiles**
   - Modal popup to view profile details (avatar, name, email) of yourself or chat partners.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **React 18 + Vite** | High-performance SPA with fast hot-module replacement |
| **Styling** | **Tailwind CSS + Lucide Icons** | Modern, dark-mode, responsive chat interface |
| **State Management** | **React Context API (`ChatProvider`)** | Global auth, active chat, and notification state |
| **Backend** | **Node.js + Express.js** | RESTful API server |
| **Real-Time Engine**| **Socket.IO** | Bi-directional WebSocket communication for events |
| **Database** | **MongoDB + Mongoose** | Document store with indexed schemas & relations |
| **Auth & Security** | **JWT + Bcrypt.js** | Secure token-based authentication & encrypted passwords |

---

## 📁 Project Structure

```text
Rohit project mern/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   └── generateToken.js      # JWT signing helper
│   ├── controllers/
│   │   ├── userController.js     # Register, login, search users
│   │   ├── chatController.js     # 1-on-1, group chats, add/remove members
│   │   └── messageController.js  # Send message, fetch message history
│   ├── middleware/
│   │   ├── authMiddleware.js     # Bearer token verification
│   │   └── errorMiddleware.js    # 404 & global error handling
│   ├── models/
│   │   ├── userModel.js          # User schema with bcrypt pre-save hook
│   │   ├── chatModel.js          # Chat conversation schema
│   │   └── messageModel.js       # Message document schema
│   ├── routes/
│   │   ├── userRoutes.js         # /api/user endpoints
│   │   ├── chatRoutes.js         # /api/chat endpoints
│   │   └── messageRoutes.js      # /api/message endpoints
│   ├── .env                      # Environment variables
│   ├── .env.example              # Sample environment template
│   ├── package.json
│   └── server.js                 # Express server & Socket.IO initialization
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── miscellaneous/
│   │   │   │   ├── SideDrawer.jsx           # Top navbar, search & notifications
│   │   │   │   ├── ProfileModal.jsx         # View user profile modal
│   │   │   │   ├── GroupChatModal.jsx       # Create new group modal
│   │   │   │   └── UpdateGroupChatModal.jsx # Admin group controls modal
│   │   │   ├── UserAvatar/
│   │   │   │   ├── UserListItem.jsx         # Search user row card
│   │   │   │   └── UserBadgeItem.jsx        # Member tag / chip with remove button
│   │   │   ├── MyChats.jsx                  # Left sidebar conversation list
│   │   │   ├── ChatBox.jsx                  # Main chat wrapper
│   │   │   ├── SingleChat.jsx               # Active chat, Socket.io, typing indicators
│   │   │   └── ScrollableChat.jsx           # Auto-scroll message bubble feed
│   │   ├── config/
│   │   │   └── ChatLogics.js                # Senders & avatar placement helpers
│   │   ├── context/
│   │   │   └── ChatProvider.jsx             # React Context for global state
│   │   ├── pages/
│   │   │   ├── HomePage.jsx                 # Login & Sign Up
│   │   │   └── ChatPage.jsx                 # Main messaging layout
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css                        # Tailwind CSS imports
│   ├── index.html
│   ├── vite.config.js                       # Vite config with /api proxy
│   ├── tailwind.config.js
│   └── package.json
│
├── package.json                             # Root scripts for running both
├── .gitignore
└── README.md
```

---

## 🚀 Step-by-Step Local Setup Guide

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB**: Either local MongoDB installed or a free [MongoDB Atlas](https://www.mongodb.com/atlas/database) cloud database.

### 2. Configure Environment Variables
Inside `backend/.env`, configure your settings:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/chatapp?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_talkative_mern_2026
NODE_ENV=development
```
*(If using local MongoDB, use `MONGO_URI=mongodb://127.0.0.1:27017/mern-chat-app`)*.

### 3. Install Dependencies
In the project root, you can install both backend and frontend:
```bash
# In backend
cd backend
npm install

# In frontend
cd ../frontend
npm install
```

### 4. Run the Application
Open two terminal windows:

**Terminal 1 (Backend Server):**
```bash
cd backend
npm run dev
```
*You will see: `Server started on PORT 5000` and `MongoDB Connected`.*

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
```
*Open `http://localhost:5173` in your browser!*

---

## 🌐 How to Deploy (Step-by-Step)

### Option A: Deploy Backend on Render (Free)
1. Push your repository to **GitHub**.
2. Go to [Render.com](https://render.com) and create a **New Web Service**.
3. Connect your GitHub repository.
4. Set the following:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. In **Environment Variables**, add:
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random string.
   - `NODE_ENV`: `production`
6. Click **Deploy**. Copy your Render backend URL (e.g. `https://mern-chat-backend.onrender.com`).

### Option B: Deploy Frontend on Vercel (Free)
1. Go to [Vercel.com](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository.
3. Set the **Root Directory** to `frontend`.
4. Framework Preset: **Vite**.
5. In **Environment Variables**, set:
   - `VITE_API_URL`: Your Render backend URL (`https://mern-chat-backend.onrender.com`).
6. Click **Deploy**!

---

## 🎓 Learning Guide: How Everything Connects

### 1. How Real-Time Messaging Works (Socket.IO)
1. When a user logs in, the frontend creates a socket connection to the server:
   ```javascript
   socket = io(ENDPOINT);
   socket.emit("setup", user);
   ```
2. The server places this user in their own personal room named after their `_id`:
   ```javascript
   socket.on("setup", (userData) => {
     socket.join(userData._id);
   });
   ```
3. When a user clicks a chat, they join that chat's room:
   ```javascript
   socket.emit("join chat", selectedChat._id);
   ```
4. When a message is sent:
   - Saved in MongoDB via REST API `POST /api/message`.
   - Socket emits `"new message"` to the server.
   - The server iterates over all participants in `chat.users` and broadcasts `"message received"` to each user's room (`socket.in(user._id).emit(...)`).
   - If the recipient currently has that chat open, the message immediately appears in their feed.
   - If the recipient has a different chat open, it increments their unread **Notification** badge!

### 2. How Passwords Stay Encrypted
In `backend/models/userModel.js`, we use Mongoose pre-save middleware:
```javascript
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
```
Even if someone accesses the database directly, passwords can never be read in plain text.
