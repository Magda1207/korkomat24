import { React, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog } from 'primereact/dialog'
import Countdown from "react-countdown";
import useSound from 'use-sound';

import notificationSound from '../sounds/sound__success_low.mp3';
import axios from 'axios'

const InvitationModal = ({ socket, handleInvitationsStatusUpdate, loggedIn }) => {

  const [invitationModalVisible, setInvitationModalVisible] = useState(false)
  const [teacherPanelInfo, setTeacherPanelInfo] = useState(null)
  const [invitationReceived, setInvitationReceived] = useState(0)
  const [roomId, setRoomId] = useState()
  const [accessCode, setAccessCode] = useState()
  const [from, setFrom] = useState()
  const [subject, setSubject] = useState()
  const [level, setLevel] = useState()
  const [price, setPrice] = useState()
  const [invitationDatetime, setInvitationDatetime] = useState()
  const [play] = useSound(notificationSound);
  const navigate = useNavigate();

  // Pobierz teacherPanelInfo tylko jeśli loggedIn
  useEffect(() => {
    // Jesli uzytkownik kliknie 'Wyloguj' podczas otwartego modala, odrzuc zaproszenie
    // Technicznie nie powinno być możliwe bo modal blokuje tło
    if (!loggedIn && invitationModalVisible) socket.emit('decline_invitation', { roomId });
    if (!loggedIn) return;
    axios.get('/api/teacherPanelInfo')
      .then(res => setTeacherPanelInfo(res.data))
      .catch(() => setTeacherPanelInfo(null));
  }, [loggedIn]);


  useEffect(() => {

    console.log("teacherPanelInfo", teacherPanelInfo);
    // console.log("teacherPanelInfo[0]", teacherPanelInfo[0] );
    // console.log("Array.isArray(teacherPanelInfo[0].activeInvitations)", Array.isArray(teacherPanelInfo[0].activeInvitations));
    // console.log("roomId", roomId);
    // console.log("invitationModalVisible", invitationModalVisible);
    if (
      teacherPanelInfo &&
      Array.isArray(teacherPanelInfo.activeInvitations) &&
      teacherPanelInfo.activeInvitations.length > 0 &&
      !roomId && !invitationModalVisible
    ) {
      console.log("wessss");
      const invitation = teacherPanelInfo.activeInvitations[0];
      if (!invitation) return;
      setRoomId(invitation.roomId);
      //setAccessCode(invitation.roomCode);
      setFrom(`${invitation.FirstName} ${invitation.LastName}`);
      setSubject(invitation.subject);
      setLevel(invitation.level);
      setPrice(invitation.price);
      setInvitationDatetime({ createdDateUtc: invitation.createdDateUtc });
      setInvitationModalVisible(true);
    }
  }, [teacherPanelInfo]);

  useEffect(() => {
    if (invitationReceived) {
      (async () => {
        try {
          const response = await axios.get('/api/invitationDatetime', { params: { roomId: roomId } })
          setInvitationDatetime(response.data)
        }
        catch (error) {
          //handle error
        }
      }
      )()
    }
  }, [invitationReceived])

  useEffect(() => {
    if (invitationDatetime) {
      setInvitationModalVisible(true)
      play()
    }
  }, [invitationDatetime])

  useEffect(() => {
    socket.on('invitation_received', (data) => {
      const { roomId, from, accessCode, subject, level, price } = data
      handleIncomingInvitation(roomId, from, accessCode, subject, level, price)
      handleInvitationsStatusUpdate()
    })

    socket.on('invitation_canceled', (data) => {
      setInvitationModalVisible(false)
      handleInvitationsStatusUpdate()
    })
  }, [socket])

  const handleIncomingInvitation = (roomId, from, accessCode, subject, level, price) => {
    setInvitationReceived((prev) => prev + 1)
    setRoomId(roomId)
    setAccessCode(accessCode)
    setFrom(from)
    setSubject(subject)
    setLevel(level)
    setPrice(price)
  }

  const acceptInvitation = async (e) => {
    await axios.put('/api/invitation/accept', { roomId })
      .then((res) => {
        if (!(res instanceof Error)) {
          localStorage.setItem('room', roomId)
          localStorage.setItem('accessCode', accessCode)
          console.log('Invitation accepted:', window.location.hash)
          if (window.location.hash === '#/room') {
            window.location.reload()
          } else {
            navigate('/room', { replace: false })
          }
        }
        setInvitationModalVisible(false)
      })
  }

  const declineInvitation = async (e) => {
    await axios.put('/api/invitation/decline', { roomId })
      .then((res) => {
        if (!(res instanceof Error)) {
          socket.emit('decline_invitation', { roomId })
        }
        handleInvitationsStatusUpdate()
        setInvitationModalVisible(false)
      })
  }

  const handleInvitationExpiration = () => {
    setInvitationModalVisible(false)
    setTimeout(handleInvitationsStatusUpdate, 1000)
  }

  return (
    <div>
      <Dialog
        header="Nowe zaproszenie"
        visible={invitationModalVisible}
        style={{ width: '100%', maxWidth: 420 }}
        onHide={declineInvitation}
        className="!rounded-2xl"
        resizable={false}
      >
        <div className="text-base text-gray-500 font-normal mb-5">
          Otrzymałeś zaproszenie do lekcji od: <div className="font-semibold text-gray-800">{from}</div>
        </div>
        <div className="bg-gray-50 rounded-2xl p-6 mb-6 shadow-inner">
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-medium">Przedmiot:</span>
              <span className="text-base font-semibold text-gray-900">{subject}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-medium">Poziom:</span>
              <span className="text-base font-semibold text-gray-900">{level}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 font-medium">Cena za 45 min:</span>
              <span className="text-xl font-bold text-green-700">{price ? `${price} zł` : '—'}</span>
            </div>
          </div>
          <div className="flex flex-col items-center mt-6">
            <div className="text-sm text-gray-500 mb-1">Czas na odpowiedź:</div>
            <div className="text-2xl font-bold text-gray-900">
              {invitationDatetime ? (
                <Countdown
                  date={Date.parse(invitationDatetime.createdDateUtc) + 1000 * 90}
                  onComplete={handleInvitationExpiration}
                  renderer={({ minutes, seconds }) => (
                    <span>{minutes}:{seconds.toString().padStart(2, '0')}</span>
                  )}
                />
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            className="flex-1 rounded-xl border border-gray-300 bg-white py-3 text-base font-semibold text-gray-700 shadow-sm hover:bg-gray-100 transition"
            onClick={declineInvitation}
          >
            Odrzuć
          </button>
          <button
            type="button"
            className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-green-700 py-3 text-base font-bold text-white shadow-lg hover:from-green-600 hover:to-green-800 transition"
            onClick={acceptInvitation}
          >
            Akceptuj
          </button>
        </div>
      </Dialog>
    </div>
  );
}

export default InvitationModal;