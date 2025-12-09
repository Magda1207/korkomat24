import Header from '../partials/Header';
import FindTeacherContent from '../partials/FindTeacherContent';
import Footer from '../partials/Footer';
import learningCoupleImage from '../images/learning4.jpg';
import HeaderImage from '../partials/HeaderImage';

const Teachers = ({ loggedIn, setLoggedIn, socket, myStatus, isTeacher }) => {

  return (
    <div className="flex flex-col min-h-screen overflow-hidden relative">
      {/* Obrazek na górze */}
      <div className="absolute top-0 left-0 w-full h-[16vh] z-0 rounded-b-3xl overflow-hidden">
        <img
          src={learningCoupleImage}
          alt="Tło"
          className="w-full h-full object-cover object-center brightness-[0.6] contrast-50"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/60 via-black/30 to-transparent pointer-events-none" />
      </div>

      {/*  Site header */}
      <Header loggedIn={loggedIn} setLoggedIn={setLoggedIn} myStatus={myStatus} lightMode={true}/>

      {/*  Page content */}
      <main className="grow relative z-10">
        <FindTeacherContent socket={socket} loggedIn={loggedIn} isTeacher={isTeacher}/>
      </main>
      <Footer mainPage={false} />
    </div>
  );
}

export default Teachers;