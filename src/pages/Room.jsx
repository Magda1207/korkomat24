import { React, useEffect, useState } from 'react';

import Header from '../partials/Header';
import Canvas from '../partials/Canvas';

const Room = ({ loggedIn, setLoggedIn, socket, isConnected }) => {

  const [room, setRoom] = useState()
  const [username, setUsername] = useState()
  const [users, setUsers] = useState()

  useEffect(() => {
    setRoom(localStorage.getItem('room'))
    setUsername(localStorage.getItem('username'))
  })

  useEffect(() => {
    if (room) {
      socket.emit('join_room', { username, room });
    }
  }, [room])


  useEffect(() => {
    if (!isConnected) {
      socket.connect()
    }
  })

  useEffect(() => {
    socket.on('chatroom_users', (data) => {
      console.log('chatroom_users event received')
      setUsers(data)
      console.log(users)
    })
  }, [socket])

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">

      {/*  Site header */}
      <Header loggedIn={loggedIn} setLoggedIn={setLoggedIn} />

      {/*  Page content */}
      <Canvas socket={socket} room={room} />
    </div>
  );
}

export default Room;