import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import cloudinary from "../lib/cloudinary.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUser = req.user._id;
    const users = await User.find({ _id: { $ne: loggedInUser } }).select(
      "-password"
    );
    console.log(users);

    return res.status(200).json(users);
  } catch (error) {
    console.log("Error in getUsersForSidebar controller.", error.message);
    return res
      .status(500)
      .json({ messgage: "Error in getUsersForSidebar controller.", error });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: chatToUserId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: chatToUserId },
        { senderId: chatToUserId, receiverId: myId },
      ],
    });
    return res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller.", error.message);
    return res
      .status(500)
      .json({ messgage: "Error in getMessages controller.", error });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { id: chatToUserId } = req.params;
    const myId = req.user._id;
    const { text, image } = req.body;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.url;
    }

    const newMessage = await Message.create({
      senderId: myId,
      receiverId: chatToUserId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(chatToUserId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    return res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller.", error.message);
    return res
      .status(500)
      .json({ messgage: "Error in sendMessage controller.", error });
  }
};
