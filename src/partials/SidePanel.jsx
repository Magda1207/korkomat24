import React, { useRef, useState, useEffect } from 'react';
import VideoStream from '../partials/VideoStream'
import { useFetch } from '../server/common/apiCalls'
import FindTeacherContent from '../partials/FindTeacherContent';
import PdfMaker from './PdfMaker';
import { Dialog } from 'primereact/dialog'
import Countdown from "react-countdown";
import AddOpinionModal from './AddOpinionModal';
import { useNavigate } from 'react-router-dom';

import axios from 'axios'

const SidePanel = ({ socket, room, isTeacher, loggedIn, getLessonStatus }) => {

  const [lessonStatusUpdated, setlessonStatusUpdated] = useState(1)
  const [lessonStatus] = useFetch('/api/roomState', null, [lessonStatusUpdated])
  const [activeLesson] = useFetch('/api/lessons/history?active=1', null, [lessonStatusUpdated])
  const [findTeacherModalVisible, setFindTeacherModalVisible] = useState(false)
  const [invitationDeclinedModalVisible, setInvitationDeclinedModalVisible] = useState(false)
  const [lessonCompletedModalVisible, setLessonCompletedModalVisible] = useState(false)
  const [lessonResignedModalVisible, setLessonResignedModalVisible] = useState(false)
  const [lessonStartedByRemoteText, setLessonStartedByRemoteText] = useState()
  const [displayDisconnectionCounter, setDisplayDisconnectionCounter] = useState(0)
  const [forceStartLessonModalVisible, setForceStartLessonModalVisible] = useState(false)
  const [confirmResignModalVisible, setConfirmResignModalVisible] = useState(false)
  const teacherRef = useRef()
  const isTeacherRef = useRef()
  const createPdf = useRef();
  const [userInfo, setUserInfo] = useState()
  const [iStarted, setIStarted] = useState()
  const [remotePresent, setRemotePresent] = useState()
  const [displayReviewModal, setDisplayReviewModal] = useState(false)

  const navigate = useNavigate();

  useEffect(() => {
    getLessonStatus(lessonStatus)
    if (lessonStatus.state === "lessonInProgress" || lessonStatus.state === "introductionTalk") {
      console.log("lessonStatus", lessonStatus)
      teacherRef.current = { teacherUserId: lessonStatus.teacherUserId, teacherName: lessonStatus.teacher }
    }
  }, [lessonStatus])


  useEffect(() => {
    isTeacherRef.current = isTeacher
    console.log("is remote present", remotePresent)
  }, [isTeacher, remotePresent])

  useEffect(() => {
    if (userInfo) {
      if (userInfo.room) localStorage.setItem('room', userInfo.room)
      if (userInfo.accessCode) localStorage.setItem('accessCode', userInfo.accessCode)
    }
  }, [userInfo])

  useEffect(() => {
    socket.on('peer_id_joined', () => {
      console.log('Peer joined!')
      setlessonStatusUpdated((prev) => prev + 1)
    });

    socket.on('lesson_started', () => {
      if (isTeacherRef.current === '1') setLessonStartedByRemoteText("Lekcja została rozpoczęta przez ucznia. Kliknij 'Rozpocznij lekcję' aby kontynuować.")
      else setLessonStartedByRemoteText("Lekcja została rozpoczęta przez korepetytora. Kliknij 'Rozpocznij lekcję' aby kontynuować.")
      setlessonStatusUpdated((prev) => prev + 1)
    });

    socket.on('lesson_finished', async () => {
      if (isTeacherRef.current === '1') {
        localStorage.removeItem("room")
        //localStorage.removeItem("accessCode")
      }
      else if (isTeacherRef.current !== '1') {
        await axios.get('/api/user/info')
          .then((res) => {
            setUserInfo(res.data)
          });
      }
      setLessonCompletedModalVisible(true)
    });

    socket.on('lesson_resigned', () => {
      if (isTeacherRef.current === '1') {
        localStorage.removeItem("room")
        //localStorage.removeItem("accessCode")
      }
      setLessonResignedModalVisible(true)
    });

    socket.on('invitation_declined', () => {
      setInvitationDeclinedModalVisible(true)
      setlessonStatusUpdated((prev) => prev + 1)
    })

  }, [socket])


  const handleFindTeacherModalClose = () => {
    setFindTeacherModalVisible(false)
  }

  const handleInvitationDeclinedModalClose = () => {
    setInvitationDeclinedModalVisible(false)
  }

  const handleLessonCompletedModalClose = async () => {
    setLessonCompletedModalVisible(false)
    if (isTeacher === '1') {
      navigate('/teacherPanel', { replace: false })
      location.reload()
    } else {
      axios.get('/api/shouldAddReview?teacherUserId=' + teacherRef.current.teacherUserId)
        .then((res) => {
          if (res.data.shouldAddReview) {
            setDisplayReviewModal(true)
          }
          else location.reload()
        })
      
    }
  }

  const handleLessonResignedModalClose = () => {
    setLessonResignedModalVisible(false)
    if (isTeacher === '1') navigate('/teacherPanel', { replace: false });
    else location.reload()
  }



  const expireInvitation = async () => {
    await axios.put('/api/invitation/expire')
      .then(() => {
        setlessonStatusUpdated(prev => prev + 1)
      })
  }

  const cancelInvitation = async () => {
    socket.emit('cancel_invitation', { teacherUserId: lessonStatus.teacherUserId, invitationId: lessonStatus.invitationId, roomId: room });
    await axios.put('/api/invitation/cancel')
      .then(() => {
        setlessonStatusUpdated(prev => prev + 1)
      })
  }

  const startLesson = async () => {
    await axios.put('/api/lesson/start')
    socket.emit('lesson_started')
    setIStarted(true)
  }

  const finishLesson = async () => {
    await createPdf.current.generatePdf(room)

    await axios.put('/api/lesson/finish').then(async () => {
      const result = await axios.get('/api/user/info')
      setUserInfo(result.data)
    }).then(() => socket.emit('lesson_finished', { room }))
    setlessonStatusUpdated(prev => prev + 1)
  }

  const finishLessonAutomatically = async () => {
    console.log('Finish automatically function called')
    // finish if the other user is not present, or if both are present, student finishes the lesson
    if (!remotePresent || (remotePresent && isTeacher !== '1')) {
      console.log('Finish automatically function called, inside if')
      await createPdf.current.generatePdf(room)

      await axios.put('/api/lesson/finish').then(
        // Pobierz nowy roomId
        async () => {
          const result = await axios.get('/api/user/info')
          setUserInfo(result.data)
        }
      ).then(() => socket.emit('lesson_finished', { room }))
      setlessonStatusUpdated(prev => prev + 1)
    }
  }

  const resign = async () => {
    socket.emit('lesson_resigned')
    await axios.put('/api/lesson/resign').then(
      // Pobierz nowy roomId
      async () => {
        const result = await axios.get('/api/user/info')
        setUserInfo(result.data)
      }
    )
    setlessonStatusUpdated(prev => prev + 1)
  }

  const isRemotePresent = (value) => {
    setRemotePresent(value)
  }



  const initialState = (
    <div className="relative flex flex-col overflow-auto">
      <div className="text-center flex flex-col place-content-center">
        {/* {isTeacher === '1' ?
          <div className='mt-4' onClick={() => setInviteStudentModalVisible(true)}>
            <button type="submit" className="w-full rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600">Zaproś ucznia</button>
          </div>
          : */}
        {isTeacher !== '1' && (
          <div className='mt-4' onClick={() => setFindTeacherModalVisible(true)}>
            <button type="submit" className="w-full rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600">Znajdź korepetytora</button>
          </div>
        )}

      </div>
    </div>
  )

  const pendingInvitation = (
    <div className="text-center flex flex-col place-content-center">
      <div className="w-full flex justify-center mt-2">
        <div className="w-full bg-blue-50 border border-blue-300 text-blue-900 rounded-lg px-4 py-2 mb-4 text-center font-semibold shadow-sm text-xs">
          Zaproszenie w toku. <br /> Czas na akceptację: <br />
          <Countdown date={Date.parse(lessonStatus.invitiationCreated) + 1000 * 90} onComplete={expireInvitation} />
        </div>
      </div>
      <span className="bottom-4 right-0 text-xs font-medium text-blue-600 dark:text-blue-500 hover:cursor-pointer" onClick={cancelInvitation}>Anuluj zaproszenie</span>
    </div>
  )
  // 1 -> 45
  const lessonInProgress = (<>
    <div className="h-1/5 relative flex flex-col overflow-auto">
      {displayDisconnectionCounter ? // TODO: Zmienić czas na 15 minut, a poniżej na 45 minut
        <div className="w-full flex justify-center mt-2">
          <div className="w-full bg-blue-50 border border-blue-300 text-blue-900 rounded-lg px-4 py-2 mb-4 text-center font-semibold shadow-sm text-xs">
            Lekcja zakończona, rozłączenie nastąpi za: <br /> <Countdown date={Date.parse(lessonStatus.lessonStarted) + 1000 * 60 * 2} onComplete={finishLessonAutomatically} />
          </div>
        </div>
        :
        <div className="w-full flex justify-center mt-2">
          <div className="w-full bg-blue-50 border border-blue-300 text-blue-900 rounded-lg px-4 py-2 mb-4 text-center font-semibold shadow-sm text-xs">
            Lekcja w toku, pozostały czas: <br />
            <Countdown date={Date.parse(lessonStatus.lessonStarted) + 1000 * 60 * 1} onComplete={() => setDisplayDisconnectionCounter(1)} />
          </div>
        </div>
      }
    </div>
    <div className="h-1/6 flex flex-col place-content-center mt-5 overflow-hidden">
      <><PdfMaker innerRef={createPdf} teacher={lessonStatus.teacher} lessonStartedDate={lessonStatus.lessonStarted} />
        <button type="submit" className="min-w-0 rounded-md bg-green-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600" onClick={finishLesson}>Zakończ lekcję</button></>
    </div>
  </>
  )
  // 2 -> 60
  const lessonCompleted = (
    <div className="h-1/6 relative flex flex-col overflow-auto">
      {//Lekcja zakończona, rozłączenie nastąpi za:
        //<Countdown date={Date.parse(lessonStatus.lessonStarted) + 1000 * 60 * 2} onComplete={finishLessonAutomatically} />
      }
      Lekcja zakończona. Pobierz podsumowanie / rozpocznij nową lekcję
    </div>
  )

  const introductionTalk = (
    <>
      <div className="h-1/6 flex flex-col place-content-center mt-5 overflow-hidden">
        {!iStarted ?
          <>
            <button
              type="submit"
              className="rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 animate-pulse transition-transform duration-300 mx-auto"
              onClick={startLesson}
            >
              Rozpocznij lekcję
            </button>
            <span className="bottom-4 self-center text-xs font-medium mt-2 text-blue-600 dark:text-blue-500 hover:cursor-pointer" onClick={() => { setConfirmResignModalVisible(true); }}>Rezygnuj</span>
            <div className="w-full flex justify-center mt-2">
              <div className="w-full bg-blue-50 border border-blue-300 text-blue-900 rounded-lg px-4 py-2 mb-4 text-center font-semibold shadow-sm text-xs">
                {lessonStartedByRemoteText ||
                  "Rozmowa wstępna - to czas na sprawdzenie połączenia i zapoznanie z materiałem. Jeśli wszystko jest w porządku, kliknij 'Rozpocznij lekcję'."}
                <br />
                <Countdown date={Date.parse(lessonStatus.invitationAcceptedDate) + 1000 * 60 * 5} onComplete={() => { setForceStartLessonModalVisible(true) }} />
              </div>
              {//Tu skonczylam. Trzeba dodac taki licznik tylko jako odniesienie do czasu pobrac z bazy jakas date oprocz introduction talk
                // Dopisac funkcje onComplete ktora rozlaczy uzytkownikow
              }
            </div>
          </> :
          <div className="w-full flex justify-center mt-2">
            <div className="w-full bg-blue-50 border border-blue-300 text-blue-900 rounded-lg px-4 py-2 mb-4 text-center font-semibold shadow-sm text-xs">
              Oczekiwanie na rozpoczęcie lekcji przez drugiego użytkownika.
            </div>
          </div>
        }
      </div>

    </>
  )

  return (
    <div className="flex flex-col mx-5 mt-5 select-none">
      <VideoStream socket={socket} isRemotePresent={isRemotePresent} room={room} teacherUserId={lessonStatus.teacherUserId} isTeacher={isTeacher} />
      {lessonStatus.state === 'initialState' ? initialState :
        lessonStatus.state === 'introductionTalk' ? introductionTalk :
          lessonStatus.state === 'pendingInvitation' ? pendingInvitation :
            lessonStatus.state === 'lessonInProgress' ? lessonInProgress :
              lessonStatus.state === 'lessonCompleted' ? lessonCompleted :
                "Wystąpił problem, skontaktuj się z nami aby go rozwiązać"}

      <Dialog header="Znajdź korepetytora" resizable={false} visible={findTeacherModalVisible} style={{ width: '90vw' }} onHide={handleFindTeacherModalClose} className="gray-header-modal">
        <FindTeacherContent socket={socket} loggedIn={loggedIn} isTeacher={isTeacher} displayOnModal={true} />
      </Dialog >

      <Dialog header="Zaproszenie odrzucone"  resizable={false} visible={invitationDeclinedModalVisible} onHide={handleInvitationDeclinedModalClose}>
        <div className="grid">
          <div className="mx-3">
            <p>
              Wybrany korepetytor nie mógł zaakceptować Twojego zaproszenia. <br />
              Spróbuj ponownie lub zaproś innego korepetytora.
            </p>
          </div>
          <button type="submit" className="min-w-0 mt-10 place-self-center rounded-md bg-green-600 px-12 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600" onClick={handleInvitationDeclinedModalClose}>OK</button>
        </div>
      </Dialog >

      <Dialog header="Lekcja zakończona" resizable={false} visible={lessonCompletedModalVisible} onHide={handleLessonCompletedModalClose}>
        <div className="grid">
          <div className="mx-3">
            <p>
              {isTeacher === '1' ? "Lekcja została zakończona. Dziękujemy!" :
                <p>
                  Lekcja zakończona. Dziękujemy! <br />
                </p>
              }
            </p>
          </div>

          {/* Formularz przeniesiony do osobnego modalu */}

          <button type="submit" className="min-w-0 mt-10 place-self-center rounded-md bg-green-600 px-12 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600" onClick={handleLessonCompletedModalClose}>OK</button>
        </div>
      </Dialog >

      <Dialog header="Lekcja anulowana" resizable={false} visible={lessonResignedModalVisible} onHide={handleLessonResignedModalClose}>
        <div className="grid">
          <div className="mx-3">
            <p>
              {isTeacher === '1' ? "Lekcja została anulowana" : "Lekcja anulowana. Możesz ponownie zaprosić korepetytora"}
            </p>
          </div>
          <button type="submit" className="min-w-0 mt-10 place-self-center rounded-md bg-green-600 px-12 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600" onClick={handleLessonResignedModalClose}>OK</button>
        </div>
      </Dialog >

      <Dialog header="Lekcja anulowana" resizable={false} visible={confirmResignModalVisible} onHide={() => setConfirmResignModalVisible(false)}>
        <div className="grid">
          <div className="mx-3">
            <p>
              Czy na pewno chcesz zrezygnować z lekcji?
            </p>
          </div>
          <div className="flex flex-col gap-3 mt-10">
            <button
              type="button"
              className="min-w-0 place-self-center rounded-md bg-red-600 px-12 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              onClick={() => { resign(); setConfirmResignModalVisible(false) }}
            >
              Tak, rezygnuj
            </button>
          </div>
        </div>
      </Dialog >

      <Dialog header="Rozpocznij lekcję" resizable={false} visible={forceStartLessonModalVisible} onHide={handleLessonResignedModalClose} closable={false}>
        <div className="grid">
          <div className="mx-3 mb-5">
            <p>
              Rozpocznij lekcję, aby kontynuować.
            </p>
          </div>
          <button
            type="submit"
            className="rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 animate-pulse transition-transform duration-300 mx-auto"
            onClick={() => { startLesson(); setForceStartLessonModalVisible(false) }}
          >
            Rozpocznij lekcję
          </button>
          <span className="bottom-4 self-center text-xs font-medium mt-2 text-blue-600 dark:text-blue-500 hover:cursor-pointer" onClick={() => { setConfirmResignModalVisible(true); }}>Rezygnuj</span>
        </div>
      </Dialog >
      <AddOpinionModal displayReviewModal={displayReviewModal} teacher={teacherRef.current} />
    </div>
  );
}

export default SidePanel;