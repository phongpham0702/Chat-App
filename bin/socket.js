const socketIO = require('socket.io');
const findPicture = require("./pictureIndex")
const messageData = {}

module.exports = (server, sessionMiddleware) => {
  const io = socketIO(server);

  io.use((socket,next)=> {
    sessionMiddleware(socket.request,{},next)
  })

  io.on('connection', function(client) {
   
    client.username = client.request.session.username
    client.userAvatar = findPicture(client.request.session.useravatar)
    console.log(`Client ${client.id} connected`)
    let users = Array.from(io.sockets.sockets.values()).map(socket => ({id: socket.id,username: socket.username,avatar: socket.userAvatar}))
    client.on('disconnect' , () => {

        console.log(`Client ${client.id} has left`)
        client.broadcast.emit('user-leave',client.id) // gửi thông báo 1 user thoát/refresh page đến để mọi người xóa client đó trong danh sách online
    })
    client.on('ElectronDisconnect' , () => {

      console.log(`Client ${client.id} has left`)
      client.broadcast.emit('user-leave',client.id) // gửi thông báo 1 user thoát/refresh page đến để mọi người xóa client đó trong danh sách online
  })
    client.on("user-connected",() => {
      client.emit('user-profile', {username: client.username, avatar:client.userAvatar})
    })

    client.on("private message", data => {
      try {
        let dataSearchKey = data.messageModel.from.toString() +"_"+data.messageModel.to.toString()
        let reverseKey = data.messageModel.to.toString() +"_"+data.messageModel.from.toString()
        if(!messageData[dataSearchKey])
        {
          if(!messageData[reverseKey])
          {
            messageData[dataSearchKey] = []
          }
          else
          {
            dataSearchKey = reverseKey
          }  
        }
          messageData[dataSearchKey].push(data.messageModel)
        client.to(data.recipientId).emit("private message", data.messageModel);
      } catch (error) {
        console.log("Cannot store the message: "+error)
      }
      
    });

    client.on("load message", data => {
      let dataSearchKey = data.userID.toString() +"_"+data.with.toString()
      let reverseKey = data.with.toString() +"_"+data.userID.toString()
      let previousMessage = "a";
      if(messageData[dataSearchKey])
      {
        previousMessage = messageData[dataSearchKey]
      }
      else if(messageData[reverseKey])
      {
        previousMessage = messageData[reverseKey]
      }
      else
      {
        previousMessage = "";
      }
      client.emit("load message",previousMessage)
    })

    //gửi danh sách những đang online cho người mới vào
    client.emit('list-users',users)

    //gửi thông báo người mới online đến cho toàn bộ người trong server
    client.broadcast.emit('new-user',{id: client.id, username: client.username, avatar:client.userAvatar})

    client.broadcast.emit('register-name',{id:client.id, username: client.username})
    });
    return io;
};