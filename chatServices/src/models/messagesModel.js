import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "chats",
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    messageType: {
        type: String,
        enum: ["text", "image", "video", "pdf", "audio"],
        default: "text",
    },
    text: {
        type: String,
        default: "",
    },

    // ---- FILE DATA IF ATTACHMENT ----
    fileUrl: { type: String },      // secure_url
    filePublicId: { type: String }, // public_id (critical!)

    // ---- SEEN / READ STATUS ----
    seen: {
        type: Boolean,
        default: false,
    },
    seenAt: {
        type: Date,
        default:null
    }
}, { timestamps: true });

export const Messages = mongoose.model("Messages", messageSchema);
