const path = require('path');
// wczytaj .env z tego samego folderu co app.js
require('dotenv').config({
  path: path.resolve(__dirname, '.env')
});

const express = require('express')
const app = express();
const { createServer: createServer } = require('http')
const cors = require('cors')
const { Server: Server } = require('socket.io');
const { stat } = require('fs');

app.use(cors()); // Add cors middleware

const socketOrigin = process.env.SOCKET_ORIGIN || '*'

const server = createServer(app);
let socketArray = []

const updateSocketStatus = (socket) => {
  const room = socket.room;
  if (!room) {
    socket.status = 'active';
    socket.emit('my_status', { status: socket.status });
    console.log("Socket has no room, status set to active", socket.id);
    return;
  }

  const status = socketArray.filter(s => s.room === room).length > 1 ? 'busy' : 'active';
  socket.status = status;

  // emit the status for all sockets in the room
  io.to(room).emit('my_status', { status: socket.status });
}

// http://localhost:4000/ 
app.get('/', (req, res) => {
  res.send('Socket server is running...');
});

// Create an io server and allow for CORS from * (TODO: shouldn't it be changed to specific path like http://localhost:3000?) with GET and POST methods
const io = new Server(server, {
  cors: {
    origin: socketOrigin,
    methods: ['GET', 'POST'],
  },
});

