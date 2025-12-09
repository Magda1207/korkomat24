import { useEffect, useState, useRef } from 'react';
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom';
import Tooltip from './Tooltip';
import InviteATeacherModal from './InviteATeacherModal';
import TeacherAvatar from './TeacherAvatar';
import TeacherPublicationOverview from './TeacherPublicationOverview';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';

const TeachersListItem = ({ socket, loggedIn, isTeacher, teacherDetails, selectedSubject, selectedLevel }) => {
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false)
  const [roomId, setRoomId] = useState()
  const [accessCode, setAccessCode] = useState()
  const [firstAndLastName, setFirstAndLastName] = useState()
  const [teacherInitial, setTeacherInitial] = useState()
  const [toastMessage, setToastMessage] = useState()
  const [inactiveReason, setInactiveReason] = useState()
  const [teacherDetailsModalVisible, setTeacherDetailsModalVisible] = useState(false)
  const toast = useRef();

  const navigate = useNavigate();
  const location = useLocation();
  const lastActivityDaysAgo = Math.round((Date.now() - Date.parse(teacherDetails.lastLoggedIn)) / 1000 / 60 / 60 / 24);
  const lastActivityText = lastActivityDaysAgo === 0 ? "dzisiaj" : lastActivityDaysAgo === 1 ? "wczoraj" : lastActivityDaysAgo === 2 ? "przedwczoraj" : lastActivityDaysAgo + " dni temu"

  const allPrices = teacherDetails.subjects
    ? teacherDetails.subjects.flatMap(subj => subj.levels.map(lvl => lvl.price))
    : [];
  const priceMin = allPrices.length ? Math.min(...allPrices) : 0;
  const priceMax = allPrices.length ? Math.max(...allPrices) : 0;

  useEffect(() => {
    setRoomId(localStorage.getItem('room'))
    setAccessCode(localStorage.getItem('accessCode'))
    const firstName = localStorage.getItem('firstName')
    const lastName = localStorage.getItem('lastName')
    if (firstName && lastName) setFirstAndLastName(firstName + " " + lastName)
    setTeacherInitial(teacherDetails.name.slice(0, 1) + teacherDetails.name.slice(teacherDetails.name.indexOf(' ') + 1, teacherDetails.name.indexOf(' ') + 2))
    if (!loggedIn) {
      setInactiveReason('Zaloguj się, aby zaprosić')
    }
  }, [])

  useEffect(() => {
    if (toastMessage) {
      toast.current.show({ severity: 'error', summary: 'Wystąpił błąd', detail: toastMessage });
      setToastMessage()
    }
  }, [toastMessage]);

  useEffect(() => {
    if (isTeacher == '1') {
      setInactiveReason('Załóż konto ucznia, aby móc zapraszać korepetytorów.');
    }
    else
      if (loggedIn && teacherDetails.status == 'busy') {
        setInactiveReason('Ten korepetytor prowadzi teraz zajęcia.')
      }
      else if (loggedIn && teacherDetails.status == 'inactive') {
        setInactiveReason('Ten korepetytor jest obecnie niedostępny.')
      }
      else if (loggedIn) setInactiveReason(null)
  }, [teacherDetails.status]);

  const inviteTeacher = async (teacherId, selectedSubject, selectedLevel, selectedPrice) => {
    if (teacherDetails.socketId) {
      await axios.post('/api/invitation', { teacherId, selectedSubject, selectedLevel, selectedPrice })
        .then((res) => {
          if (!(res instanceof Error)) {
            setConfirmationModalVisible(false)
            sendInvitation(selectedSubject, selectedLevel, selectedPrice)
            if (location.pathname === '/room') navigate(0, { replace: true });
            else navigate('/room', { replace: false });
          }
        })
    }
    else {
      setToastMessage("Wybrany korepetytor nie jest dostępny. Wybierz innego korepetytora")
      setConfirmationModalVisible(false)
    }
  }

  const sendInvitation = (selectedSubject, selectedLevel, selectedPrice) => {
    socket.emit('invitation', { teacherSocketId: teacherDetails.socketId, roomId: roomId, from: firstAndLastName, subject: selectedSubject, level: selectedLevel, price: selectedPrice })
  }

  const closeModal = () => {
    setConfirmationModalVisible(false)
  }

  return (
    <div className="bg-white p-2 md:p-3 flex flex-col md:flex-row items-stretch md:items-center gap-3 border-b border-gray-200 last:border-b-0 rounded-lg shadow-sm hover:shadow-md transition duration-150 ease-in-out min-h-[64px]">
      {/* Avatar & Status */}
      <div
        className="flex items-center md:items-start h-full cursor-pointer group"
        onClick={() => setTeacherDetailsModalVisible(true)}
      >
        {/* wrapper ensures a square visual and fills the tile height on larger screens */}
        <div className=" h-full  flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
          <TeacherAvatar
            displayStatus={true}
            status={teacherDetails.status}
            profileImage={teacherDetails.profileImage}
            teacherInitial={teacherInitial}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      {/* Main Info */}
      <div className="flex-1 flex flex-col justify-between w-full items-start min-w-0">
        <div
          onClick={() => setTeacherDetailsModalVisible(true)}
          className="cursor-pointer group text-left w-full"
        >
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-md text-gray-900 group-hover:text-emerald-500 transition truncate">{teacherDetails.name}</h1>
          </div>
          <p className="text-gray-600 mt-1 text-sm truncate">{teacherDetails.aboutMe}</p>
          <span className="text-sm text-emerald-500 cursor-pointer transition-colors group-hover:text-emerald-600 font-medium">
            Więcej informacji &gt;
          </span>
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">★</span>
            <span className="font-medium text-gray-800">{teacherDetails.rate}</span>
            <span className="text-gray-400">({teacherDetails.totalReviews})</span>
          </div>
          <div className="text-gray-400">Ostatnia aktywność: {lastActivityText}</div>
        </div>
      </div>
      {/* Price & Invite */}
      <div className="flex flex-col items-center justify-center w-full md:w-36 gap-2">
        <div className="text-center">
          <div className="text-gray-500 text-xs">Cena za 45 min</div>
          <div className="text-lg font-bold text-emerald-500 mt-1">
            {priceMin === priceMax ? `${priceMin} zł` : `${priceMin}-${priceMax} zł`}
          </div>
        </div>
        <Tooltip message={inactiveReason}>
          <button
            type="submit"
            onClick={() => setConfirmationModalVisible(true)}
            className={`w-32 rounded-md px-3 py-2 text-sm font-semibold text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
              ${inactiveReason
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#19AA53] hover:bg-[#16994a] focus-visible:outline-[#19AA53]'
              }`}
            disabled={inactiveReason}
          >
            Zaproś
          </button>
        </Tooltip>
      </div>
      {/* Modals */}
      <Dialog
        visible={teacherDetailsModalVisible}
        style={{ width: 'auto', maxWidth: '90vw', minWidth: 0, padding: 0 }}
        onHide={() => setTeacherDetailsModalVisible(false)}
        className="!rounded-2xl !p-0"
        breakpoints={{ '960px': '95vw', '640px': '99vw' }}
        modal={true}
        blockScroll={true}
        resizable={false}
      >
        <TeacherPublicationOverview teacherDetails={teacherDetails} />
      </Dialog>
      <InviteATeacherModal
        teacherDetails={teacherDetails}
        confirmationModalVisible={confirmationModalVisible}
        defaultSubject={selectedSubject}
        defaultLevel={selectedLevel}
        closeModal={closeModal}
        inviteTeacher={inviteTeacher}
      />
      <Toast ref={toast}></Toast>
    </div>
  );
}

export default TeachersListItem;