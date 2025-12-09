import { useState } from 'react';
import LoadingAnimation from './LoadingAnimation';

import HeroImage from '../images/korkomat-hero-image.jpg';
import HomeIllustration from './HomeIllustration';
import VerticalCarousel from './VerticalCarousel';
import InvitationPopup from './InvitationPopup';

function HeroHome({ isTeacher, loggedIn }) {
  const [loading, setLoading] = useState(true);

  const heroImageOnload = () => {
    const isFirefox = typeof navigator !== "undefined" && /firefox/i.test(navigator.userAgent);
    if (isFirefox) {
      setTimeout(() => setLoading(false), 1500);
    } else {
      setLoading(false);
    }
  };


  const studentContent = (
    <div className="max-w-4xl mx-auto md:min-h-full text-center pb-12 md:pb-16 font-normal">
      <h1 className="mb-3 text-3xl lg:text-5xl text-neutral-800 tracking-wider font-normal [text-shadow:_0_4px_4px_rgb(255_255_255_/_25%)]" data-aos="fade-up">
        <div className="text-shadow">
          Potrzebujesz korepetycji <span className='font-extrabold tracking-widest'>teraz</span>?
        </div>
      </h1>
      <p className="text-xl lg:text-3xl text-neutral-800 tracking-wider mb-4 [text-shadow:_0_4px_4px_rgb(255_255_255_/_25%)]" data-aos="fade-up" data-aos-delay="200">
        Sprawdź jakie to proste!
      </p>
      <div className="max-w-xs mx-auto sm:max-w-none sm:flex sm:justify-center">
        <a
          className="btn lg:text-xl text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-700 w-full mb-4 sm:w-auto sm:mb-0 mx-3"
          href={loggedIn ? "#/room" : "#/checkHowSimpleItIs"}
        >
          Wchodzę
        </a>
      </div>
    </div>
  )

  const teacherContent = (
    <div className="max-w-4xl mx-auto md:min-h-full text-center pb-12 md:pb-16 font-normal">
      <h1 className="mb-3 text-3xl lg:text-5xl text-neutral-800 tracking-wider font-normal [text-shadow:_0_4px_4px_rgb(255_255_255_/_25%)]" data-aos="fade-up">
        <div className="text-shadow">
          <span className='font-extrabold tracking-wider'>Udzielasz korepetycji</span>?
        </div>
      </h1>
      <p className="text-xl lg:text-3xl text-neutral-800 tracking-widest mb-4 [text-shadow:_0_4px_4px_rgb(255_255_255_/_25%)]" data-aos="fade-up" data-aos-delay="200">
        Przenieś się do internetu!
      </p>
      <div className="max-w-xs mx-auto sm:max-w-none sm:flex sm:justify-center">
        <a className="btn lg:text-xl text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-700 w-full mb-4 sm:w-auto sm:mb-0 mx-3" href="#/teacherPanel">
          Rozpocznij
        </a>
      </div>
    </div>
  )

  return (
    <section>
      {loading && <LoadingAnimation />}
      <img onLoad={heroImageOnload} className="absolute object-cover flex overflow-hidden justify-center h-full w-full backdrop-opacity-[.15]" data-aos="fade-up" data-aos-delay="200" src={HeroImage} alt="Hero" />
      {/* <img className="absolute right-[15%] top-[15%] hidden opacity-[0.85] grayscale-[0.5] lg:inline object-fill w-1/5 bounce-top" src={TeacherTile} alt="Hero" /> */}
      {/* <img className="absolute left-[10%] top-[20%] hidden opacity-[0.85] grayscale-[0.5] lg:inline object-fill w-1/6 tilt-in-fwd-tl" src={Invitation} alt="Hero" /> */}
      <div className="absolute right-[15%] top-[7%] hidden opacity-[0.85] grayscale-[0.5] lg:inline object-fill w-1/5">
      <VerticalCarousel />
      </div>
      <div className="absolute hidden lg:inline ">
      {!loading && <InvitationPopup />}
      </div>
      <HomeIllustration />

      <div className="fixed bottom-0 left-0 w-full pt-32 pb-2 md:pt-40 md:pb-3 z-50 flex justify-center">
        {isTeacher == 1 ? teacherContent : studentContent}
      </div>
    </section>
  );
}

export default HeroHome;
