import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    chatName: {
      type: String, // optional, can be used for group chats
      trim: true,
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Chat = mongoose.model("Chat", chatSchema);
