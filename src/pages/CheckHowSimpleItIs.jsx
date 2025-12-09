import { Link } from 'react-router-dom';

import Header from '../partials/Header';
import Footer from '../partials/Footer';
import learningCoupleImage from '../images/learning4.jpg';
import tablica from '../images/tablica.gif';
import HeaderImage from '../partials/HeaderImage';

function CheckHowSimpleItIs({ loggedIn, setLoggedIn }) {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden relative font-['Montserrat','Inter',sans-serif] bg-gray-50">
      {/* Testowy obrazek na górze */}
<HeaderImage />

      {/*  Site header */}
      <Header loggedIn={loggedIn} setLoggedIn={setLoggedIn} lightMode={true} />

      {/*  Page content */}
      <main className="grow flex flex-col items-center justify-center px-4 relative z-10">
        <section className="w-full max-w-4xl mx-auto pt-20 pb-12 -mt-80">
          {/* Tytuł */}
          <div className="flex flex-col items-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-stone-200 text-center leading-tight mb-4">
              <span className="block">Korepetycje bez umawiania?</span>
            </h1>
            <p className="text-lg md:text-xl font-medium tracking-wide text-stone-300 text-center mb-2">
              Teraz to możliwe!
            </p>
          </div>
          {/* Punkty */}
          <div className="flex flex-col gap-8 mb-10">
            <div className="flex flex-col md:flex-row gap-8">
              {[{
                num: 1,
                title: "Zaloguj się",
                link: "/#/signin",
                desc: <></>
              }, {
                num: 2,
                title: "Wybierz korepetytora",
                link: "/#/teachers",
                desc: <></>
              }, {
                num: 3,
                title: "Zaproś go do sali",
                link: "/#/teachers",
                desc: <>...i ucz się od razu – bez czekania!</>
              }].map(({ num, title, link, desc }) => (
                <a href={link}
                  key={num}
                  className="flex-1 shadow-md bg-white rounded-2xl shadow p-6 flex flex-col items-center border border-gray-100 group transition"
                >
                  <span className="text-white bg-stone-800 w-8 h-8 flex items-center justify-center font-extrabold text-lg shadow-lg rounded-full mb-3 transition-transform duration-300 group-hover:-translate-y-2 group-hover:animate-bounce">
                    {num}
                  </span>
                  <a href={link} className="font-bold text-lg text-stone-900 hover:text-[#007AFF] transition">{title}</a>
                  <div className="text-gray-600 text-sm italic mt-2 text-center">{desc}</div>
                </a>
              ))}
            </div>
          </div>
          {/* Gif */}
          <div className="flex justify-center mt-2 mb-8">
            <img
              src={tablica}
              alt="Demo gif"
              className="rounded-2xl w-full  object-cover border border-gray-200 shadow-lg"
            />
          </div>
          {/* Przycisk */}
          <div className="flex flex-col items-center mt-8">
            <Link
              to="/room"
              className="px-8 py-3 bg-stone-800 text-white rounded-xl font-medium tracking-wide shadow-lg hover:scale-105 transition text-center text-md"
            >
              Zobacz jak wygląda nasza Wirtualna Tablica
            </Link>
          </div>
        </section>
      </main>
      <Footer mainPage={false} />
    </div>
  );
}

export default CheckHowSimpleItIs;