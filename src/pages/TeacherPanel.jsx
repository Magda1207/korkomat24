import { useState, useEffect, useRef } from 'react';

import Header from '../partials/Header';
import Footer from '../partials/Footer';
import { useFetch } from '../server/common/apiCalls'
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import icons from '../partials/icons';
import LessonHistory from '../partials/LessonHistory';
import Gallery from '../partials/Gallery';
import { Dialog } from 'primereact/dialog';
import learningCoupleImage from '../images/learning4.jpg'; // Dodaj import obrazka

const TeacherPanel = ({ loggedIn, setLoggedIn, invitationStatusUpdated, socket, myStatus }) => {
  const navigate = useNavigate();
  const teacherPanelInfo = useFetch('/api/teacherPanelInfo', undefined, [invitationStatusUpdated])
  const [activeLessonData, setActiveLessonData] = useState()
  const [activeInvitationsData, setActiveInvitationsData] = useState([])
  const [sockets, setSockets] = useState([])
  const [addPhotoDialogVisible, setAddPhotoDialogVisible] = useState(false)

  // Opinie korepetytora
  const myReviews = useFetch('/api/myReviews')
  const reviews = myReviews[0] || []
  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + (Number(r?.rate) || 0), 0) / reviews.length
    : 0

  // useEffect(() => {
  socket.on('active_sockets', (data) => {
    setSockets(data)
  });
  // }, [socket])
  useEffect(() => {
    socket.emit('get_number_of_sockets')
  }, [])

  useEffect(() => {
    if (teacherPanelInfo[0]) {
      if (teacherPanelInfo[0].activeLesson) {
        setActiveLessonData(teacherPanelInfo[0].activeLesson[0])
      }
      if (teacherPanelInfo[0].activeInvitations) {
        setActiveInvitationsData(teacherPanelInfo[0].activeInvitations)
      }
    }
  }, [teacherPanelInfo])


  // const acceptInvitation = async (roomId, accessCode) => {
  //   await axios.put('/api/invitation/accept', { roomId })
  //     .then((res) => {
  //       if (!(res instanceof Error)) {
  //         localStorage.setItem('room', roomId)
  //         //localStorage.setItem('accessCode', accessCode)
  //         navigate('/room', { replace: false });
  //       }
  //     })
  // }

  const myLessons = (activeLessonData ? <> <div>{activeLessonData.length}</div>
    <>
      <span className="bottom-4 right-0 text-xs font-medium mr-1">{activeLessonData.FirstName + " " + activeLessonData.LastName}</span>
      <button className="bottom-4 right-0 text-xs font-medium text-blue-600 dark:text-blue-500 hover:cursor-pointer" onClick={() => navigate('/room', { replace: false })}>Kontynuuj</button>
    </>
  </> : "0"
  )

  const myInvitations = (
    activeInvitationsData[0] ? <> <div> {activeInvitationsData.length}</div>
      {/* {activeInvitationsData.map((x) =>
        <div key={x.roomId}>
          <span className="bottom-4 right-0 text-xs font-medium mr-1">{x.FirstName + " " + x.LastName}</span>
          <button className="bottom-4 right-0 text-xs font-medium text-blue-600 dark:text-blue-500 hover:cursor-pointer" onClick={() => acceptInvitation(x.roomId, x.roomCode)}>Akceptuj</button>
        </div>
      ) 
      }*/}
    </> : "0"
  )

  //Andvanced card
  const header = (
    <img alt="Card" src="https://primefaces.org/cdn/primereact/images/usercard.png" />
  );
  const footer = (
    <>
      <Button label="Save" icon="pi pi-check" />
      <a className="btn lg:text-xl text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-700 w-full mb-4 sm:w-auto sm:mb-0 mx-3" href="#/room">
        Wchodzę
      </a>
      <Button label="Cancel" severity="secondary" icon="pi pi-times" style={{ marginLeft: '0.5em' }} />
    </>
  );

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/* Obrazek na górze */}
      <div className="relative w-full">
        <div className="w-full h-[32vh] md:h-[25vh] rounded-b-3xl overflow-hidden">
          <img
            src={learningCoupleImage}
            alt="Tło"
            className="w-full h-full object-cover object-center brightness-[0.6] contrast-50"
          />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/60 via-black/30 to-transparent pointer-events-none" />
        </div>
        {/* Nagłówek wyśrodkowany na obrazku */}
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
          <h1 className="text-5xl font-semibold text-white text-center drop-shadow-lg pointer-events-auto tracking-wider">
            Panel Korepetytora
          </h1>
        </div>
      </div>

      {/*  Site header */}
      <Header loggedIn={loggedIn} setLoggedIn={setLoggedIn} myStatus={myStatus} lightMode={true} />

      {/*  Page content */}
      <main className="grow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-10">
          <div className="flex items-center justify-between mb-2 mt-8">
          </div>
          <div className="border-b border-gray-900/20 mb-12 pb-3 col-span-1 text-2xl font-semibold text-gray-900">Panel Korepetytora</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Saldo */}
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center">
              <div className="text-gray-600 font-medium mb-2">Saldo</div>
              <div className="mb-5 w-full flex flex-col items-center">
                <div className="text-3xl font-bold mb-4">125 zł</div>
                <button className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg transition">
                  Wypłać
                  {icons.MoneyOutWhite}
                </button>
              </div>
            </div>

            {/* Ruch na stronie */}
            <div className="bg-white rounded-xl shadow p-6 flex flex-col">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="text-gray-600 font-medium">Ruch na stronie</div>
                <span className="relative inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-semibold uppercase tracking-wide shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
                  </span>
                  <span>live</span>
                </span>
              </div>
              <div className="flex flex-row items-start justify-center gap-10 mt-4 mb-2">
                <div className="flex flex-col items-center">
                  <span className="text-sm text-gray-500 mt-4">Liczba uczniów:</span>
                  <span className="text-2xl font-bold text-blue-700 mt-2">{sockets.activeUsers}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-sm text-gray-500 mt-4">Liczba korepetytorów:</span>
                  <span className="text-2xl font-bold text-blue-700 mt-2">{sockets.activeTeachers}</span>
                </div>
              </div>
            </div>

            {/* Akcje */}
            <div className="bg-white rounded-xl shadow p-6 flex flex-col">
              <div className="text-gray-600 font-medium mb-4 text-center flex items-center justify-center gap-2">
                <span>Szybkie akcje</span>
              </div>
              <div className="flex flex-col gap-3 mt-2">
                <Button
                  onClick={() => navigate('/room', { replace: false })}
                  className="w-full inline-flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 font-medium px-5 py-2.5 rounded-md transition"
                >
                  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-gray-600">
                    <path fill="currentColor" d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v13a.5.5 0 0 1-.79.407L12 14.5l-7.21 4.407A.5.5 0 0 1 4 18.5v-13Z"/>
                  </svg>
                  <span>Otwórz tablicę</span>
                </Button>
                <Button
                  onClick={() => setAddPhotoDialogVisible(true)}
                  className="w-full inline-flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 font-medium px-5 py-2.5 rounded-md transition"
                >
                  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-gray-600">
                    <path fill="currentColor" d="M3.75 4A.75.75 0 0 0 3 4.75v12.5c0 .414.336.75.75.75H20.25a.75.75 0 0 0 .75-.75V4.75A.75.75 0 0 0 20.25 4H3.75Zm6.5 2.5a.75.75 0 0 1 .75-.75h2a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1-.75-.75Zm-4.78 8.53 3.72-3.72a.75.75 0 0 1 1.06 0l2.22 2.22 4.72-4.72a.75.75 0 0 1 1.06 0l3 3v5.19H5.47a.75.75 0 0 1-.53-1.28Z"/>
                  </svg>
                  <span>Moja galeria</span>
                </Button>
              </div>
            </div>

            {/* Historia lekcji */}
            <div className="bg-white rounded-xl p-6 shadow flex flex-col md:col-span-3">
              <div className="text-gray-600 font-medium mb-2">Historia lekcji</div>
              <div className="max-h-72 overflow-auto pr-2"> 
                <LessonHistory />
              </div>
            </div>
            {/* Moje materiały 
            <div className="bg-white rounded-xl p-6 shadow flex flex-col min-w-0">
              <div className="text-gray-600 font-medium mb-2">Moje materiały</div>
              <div className=" max-h-60 min-w-0">
                Test
              </div>
            </div> */}
            {/* Aktualności */}
            {/* <div className="bg-white rounded-xl shadow p-6 flex flex-col">
              <div className="text-gray-600 font-medium mb-4">Jak działa strona?</div>
              <div className="flex flex-col items-center mb-2">
                {/* <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noopener noreferrer" className="block w-full max-w-xs rounded-lg overflow-hidden shadow hover:shadow-lg transition">
                  <img src="https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg" alt="Miniatura YouTube" className="w-full h-auto" />
                </a> 
                <a href="#/room" className="text-blue-600 hover:underline text-sm font-medium mt-2">Zobacz tablicę</a>
              </div>
            </div> */}
            {/* Opinie */}
            <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-between md:col-span-3">
              <div className="text-gray-600 font-medium mb-2">Moje opinie</div>

              <div className="flex items-center gap-2 text-xl font-bold mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className="w-6 h-6 text-yellow-400">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.38-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.784.57-1.838-.197-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.174 9.393c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.966z" />
                </svg>
                {reviews.length ? `${avgRating.toFixed(1)} / 5` : 'Brak ocen'}
                {reviews.length ? <span className="text-sm font-normal text-gray-500">({reviews.length})</span> : null}
              </div>

              {reviews.length ? (
                <ul className="mt-2 space-y-4">
                  {reviews.slice(0, 5).map((r, idx) => {
                    const rating = Number(r?.rate ?? r?.rating) || 0
                    const reviewerName = `${r?.FirstName ?? ''} ${r?.LastName ?? ''}`.trim() || 'Anonim'
                    return (
                      <li key={r?.id ?? idx} className="pt-1">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-900">{reviewerName}</div>
                          <div className="flex items-center gap-1">
                            {[1,2,3,4,5].map(n => (
                              <span key={n} className={n <= rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                            ))}
                            <span className="ml-1 text-xs text-gray-500">{rating}/5</span>
                          </div>
                        </div>
                        {r?.comment ? (
                          <p className="mt-1 text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                        ) : null}
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <div className="text-sm text-gray-500">Brak opinii do wyświetlenia.</div>
              )}
            </div>
          </div>
        </div>
        <Dialog className='custom-dialog no-top-left-right-padding gray-header-modal' resizable={false} contentStyle={{ overflow: 'visible' }} header="Moje obrazy" visible={addPhotoDialogVisible} onHide={() => setAddPhotoDialogVisible(false)}>
          <Gallery socket={socket} />
        </Dialog>
      </main>
      <Footer />
    </div>
  );
}

export default TeacherPanel;