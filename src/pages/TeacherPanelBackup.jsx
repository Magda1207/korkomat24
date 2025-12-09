import { useState, useEffect, useRef } from 'react';

import Header from '../partials/Header';
import PageIllustration from '../partials/PageIllustration';
import Breadcrumbs from '../partials/Breadcrumbs';
import Footer from '../partials/Footer';
import { useFetch } from '../server/common/apiCalls'
import { useNavigate } from 'react-router-dom';
import PanelCard from '../partials/PanelCard';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import icons from '../partials/icons';
import axios from 'axios'
import Stepper from '../partials/Stepper';
import Gallery from '../partials/Gallery';
import { Dialog } from 'primereact/dialog';

const TeacherPanel = ({ loggedIn, setLoggedIn, invitationStatusUpdated, socket, myStatus }) => {
  const navigate = useNavigate();
  const teacherPanelInfo = useFetch('/api/teacherPanelInfo', undefined, [invitationStatusUpdated])
  const [activeLessonData, setActiveLessonData] = useState()
  const [activeInvitationsData, setActiveInvitationsData] = useState([])
  const [sockets, setSockets] = useState([])
  const [addPhotoDialogVisible, setAddPhotoDialogVisible] = useState(false)

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

      {/*  Site header */}
      <Header loggedIn={loggedIn} setLoggedIn={setLoggedIn} myStatus={myStatus} />

      {/*  Page content */}
      <main className="grow">

        {/*  Page illustration */}
        <div className="relative max-w-6xl mx-auto h-0 pointer-events-none" aria-hidden="true">
          <PageIllustration />
        </div>

        <section className="relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="pt-28 pb-12 md:pt-28 md:pb-20">

              <Breadcrumbs pageName="Panel Korepetytora" />
              {/* htmlForm */}
              <form>
                <div className="space-y-8">
                  <div className="mt-8 grid grid-cols-1 gap-y-2">
                    <div className="border-b border-gray-900/20 pb-3 col-span-1 text-2xl font-semibold text-gray-900">Panel Korepetytora</div>
                    <Stepper />
                    <div className="flex gap-4 my-8">
                      <PanelCard title="Lekcje w toku" value={myLessons} icon={icons.LessonInProgress} color="bg-amber-300" />
                      <PanelCard title="Zaproszenia w toku" value={myInvitations} icon={icons.Envelope} color="bg-teal-300" />
                      <PanelCard title="Uczniowie online" value={sockets.activeUsers} icon={icons.Student} color="bg-sky-300" />
                      <PanelCard title="Korepetytorzy online" value={sockets.activeTeachers} icon={icons.Teacher} color="bg-violet-400" />
                    </div>
                    <button
                      type="button"
                      className="btn text-white bg-gradient-to-r from-blue-500 to-green-400 hover:from-blue-600 hover:to-green-500 px-4 py-2 rounded shadow"
                      onClick={() => setAddPhotoDialogVisible(true)}
                    >
                      Moje obrazy
                    </button>
                    <div className="card flex justify-content-center gap-4">
                      <Card title="Advanced Card" subTitle="Card subtitle" footer={footer} header={header} className="md:w-25rem">
                        <p className="m-0">
                          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed consequuntur error repudiandae
                          numquam deserunt quisquam repellat libero asperiores earum nam nobis, culpa ratione quam perferendis esse, cupiditate neque quas!
                        </p>
                      </Card>
                      <Card title="Advanced Card" subTitle="Card subtitle" footer={footer} header={header} className="md:w-25rem">
                        <p className="m-0">
                          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed consequuntur error repudiandae
                          numquam deserunt quisquam repellat libero asperiores earum nam nobis, culpa ratione quam perferendis esse, cupiditate neque quas!
                        </p>
                      </Card>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <Dialog className='custom-dialog no-top-left-right-padding gray-header-modal'  resizable={false} contentStyle={{ overflow: 'visible' }} header="Moje obrazy" visible={addPhotoDialogVisible} onHide={() => setAddPhotoDialogVisible(false)}>
            <Gallery socket={socket} />
          </Dialog >
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default TeacherPanel;