// Listen for when the client connects via socket.io-client
io.on('connection', (socket) => {
  console.log(`User connected ${socket.id}`);

  // Socket event listeners
  socket.on('register_socket', async (data) => {
    const { userId, room, isTeacher } = data;

    socket.userId = userId
    socket.room = room
    socket.isTeacher = isTeacher

    updateSocketStatus(socket);

    const index = socketArray.map(x => x.socketId).indexOf(socket.id)
    if (index > -1) { // if the socket is already connected, update it
      socketArray[index].room = socket.room
      socketArray[index].isTeacher = socket.isTeacher
      socketArray[index].userId = socket.userId
      socketArray[index].status = socket.status
    }
    else {
      socketArray.push({ socketId: socket.id, userId: socket.userId, room: socket.room, isTeacher: socket.isTeacher, status: socket.status });
    }

    io.sockets.emit('all_socket_clients', socketArray);

    let activeTeachers = socketArray.filter(x => x.isTeacher == 1).length
    let activeUsers = socketArray.filter(x => x.isTeacher != 1).length
    io.sockets.emit('active_sockets', { activeTeachers: activeTeachers, activeUsers: activeUsers });
  });

  socket.on('join_room', (data) => {
    const { userId, room } = data;

    // Check if the user is already in a room e.g. on a different tab/device
    const existingSocket = socketArray.find(s => s.userId === userId && s.room && s.socketId !== socket.id);
    if (existingSocket) {
      socket.emit('already_in_room');
      return;
    }

    // Add the user  to the room
    socket.join(room);
    socket.room = room

    const index = socketArray.map(x => x.userId).indexOf(userId)
    if (index > -1) { // update roomId in the array on join
      socketArray[index].room = room
    }
    console.log(`User ${userId} joined room ${room} status: ${socket.status}`);
    updateSocketStatus(socket);
    //send information to all sockets that this teacher's status changed
    if (socket.isTeacher == 1) {
      io.sockets.emit('all_socket_clients', socketArray);
    }
  });

  socket.on('force_session', () => {
    // disconnect all sockets with the same userId and room
    const { userId, room } = socket;
    socketArray.forEach((s) => {
      if (s.userId === userId && s.room === room && s.socketId !== socket.id) {
        const targetSocket = io.sockets.sockets.get(s.socketId);
        if (targetSocket) {
          targetSocket.emit('force_session');
        }
      }
    });
  })

  // Chat functionality
  // socket.on('send_message', (data) => {
  //   const { message, username, room, __createdtime__ } = data;
  //   io.in(room).emit('receive_message', data); // Send to all users in room, including sender
  //   //TODO: Zapis do bazy
  // })

  socket.on('get_remote_dimensions', () => {
    socket.to(socket.room).emit('dimensions_requested');
  })

  socket.on('dimensions_changed', (data) => {
    socket.to(socket.room).emit('remote_dimensions_changed', data);
  })

  socket.on('object-added', data => {
    socket.to(socket.room).emit('new-add', data);
  })

  socket.on('object-remove', data => {
    socket.to(socket.room).emit('object-removed', data);
  })
  //TODO: check if this is needed
  socket.on('object-modified', data => {
    socket.to(socket.room).emit('new-modification', data);
  })

  socket.on('pointer-coords', data => {
    socket.to(socket.room).emit('remote-pointer', data);
  })

  socket.on('remote-erase', data => {
    socket.to(socket.room).emit('remote-erase', data);
  })

  socket.on('chatMessage', data => {
    socket.to(socket.room).emit('chatMessage', data);
  })

  socket.on('invitation', (data) => {
    const { teacherSocketId, roomId, from, subject, level, price } = data;
    io.to(teacherSocketId).emit('invitation_received', { roomId, from, subject, level, price });
  })

  socket.on('decline_invitation', (data) => {
    const { roomId } = data
    io.in(roomId).emit('invitation_declined');
  })

  socket.on('lesson_started', () => {
    io.to(socket.room).emit('lesson_started');
  })

  socket.on('lesson_finished', () => {
    io.to(socket.room).emit('lesson_finished');
    io.socketsLeave(socket.room)
    // Update the socketArray list
    socketArray.forEach((element, index) => {
      if (element.room == socket.room) {
        socketArray[index].room = null
      }
    })
  })

  socket.on('lesson_resigned', () => {
    io.to(socket.room).emit('lesson_resigned');
    // Remove teacher from the room
    // Only teacher because user can use the same room and invite another teacher
    socketArray.forEach((element, index) => {
      if (element.room == socket.room && element.isTeacher == 1) {
        console.log("Removing teacher:" + element.socketId + " socket from room:", socket.room);
        socketArray[index].room = null
        const teacherSocketId = element.socketId;
        const teacherSocketObj = io.sockets.sockets.get(teacherSocketId);
        // make the teacher socket leave the room
        teacherSocketObj.leave(socket.room);
        teacherSocketObj.room = null;
        // emit to element.socketId that their status is now active
        updateSocketStatus(teacherSocketObj);
      }
    })
  })

  socket.on('cancel_invitation', async (data) => {
    const { teacherUserId, invitationId, roomId } = data
    const teacherSocketId = socketArray.filter((socket) => socket.userId === teacherUserId)[0]?.socketId

    io.to(teacherSocketId).emit('invitation_canceled', { roomId });
  })

  socket.on('get_all_socket_users', () => {
    socket.emit('all_socket_clients', socketArray);
  })

  socket.on('get_number_of_sockets', () => {
    let activeTeachers = socketArray.filter(x => x.isTeacher == 1).length
    let activeUsers = socketArray.filter(x => x.isTeacher != 1).length
    io.sockets.emit('active_sockets', { activeTeachers: activeTeachers, activeUsers: activeUsers });
  })
  // socket.on('get_my_room', async () => {
  //   socket.emit('my_room', socket.room);
  // })

  socket.on('get_my_status', async () => {
    socket.emit('my_status', { status: socket.status });
  })

  socket.on('peer_id_joined', (data) => {
    socket.to(socket.room).emit('peer_id_joined', data)
  })

  socket.on('peer_id_response', (data) => {
    socket.to(socket.room).emit('peer_id_response', data)
  })

  socket.on('tabChanged', function (data) {
    socket.to(socket.room).emit('tabChanged', data);
  })

  socket.on('user_muted', function (data) {
    socket.to(socket.room).emit('user_muted', data);
  })

  socket.on('user_video_off', function (data) {
    socket.to(socket.room).emit('user_video_off', data);
  })

  socket.on('tabClosed', function (data) {
    socket.to(socket.room).emit('tabClosed', data);
  })

  socket.on('photoUploaded', (data) => {
    console.log("Photo uploaded event");
    if (data.isTeacherDir) {
      // Handle teacher directory specific logic
      // Find socket by userId and send the event to that socket
      const teacherSocketObj = socketArray.find(s => s.userId === data.room);
      if (teacherSocketObj) {
        const realSocket = io.sockets.sockets.get(teacherSocketObj.socketId);
        if (realSocket) {
          realSocket.emit('photoUploaded', data);
        }
      }
    } else {
      // Handle student directory specific logic
      socket.to(data.room).emit('photoUploaded');
    }
  })

  socket.on('is_anyone_here', (data) => {
    let response = socketArray.filter(x => x.room == data.room && socket.id !== x.socketId).length > 0 ? true : false;
    console.log("is_anyone_here response:", response, "for room:", data.room);
    socket.emit('is_anyone_here_response', { response });
  })

  // Log every received event and its data
  // socket.onAny((event, ...args) => {
  //   console.log(`[SOCKET RECEIVED] ${event}:`, ...args);
  // });

  socket.on("disconnect", (reason) => {
    console.log(`User disconnected ${socket.id} - reason: ${reason}`);
    socket.to(socket.room).emit('socket-disconnected', { socketId: socket.id });
    // Remove the socket from the socketArray
    const index = socketArray.map(x => x.socketId).indexOf(socket.id)
    if (index > -1) { // If item is found, remove it
      socketArray.splice(index, 1); // Remove one item from index
    }

    if (socket.isTeacher == 1) {
      io.sockets.emit('all_socket_clients', socketArray);
    }

    let activeTeachers = socketArray.filter(x => x.isTeacher == 1).length
    let activeUsers = socketArray.filter(x => x.isTeacher != 1).length
    io.to(socket.socketId).emit('active_sockets', { activeTeachers: activeTeachers, activeUsers: activeUsers });

    if (reason === "io server disconnect") {
      socket.connect();
    }
    else if (reason === "io client disconnect") {
      socket.connect();
    }
    else {
      socket.leave(socket.room)
      //send information to all sockets that this teacher's status changed
      socket.room = null
      socket.userId = null
      socket.isTeacher = null
    }
  });
});

server.listen(4000, () => 'Server is running on port 4000');