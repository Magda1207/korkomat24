import { React, useEffect, useState, useRef } from 'react';

import Header from '../partials/Header';
import Canvas from '../partials/Canvas';
import ControlPanel from '../partials/ControlPanel';
import ControlPanelDemo from '../partials/ControlPanelDemo';
import Chat from '../partials/Chat';
import Footer from '../partials/Footer';
import Tutorial from '../partials/Tutorial';
import axios from 'axios'

const Room = ({ loggedIn, setLoggedIn, socket, isTeacher, myStatus }) => {

  const [room, setRoom] = useState()
  const [userId, setUserId] = useState()
  const [users, setUsers] = useState()
  const [displayModalBeforeLeaving, setDisplayModalBeforeLeaving] = useState(false)
  const lessonStatusRef = useRef(null);
  const [lessonState, setLessonState] = useState(null); // <-- NEW
  const [isTutorialDisplayed, setIsTutorialDisplayed] = useState(false);

  useEffect(() => {
    // If pendingInvitation, cancel invitation on page unload
    const handleBeforeUnload = (e) => {
      //TODO: ta czesc chyba nie dziala jak powinna przy zamykaniu karty przegladarki
      if (lessonStatusRef.current && lessonStatusRef.current.state === 'pendingInvitation') {
        cancelInvitation()
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Przed odmontowaniem komponentu:
      window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, []);

  useEffect(() => {
    setRoom(localStorage.getItem('room'))
    setUserId(localStorage.getItem('userId'))
  }, []);

  useEffect(() => {
    if (room && loggedIn) {
      socket.emit('join_room', { userId, room });
    }
  }, [room])

  useEffect(() => {
    socket.on('chatroom_users', (data) => {
      setUsers(data)
    })
  }, [socket])

  const getLeavingConfirmed = (confirmed) => {
    if (confirmed) {
      if (lessonStatusRef.current && lessonStatusRef.current.state === 'pendingInvitation') {
        cancelInvitation();
      }
    }
  }

  const cancelInvitation = async () => {
    socket.emit('cancel_invitation', { teacherUserId: lessonStatusRef.current.teacherUserId, invitationId: lessonStatusRef.current.invitationId, roomId: room });
    await axios.put('/api/invitation/cancel')
  }

  const getLessonStatus = (lessonStatus) => {
    lessonStatusRef.current = lessonStatus;
    console.log('lessonStatusRef.current.state:', lessonStatusRef.current?.state);
    setLessonState(lessonStatus?.state || null); // <-- trigger re-render
    setDisplayModalBeforeLeaving(lessonStatus?.state === 'pendingInvitation');
  };

  const getHighlightedElement = (element) => {
    console.log(`getHighlightedElement called with: ${element}`);

    // Remove the highlight class from all elements
    const allElements = document.querySelectorAll('.highlight');
    allElements.forEach(el => el.classList.remove('highlight'));

    if (element) {
      setIsTutorialDisplayed(true);
      // Find element with id element
      const highlightedElement = document.getElementById(element);
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        highlightedElement.classList.add('highlight');
      }
    }
    else {
      setIsTutorialDisplayed(false);
    }

  };

  return (

    <>
      {/*  Site header */}
      <Header loggedIn={loggedIn} setLoggedIn={setLoggedIn} myStatus={myStatus} displayModalBeforeEntering={displayModalBeforeLeaving} getLeavingConfirmed={getLeavingConfirmed} />
      <div className="flex flex-row min-h-screen overflow-hidden h-[calc(100dvh)]">
        <div className="flex grow min-h-screen overflow-hidden bg-light-blue">
          <main className="grow flex flex-col mt-16">
            {loggedIn && <ControlPanel socket={socket} room={room} loggedIn={loggedIn} isTeacher={isTeacher} getLessonStatus={getLessonStatus} />}
            {!loggedIn && isTutorialDisplayed && (
              <ControlPanelDemo />
            )}
            {(lessonState === 'lessonInProgress' || lessonState === 'lessonCompleted') && (
              <Chat loggedIn={loggedIn} userId={userId} socket={socket} roomId={room} />
            )}
            <Canvas socket={socket} room={room} loggedIn={loggedIn} isTeacher={isTeacher} isTutorialDisplayed={isTutorialDisplayed} />
            <Footer roomPage={true} />
          </main>
        </div>
      </div>
      <Tutorial loggedIn={loggedIn} getHighlightedElement={getHighlightedElement} isTeacher={isTeacher} />
    </>
  );
}

export default Room;