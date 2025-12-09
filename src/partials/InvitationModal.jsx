import { React, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog } from 'primereact/dialog'
import Countdown from "react-countdown";
import useSound from 'use-sound';
import notificationSound from '../sounds/sound__success_low.mp3';
import axios from 'axios';

const InvitationModal = ({ socket, invitation, visible, onAccept, onDecline, isTopModal, modalIndex = 0, onAcceptAndDeclineOthers }) => {
  const [invitationDatetime, setInvitationDatetime] = useState()

  if (!invitation) return null;

  const [play] = useSound(notificationSound);
  const navigate = useNavigate();

  // Odtwarzaj dźwięk przy pojawieniu się modala
  useEffect(() => {
    if (visible) play();
  }, [visible, play]);

  useEffect(() => {
    const fetchDatetime = async () => {
      if (invitation?.roomId) {
        const response = await axios.get('/api/invitationDatetime', { params: { roomId: invitation.roomId } });
        setInvitationDatetime(response.data);
      }
    };
    fetchDatetime();
  }, []);

  const acceptInvitation = async () => {
    await axios.put('/api/invitation/accept', { roomId: invitation.roomId });
    localStorage.setItem('room', invitation.roomId);
    //localStorage.setItem('accessCode', invitation.accessCode);
    if (window.location.hash === '#/room') {
      window.location.reload();
    } else {
      navigate('/room', { replace: false });
    }
    onAccept(invitation.roomId);
    if (onAcceptAndDeclineOthers) {
      onAcceptAndDeclineOthers(invitation.roomId);
    }
  };

  const declineInvitation = async () => {
    await axios.put('/api/invitation/decline', { roomId: invitation.roomId })
      .then((res) => {
        if (!(res instanceof Error)) {
          socket.emit('decline_invitation', { roomId: invitation.roomId })
        }
      });
    onDecline(invitation.roomId);
  };

  const handleInvitationExpiration = () => {
    onDecline(invitation.roomId);
  };

  const stackStyle = {
    marginTop: `${modalIndex * 148}px`,
    marginRight: `${modalIndex * 248}px`,
    transition: 'margin 0.2s',
  };

  return (
    <Dialog
      header="Nowe zaproszenie"
      visible={visible}
      style={{ width: '100%', maxWidth: 420, ...stackStyle }}
      onHide={declineInvitation}
      className="!rounded-2xl"
      modal={isTopModal}
      resizable={false}
    >
      <div className="text-base text-gray-500 font-normal mb-5">
        Otrzymałeś zaproszenie do lekcji od: <div className="font-semibold text-gray-800">{invitation.from}</div>
      </div>
      <div className="bg-gray-50 rounded-2xl p-6 mb-6 shadow-inner">
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 font-medium">Przedmiot:</span>
            <span className="text-base font-semibold text-gray-900">{invitation.subject}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 font-medium">Poziom:</span>
            <span className="text-base font-semibold text-gray-900">{invitation.level}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 font-medium">Cena za 45 min:</span>
            <span className="text-xl font-bold text-green-700">{invitation.price ? `${invitation.price} zł` : '—'}</span>
          </div>
        </div>
        <div className="flex flex-col items-center mt-6">
          <div className="text-sm text-gray-500 mb-1">Czas na odpowiedź:</div>
          <div className="text-2xl font-bold text-gray-900">
            {invitationDatetime && (
              <Countdown
                date={Date.parse(invitationDatetime.createdDateUtc) + 1000 * 90}
                onComplete={handleInvitationExpiration}
                renderer={({ minutes, seconds }) => (
                  <span>{minutes}:{seconds.toString().padStart(2, '0')}</span>
                )}
              />
            )}
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
  );
};

export default InvitationModal;