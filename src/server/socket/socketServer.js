const express = require('express')
const app = express();
const { createServer: createServer } = require('http')
const cors = require('cors')
const { Server: Server } = require('socket.io')

app.use(cors()); // Add cors middleware

const server = createServer(app);
const CHAT_BOT = 'ChatBot';
let chatRoom = '';
let chatRoomUsers;
let allUsers = [];
let tabsInRoom = [];
let dataStorage = [];
let pendingMessagesForSocket = [];
pendingMessagesForSocket[0] = [];


function leaveRoom(userID, chatRoomUsers) {
  return chatRoomUsers.filter((user) => user.id != userID);
}


// http://localhost:4000/ 
app.get('/', (req, res) => {
  res.send('Socket server is running...');
});

// Create an io server and allow for CORS from * (TODO: shouldn't it be changed to specific path like http://localhost:3000?) with GET and POST methods
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

//TODO: Po restarcie serwera połączenia czatu są zerwane - naprawic
// Listen for when the client connects via socket.io-client
io.on('connection', (socket) => {
  console.log(`User connected ${socket.id}`);

  // Socket event listeners
  socket.on('join_room', (data) => {
    //1. Add the user (username) to the room
    const { username, room } = data; // Data sent from client when join_room event emitted
    socket.join(room); // Join the user to a socket room
    console.log(` ${socket.id} has joined ${room} and it is user ${username}`);
    //2. Push the user/room to the allUsers array
    chatRoom = room
    allUsers.push({ id: socket.id, username, room })
    // For first user - Set number of tabs in Room to 1 and create data storage array of objects
    if (!tabsInRoom.find(obj => obj.room === chatRoom)) {
      tabsInRoom.push({ room: room, numberOfTabs: 1, activeTab: 1 })
    }
    let numberOfTabs = tabsInRoom.find(obj => obj.room === chatRoom).numberOfTabs
    let activeTab = tabsInRoom.find(obj => obj.room === chatRoom).activeTab
    socket.emit('numberOfTabsAndActive', { numberOfTabs: numberOfTabs, activeTab: activeTab })
    //3. Filter allUsers and save to chatRoomUsers
    chatRoomUsers = allUsers.filter((user) => user.room === room)
    //4. Send the event to notify users who is in the room with them
    io.in(room).emit('chatroom_users', chatRoomUsers)
    //5. Send a message to everyone - info that a user joined 
    let __createdtime__ = Date.now(); // Current timestamp
    // Send message to all users currently in the room, apart from the user that just joined
    socket.to(room).emit('receive_message', {
      message: `${username} has joined the chat room`,
      username: CHAT_BOT,
      __createdtime__,
    });

    // Send welcome msg to user that just joined chat only
    socket.emit('receive_message', {
      message: `Welcome ${username}! You are in: ${room} room.`,
      username: CHAT_BOT,
      __createdtime__,
    });
  });

  socket.on('send_message', (data) => {
    const { message, username, room, __createdtime__ } = data;
    io.in(room).emit('receive_message', data); // Send to all users in room, including sender
    //TODO: Zapis do bazy
  })

  socket.on('startDrawing', (data) => {
    const { room } = data
    socket.to(room).emit('startDrawing', data)
  })

  socket.on('draw', (data) => {
    const { room } = data
    socket.to(room).emit('draw', data)
  })

  socket.on('finishDrawing', (data) => {
    const { room } = data
    socket.to(room).emit('finishDrawing')
  })

  socket.on('drawClick', (data) => {
    const { room } = data
    socket.to(room).emit('drawClick', data)
  })

  socket.on('loadContent', function () {
    socket.emit('updatetabsonload', pendingMessagesForSocket.length - 1);
    console.log("Load content")
    for (var i = 0; i < pendingMessagesForSocket[pendingMessagesForSocket.length - 1].length; i++) {
      var functionType = pendingMessagesForSocket[pendingMessagesForSocket.length - 1][i].functionType;

      socket.emit(functionType, {
        x: pendingMessagesForSocket[pendingMessagesForSocket.length - 1][i].x,
        y: pendingMessagesForSocket[pendingMessagesForSocket.length - 1][i].y,
        type: pendingMessagesForSocket[pendingMessagesForSocket.length - 1][i].type,
        color: pendingMessagesForSocket[pendingMessagesForSocket.length - 1][i].color
      });
    }
  })

  socket.on('newtab', function (data) {
    let numberOfTabs = data.numberOfTabs
    let activeTab = numberOfTabs
    tabsInRoom = tabsInRoom.map(obj => {
      if (obj.room === chatRoom) {
        return { ...obj, numberOfTabs: numberOfTabs, activeTab: activeTab };
      }
      return obj;
    });

    io.in(chatRoom).emit('numberOfTabsAndActive', {
      numberOfTabs: numberOfTabs,
      activeTab: activeTab
    });
  });



  socket.on('tabChanged', function (data) {

    let activeTabOld = tabsInRoom.find(obj => obj.room === chatRoom).activeTab
    let activeTabNew = data.activeTab

    // update the value on server - mark which tab is active now
    tabsInRoom = tabsInRoom.map(obj => {
      if (obj.room === chatRoom) {
        return { ...obj, activeTab: activeTabNew };
      }
      return obj;
    });
    // send the new tab number to all users in room 
    socket.to(chatRoom).emit('tabChanged', {
      activeTab: activeTabNew
    });

    if (dataStorage.find(data => data.room == chatRoom && data.tab == activeTabNew)) {
      let tabContent = dataStorage.find(data => data.room == chatRoom && data.tab == activeTabNew).dataURL
      io.in(chatRoom).emit('loadTabContent', tabContent);
    }

  })

  socket.on('saveTabContent', (data) => {
    // if the image is already stored - exchange it to the new one
    if (dataStorage.filter(storage => storage.room == data.room && storage.tab == data.tab).length) {
      dataStorage = dataStorage.map(obj => {
        if (obj.room === chatRoom && obj.tab === data.tab) {
          return { ...obj, dataURL: data.dataURL };
        }
        return obj;
      });
    }
    else {
      //otherwise just push the image to the array
      dataStorage.push(data)
    }
  })

  socket.on('getUsers', async (data) => {
    const { room } = data
    var clients = await io.in("room1").fetchSockets()
    console.log(io.of("/").adapter.sids)
    socket.to(room).emit('receiveUsers', clients)
  })


  socket.on('leaveRoom', (data) => {
    const { username, room } = data

    socket.leave(room)
    allUsers = leaveRoom(socket.id, allUsers);
    console.log(`Socket ${socket.id} has left the ${room} room.`)


    chatRoomUsers = allUsers.filter((user) => user.room === room);
    socket.to(room).emit('chatroom_users', chatRoomUsers);

    let __createdtime__ = Date.now();

    socket.to(room).emit('receive_message', {
      message: `${username} has left the chat room.`,
      username: CHAT_BOT,
      __createdtime__,
    });

  })

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected with a reason: " + reason); // undefined
    if (reason === "io server disconnect") {
      // the disconnection was initiated by the server, you need to reconnect manually
      socket.connect();
    }

    if (reason === "io client disconnect") {
      // the disconnection was initiated by the server, you need to reconnect manually
      socket.connect();
    }

    else {
      console.log("Disconnected from : " + chatRoom); // undefined
      socket.leave(chatRoom)
      allUsers = leaveRoom(socket.id, allUsers);
      //console.log(`Socket ${socket.id} has left the ${chatRoom} room.`)
      chatRoomUsers = allUsers.filter((user) => user.room === chatRoom);
      socket.to(chatRoom).emit('chatroom_users', chatRoomUsers);
    }

  });

});


server.listen(4000, () => 'Server is running on port 4000');