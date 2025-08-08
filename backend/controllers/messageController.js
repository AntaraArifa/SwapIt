import expressAsyncHandler from "express-async-handler";
import Message from "../models/messageModel.js";
import { User } from "../models/user.model.js";
import Chat from "../models/chatModel.js";


const allMessages = expressAsyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "fullname profile.profilePhoto")
      .populate("chat");
    const latestMessage = messages[messages.length - 1];
    if (latestMessage && !latestMessage.readBy.includes(req.user.userId)) {
      latestMessage.readBy.push(req.user.userId);
      await latestMessage.save();
    }
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const sendMessage = expressAsyncHandler(async (req, res) => {
  const { content, chat } = req.body;

  if (!content || !chat) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user.userId,
    content: content,
    chat: chat,
    readBy: [req.user.userId], 
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "fullname profile.profilePhoto");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "fullname profile.profilePhoto",
    });

    await Chat.findByIdAndUpdate(req.body.chat, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

export { allMessages, sendMessage }