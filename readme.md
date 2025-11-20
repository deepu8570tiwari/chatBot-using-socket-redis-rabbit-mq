# 🚀 Full Microservices Chat Application — Complete Setup Guide

This project contains **4 microservices** working together:

1. **User Microservice** (Authentication + Users)
2. **Chat Microservice** (Chats + Messages + Socket.io)
3. **Mail Microservice** (Send OTP Emails)
4. **Frontend (Next.js)** (UI for chat application)

All services run using **Docker & Docker Compose**.
Each service communicates via **REST, Redis, RabbitMQ, and Socket.io**.

---

# 🏗️ Project Architecture

```
📦 project-root
├── user-microservice
├── chat-microservice
├── mail-microservice
├── frontend
└── docker-compose.yml
```

---

# 🔧 Technologies Used

### **Backend Microservices**
- Node.js
- Express.js
- JWT Authentication
- MongoDB (Mongoose)
- Redis (Caching + Online Users)
- RabbitMQ (Message Queue for OTP emails)
- Socket.io (Realtime chat)
- Multer (Image Upload)
- Cloudinary (optional) for images

### **Frontend**
- Next.js 16
- React 19
- Axios
- js-cookie
- socket.io-client
- react-hot-toast
- lucide-react
- moment

### **DevOps**
- Docker
- Docker Compose
- Containers for:
  - All microservices
  - MongoDB
  - Redis
  - RabbitMQ
  - Frontend

---

# ⚙️ Backend API Documentation

## 📌 **User Microservice API**

### **POST /login**
User login → sends OTP via mail service.

### **POST /verify**
Verify OTP → generates JWT.

### **GET /me** *(protected)*
Fetch logged‑in user.

### **GET /users/all-users** *(protected)*
All users list.

### **GET /users/:id**
Fetch user by id.

### **POST /users/update** *(protected)*
Update username.

---

## 📌 **Chat Microservice API**

### **POST /chat/create-chat** *(protected)*
Create private chat.

### **GET /chat/all** *(protected)*
Get all chats for logged‑in user.

### **POST /chat/message** *(protected)*
Send message (text / image)

### **GET /chat/message/:chatId** *(protected)*
Get all messages of a chat.

---

# 📨 Mail Microservice

Handles email sending using:
- NodeMailer
- RabbitMQ consumer

Flow:
```
User → Login → User MS → Publish message → RabbitMQ → Mail MS → Send Email
```

---

# 🔥 Realtime Communication — Socket.io

### Chat Microservice socket events:
- `connection`
- `disconnect`
- `getOnlineUser`
- `joinRoom`
- `newMessage`
- `messageSeen`

Frontend connects using:
```ts
io(CHAT_SERVICE_URL, {
  query: { userId }
})
```

---

# 🧠 Redis Usage
- Store online users list
- SocketId ↔ UserId mapping
- Improve user/chats resolving

---

# 🐇 RabbitMQ Usage

### Exchange: `email-service`
### Queue: `otp_queue`

User-MS publishes → Mail-MS consumes.

---

# 🐳 Docker Setup

## Root `docker-compose.yml`

Includes:
- user-microservice
- chat-microservice
- mail-microservice
- frontend
- MongoDB
- Redis
- RabbitMQ

---

# 🛠️ How to Run the Entire System

## 1️⃣ Install Docker & Docker Compose
https://docs.docker.com/get-docker/

## 2️⃣ Clone the project
```
git clone https://github.com/yourrepo/project.git
cd project
```

## 3️⃣ Add `.env` files to all services
Each microservice folder must contain:
```
PORT=
MONGO_URI=
JWT_SECRET=
RABBITMQ_URL=
REDIS_URL=
CLOUDINARY_KEY=
```

Frontend `.env.local`:
```
NEXT_PUBLIC_USERSERVICE=http://localhost:8090
NEXT_PUBLIC_CHATSERVICE=http://localhost:8091
```

---

## 4️⃣ Build & Start all services
```
docker-compose build
docker-compose up -d
```

---

# 🚀 After Running

### 🌐 Frontend
http://localhost:3000

### 👤 User Service
http://localhost:8090

### 💬 Chat Service
http://localhost:8091

### 📧 Mail Service
http://localhost:8089

### 🐇 RabbitMQ Dashboard
http://localhost:15672
(username: guest, password: guest)

### 🗃️ Redis
localhost:6379

### 🍃 MongoDB
localhost:27017

---

# ✔️ Sample Request Flow

### 1. Login
```
POST /login
{
  "email": "deepu@gmail.com"
}
```

### 2. Verify
```
POST /verify
{
  "email": "deepu@gmail.com",
  "otp": "1234"
}
```

### 3. Create Chat
```
POST /chat/create-chat
{
  "userId": "abc123"
}
```

### 4. Send Message
```
POST /chat/message (multipart form)
- text
- imageFile (optional)
```

---

# 🧩 Frontend Tech Overview

### Uses:
- **Next.js App Router**
- Global state using custom context
- JWT stored in cookies
- Axios API service
- Protected routes
- Chat rooms via socket.io-client
- Image preview + sending
- Online users list from socket event


---

# 🎯 Final Notes

This repo uses:
- Microservice architecture
- Event-driven email service
- Realtime chat using socket.io
- Caching and online presence using Redis
- Message Transport using RabbitMQ
- Clean and scalable Docker setup

If you need:
✅ Full docker-compose file
✅ Dockerfiles for each service
✅ API reference PDF
✅ Architecture diagram

Just tell me — I’ll generate them!

