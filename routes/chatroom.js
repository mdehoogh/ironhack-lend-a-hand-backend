const express = require("express");
const models = require("../models");
const router = express.Router();
/* GET users listing. */
router.get("/chatrooms", async (req, res, next) => {
  const chatRooms = await models.ChatRoom.findAll();
  res.send(chatRooms);
});
router.post("/chatroom", async (req, res, next) => {
  const room = req.body.room;
  const chatRooms = await models.ChatRoom.findAll({
    where: { name: room },
  });
  const chatRoom = chatRooms[0];
  if (!chatRoom) {
    await models.ChatRoom.create({ name: room });
  }
  res.send(chatRooms);
});
router.get("/chatroom/messages/:chatRoomName", async (req, res, next) => {
  try {
    const chatRoomName = req.params.chatRoomName;
    console.log("Messages requested of chat room '"+chatRoomName+"'.");
    const chatRooms = await models.ChatRoom.findAll({
      where: {
        name: chatRoomName,
      },
    });
    const chatRoomId = chatRooms[0].id;
    const messages = await models.ChatMessage.findAll({
      where: {
        chatRoomId,
      },
    });
    console.log("Number of messages in '"+chatRoomName+"'",(messages?messages.length:0));
    res.send(messages);
  } catch (error) {
    console.error(error);
    res.send([]);
  }
});
module.exports = router;