import React, { useEffect, useState, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import AOS from 'aos';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import SignUpTeacher from './pages/SignUpTeacher';
import ResetPassword from './pages/ResetPassword';
import UploadFromPhone from './pages/UploadFromPhone'
import Private from './partials/Private';
import StartTeaching from './pages/StartTeaching';
import Contact from './pages/Contact';
import Room from './pages/Room'
import Profile from './pages/Profile'
import Publication from './pages/Publication'
import TeacherPanel from './pages/TeacherPanel'
import CheckHowSimpleItIs from './pages/CheckHowSimpleItIs';
import Teachers from './pages/Teachers';
import InvitationModal from './partials/InvitationModal'
import { Toast } from 'primereact/toast';
import { clearAuthStorage } from './partials/functions/global';
import socket from './socket/socket'
import IdleDetector from './partials/IdleDetector';
import Cookies from 'js-cookie';
import AllSocketUsers from './pages/AllSocketUsers';
import AlreadyInRoomModal from './partials/AlreadyInRoomModal';
import CookiesModal from './partials/Cookies';
import LessonHistoryPage from './pages/LessonHistoryPage';
import axios from 'axios'

//import '/src/libs/fabric.js';
import 'aos/dist/aos.css';
import './css/style.css';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.css';
import TeacherPublicationOverview from './partials/TeacherPublicationOverview';
import LoadingSpinner from './partials/LoadingSpinner';
//import { useFetch } from './server/common/apiCalls'

function App() {

  const location = useLocation();
  const [loggedIn, setLoggedIn] = useState()
  const [isTeacher, setIsTeacher] = useState(false);
  const [room, setRoom] = useState()
  const [userId, setUserId] = useState()
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [invitationStatusUpdated, setInvitationStatusUpdated] = useState(0)
  const [toastMessage, setToastMessage] = useState()
  const [onlineState, setOnlineState] = useState()
  const [myStatus, setMyStatus] = useState()
  const [authChecked, setAuthChecked] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const toast = useRef();
  //const [userInfo] = useFetch('api/user/info', null, [])

  axios.defaults.baseURL = import.meta.env.VITE_AXIOS_BASE_URL
  axios.defaults.withCredentials = true;

  axios.interceptors.response.use(response => {
    return response;
  }, async error => {
    const originalRequest = error.config;
    // If the error status is 401 and there is no originalRequest._retry flag,
    // it means the token has expired and we need to refresh it
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/token')) {
      originalRequest._retry = true;

      const email = localStorage.getItem('email')
      await axios.post('/api/refresh-token', { email });
      return axios(originalRequest);
    }
    if (error.response?.status === 423) {
      // 423 status code is returned only by refresh token endpoint
      // localStorage.clear()
      clearAuthStorage();
      window.location.reload()
    }
    if (error.response?.status === 400 && error.response.data.description) {
      setToastMessage(error.response.data.description)
    }
    return error;

  });

  useEffect(() => {
    const handleNetworkChange = () => {
      setOnlineState(window.navigator.onLine);
    }

    window.addEventListener('offline', handleNetworkChange);
    window.addEventListener('online', handleNetworkChange);
    return () => {
      window.removeEventListener('offline', handleNetworkChange);
      window.removeEventListener('online', handleNetworkChange);
    }
  }, []);

  useEffect(() => {
    setRoom(localStorage.getItem('room'))
    setUserId(localStorage.getItem('userId'))
    setIsTeacher(localStorage.getItem('isTeacher'))
    //reconnect socket on log out (teacher needs to disappear from the list of active teachers)
    if (!loggedIn && socket.connected) {
      socket.disconnect()
      socket.connect()
    }

    if (loggedIn) {
      axios.get('/api/user/info')
        .then((res) => {
          if (res.data.room) {
            localStorage.setItem('room', res.data.room)
            setRoom(res.data.room)
          }
          else localStorage.removeItem('room')
          if (res.data.accessCode) {
            localStorage.setItem('accessCode', res.data.accessCode)
          }
          else localStorage.removeItem('accessCode')
          socket.emit('get_my_status')
        })
    }
  }, [loggedIn])


  useEffect(() => {
    socket.emit('register_socket', { userId, room, isTeacher: Number(isTeacher) });
  }, [userId, room])

  socket.on("connect", () => {
    socket.emit('register_socket', { userId, room, isTeacher: Number(isTeacher) });
    socket.emit('get_my_status')
  });


  //socket.on('my_room', (data) => {
  socket.on('my_status', (data) => {
    console.log("Received my_status:", data);
    if (data.status == "busy") setMyStatus("busy")
    else setMyStatus("active")
  });


  useEffect(() => {
    const auth = Cookies.get('loggedIn');
    if (auth) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
      // localStorage.clear();
      clearAuthStorage();
    }
    setAuthChecked(true);
  }); 

  useEffect(() => {
    if (toastMessage) {
      toast.current.show({ severity: 'error', summary: 'Wystąpił błąd', detail: toastMessage });
      setToastMessage()
    }
  }, [toastMessage]);


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

  const handleInvitationsStatusUpdate = () => {
    setInvitationStatusUpdated(prev => prev + 1)
  }

  // Funkcja do wyciągania modala na wierzch
  const bringToFront = (roomId) => {
    console.log("Bringing invitation to front for room:", roomId);
    setPendingInvitations(prev => {
      const idx = prev.findIndex(inv => inv.roomId === roomId);
      if (idx === -1) return prev;
      const newArr = [...prev];
      console.log("newArr before splice:", newArr);
      console.log("Index of modal to bring to front:", idx);
      const [modal] = newArr.splice(idx, 1);
      newArr.unshift(modal); // na początek tablicy
      console.log("newArr after splice:", newArr);
      console.log("index of modal after bringing to front:", newArr.findIndex(inv => inv.roomId === roomId));
      return newArr;
    });
  };

  useEffect(() => {
    socket.on('invitation_received', (data) => {
      setPendingInvitations(prev => [...prev, data]);
    });
    socket.on('invitation_canceled', (data) => {
      console.log("Invitation canceled for room:", data.roomId);
      setPendingInvitations(prev => prev.filter(inv => inv.roomId !== data.roomId));
      handleInvitationsStatusUpdate();
    });
    return () => {
      socket.off('invitation_received');
      socket.off('invitation_canceled');
    };
  }, []);

  const handleAcceptAndDeclineOthers = async (acceptedRoomId) => {
    // Odrzuć wszystkie poza zaakceptowanym
    const invitationsToDecline = pendingInvitations.filter(inv => inv.roomId !== acceptedRoomId);
    for (const inv of invitationsToDecline) {
      await axios.put('/api/invitation/decline', { roomId: inv.roomId });
      socket.emit('decline_invitation', { roomId: inv.roomId });
    }
    // Zostaw tylko zaakceptowane zaproszenie (lub wyczyść wszystkie)
    setPendingInvitations([]);
  };

  if (!authChecked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route exact path="/" element={<Home loggedIn={loggedIn} setLoggedIn={setLoggedIn} socket={socket} isConnected={isConnected} isTeacher={isTeacher} invitationStatusUpdated={invitationStatusUpdated} myStatus={myStatus} />} />
        <Route path="/signin" element={<SignIn prevUrl='/' setLoggedIn={setLoggedIn} />} />
        <Route path="/signup" element={<SignUp setLoggedIn={setLoggedIn} />} />
        <Route path="/teacherSignUp" element={<SignUpTeacher setLoggedIn={setLoggedIn} />} />
        <Route path="/teacherPanel" element={<Private Component={TeacherPanel} teacherOnly={true} loggedIn={loggedIn} isTeacher={isTeacher} setLoggedIn={setLoggedIn} invitationStatusUpdated={invitationStatusUpdated} socket={socket} myStatus={myStatus} />} />
        <Route path="/teachers" element={<Teachers loggedIn={loggedIn} setLoggedIn={setLoggedIn} socket={socket} isConnected={isConnected} myStatus={myStatus} isTeacher={isTeacher} />} />
        <Route path="/startTeaching" element={<StartTeaching setLoggedIn={setLoggedIn} />} />
        <Route path="/contact" element={<Contact setLoggedIn={setLoggedIn} />} />
        <Route path="/checkHowSimpleItIs" element={<CheckHowSimpleItIs loggedIn={loggedIn} setLoggedIn={setLoggedIn} />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/lessonHistory" element={<Private Component={LessonHistoryPage} loggedIn={loggedIn} setLoggedIn={setLoggedIn} isTeacher={isTeacher} myStatus={myStatus} />} />
        <Route path="/up" element={<UploadFromPhone loggedIn={loggedIn} setLoggedIn={setLoggedIn} socket={socket} />} />
        <Route path="/profile" element={<Private Component={Profile} setLoggedIn={setLoggedIn} socket={socket} isConnected={isConnected} myStatus={myStatus} />} />
        <Route path="/publication" element={<Private Component={Publication} teacherOnly={true} setLoggedIn={setLoggedIn} isTeacher={isTeacher} myStatus={myStatus} />} />
        <Route path="/room" element={<Room loggedIn={loggedIn} setLoggedIn={setLoggedIn} socket={socket} isConnected={isConnected} isTeacher={isTeacher} myStatus={myStatus} />} />
        <Route path="/allSocketUsers" element={<AllSocketUsers socket={socket} isConnected={isConnected} />} />
        <Route path="/teacherPublicationOverview" element={<TeacherPublicationOverview loggedIn={loggedIn} setLoggedIn={setLoggedIn} />} />
      </Routes>
      <AlreadyInRoomModal socket={socket} setLoggedIn={setLoggedIn} />
      <Toast ref={toast}></Toast>
      <CookiesModal />
      {isTeacher == 1 && <IdleDetector setLoggedIn={setLoggedIn} socket={socket} />}
      {pendingInvitations.map((invitation, idx) => (
        <InvitationModal
          key={invitation.roomId}
          invitation={invitation}
          visible={true}
          socket={socket}
          onAccept={(roomId) => setPendingInvitations(prev => prev.filter(inv => inv.roomId !== roomId))}
          onDecline={(roomId) => setPendingInvitations(prev => prev.filter(inv => inv.roomId !== roomId))}
          onAcceptAndDeclineOthers={handleAcceptAndDeclineOthers}
          isTopModal={idx === 0}
          modalIndex={idx}
        />
      ))}
    </>
  );
}

export default App;
