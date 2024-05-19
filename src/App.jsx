import React, { useEffect, useState, useRef } from 'react';


import {
  Routes,
  Route,
  useLocation
} from 'react-router-dom';

import 'aos/dist/aos.css';
import './css/style.css';

import AOS from 'aos';

import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ResetPassword from './pages/ResetPassword';
import UploadFromPhone from './pages/UploadFromPhone'
import Private from './partials/Private';
import Form from './pages/Form';
import Room from './pages/Room'
import Profile from './pages/Profile'
import socket from './socket/socket'

import Cookies from 'js-cookie';



function App() {


  const location = useLocation();
  const [loggedIn, setLoggedIn] = useState()
  const [isConnected, setIsConnected] = useState(socket.connected);



  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    //function onFooEvent(value) {
    //  setFooEvents(previous => [...previous, value]);
    //}

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    //socket.on('foo', onFooEvent);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      //socket.off('foo', onFooEvent);
    };
  }, []);

  useEffect(() => {
    const auth = Cookies.get('loggedIn')
    if(auth) {
      setLoggedIn(true)
    }
  });

  useEffect(() => {
    AOS.init({
      once: true,
      disable: 'phone',
      duration: 600,
      easing: 'ease-out-sine',
    });
  });

  useEffect(() => {
    document.querySelector('html').style.scrollBehavior = 'auto'
    window.scroll({ top: 0 })
    document.querySelector('html').style.scrollBehavior = ''
  }, [location.pathname]); // triggered on route change

  return (
    <>
      <Routes>
        <Route exact path="/" element={<Home loggedIn={loggedIn} setLoggedIn={setLoggedIn} />} />
        <Route path="/korkomat24/signin" element={<SignIn prevUrl='/' setLoggedIn={setLoggedIn}/>} />
        <Route path="/signup" element={<SignUp setLoggedIn={setLoggedIn} />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/up" element={<UploadFromPhone loggedIn={loggedIn} setLoggedIn={setLoggedIn} />} />
        <Route path="/form" element={<Private Component={Form} setLoggedIn={setLoggedIn}  socket={socket} isConnected={isConnected} />} />
        <Route path="/profile" element={<Private Component={Profile} setLoggedIn={setLoggedIn}  socket={socket} isConnected={isConnected} />} />
        <Route path="/room" element={<Private Component={Room} setLoggedIn={setLoggedIn} socket={socket} isConnected={isConnected}/>} />
      </Routes>
    </>
  );
}

export default App;
