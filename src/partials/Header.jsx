import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MenuDropdown from '../partials/MenuDropdown';
import { Dialog } from 'primereact/dialog'
import { logout } from '../partials/functions/global';
import axios from 'axios'

import logoBlack from '../images/korkomat_logo_black.svg';
import logoWhite from '../images/korkomat_logo_white.svg';
import socket from '../socket/socket';

function Header({ loggedIn, setLoggedIn, myStatus, displayModalBeforeEntering, getLeavingConfirmed, lightMode }) {
  const [isTeacher, setIsTeacher] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [firstName, setFirstName] = useState();
  const [lastName, setLastName] = useState();
  const [balance, setBalance] = useState();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState('');

  const trigger = useRef(null);
  const mobileNav = useRef(null);
  const navigate = useNavigate();

  // close the mobile menu on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!mobileNav.current || !trigger.current) return;
      if (!mobileNavOpen || mobileNav.current.contains(target) || trigger.current.contains(target)) return;
      setMobileNavOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close the mobile menu if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!mobileNavOpen || keyCode !== 27) return;
      setMobileNavOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  // Get first and last name
  useEffect(() => {
    setFirstName(localStorage.getItem('firstName'))
    setLastName(localStorage.getItem('lastName'))
    setIsTeacher(Number(localStorage.getItem('isTeacher')))
  })

  // Get user balance
  useEffect(() => {
    if (loggedIn) {
      (async () => {
        try {
          const response = await axios.get('/api/balance')
          setBalance(response.data.balance)
        }
        catch (error) {
          //handle error
        }
      }
      )()
    }
  }, [loggedIn])

  function handleNavigation(e) {
    const href = e.currentTarget.getAttribute('href');
    if (loggedIn && displayModalBeforeEntering) {
      e.preventDefault();
      setShowConfirmationModal(true);
      setPendingNavigation(href);
    } else {
      e.preventDefault();
      navigate(href);
    }
  }


  return (
    <header className={`w-full z-50 fixed top-0 left-0 right-0 select-none${lightMode ? ' ' : ' bg-neutral-50 shadow'}`}>
      {lightMode && (
        <div className="absolute inset-x-0 -top-10 h-32 pointer-events-none -z-10">
          <div className="w-full h-full bg-gradient-to-b from-black/30 via-black/20 to-transparent blur-xl"></div>
        </div>
      )}
      <div className={`mx-10 px-4 sm:px-6${lightMode ? ' mt-2' : ''}`}>
        <div className="flex items-center justify-between h-14">

          {/* Site branding */}
          <div className="shrink-0 mr-4">
            <a href="/" className="block" onClick={handleNavigation} aria-label="Cruip">
              <img src={lightMode ? logoWhite : logoBlack} className='h-10' alt="logo" />
            </a>
          </div>

          {loggedIn ? <>
            {/* Desktop Logout navigation */}
            <nav className="hidden md:flex md:grow">
              <ul className="flex grow justify-end flex-wrap items-center">
                <li className="flex justify-end  tracking-wider">
                  <a
                    href="/teachers"
                    onClick={handleNavigation}
                    className={`font-medium px-10 py-3 transition duration-150 ease-in-out ${lightMode ? 'text-white hover:text-gray-200' : 'text-blue-600 hover:text-blue-800'}`}
                  >
                    Znajdź korepetytora
                  </a>
                </li>
                <li>
                  <MenuDropdown setLoggedIn={setLoggedIn} isTeacher={isTeacher} myStatus={myStatus} handleNavigation={handleNavigation} socket={socket} getLeavingConfirmed={getLeavingConfirmed} />
                </li>
                <div className={`m-5 ${lightMode ? 'text-white' : ''}`}>
                  {firstName} {lastName}<br />
                  Stan konta: {balance} zł
                </div>
              </ul>
            </nav>

          </> : <>
            {/* Desktop Log in navigation */}
            <nav className="hidden md:flex md:grow">
              {/* Desktop sign in links */}
              <ul className="flex grow justify-end flex-wrap items-center">
                <li className="flex grow justify-end">
                  <Link to="/startTeaching" className={`font-medium  tracking-wider px-4 py-3 transition duration-150 ease-in-out ${lightMode ? 'text-white hover:text-gray-200' : 'text-blue-600 hover:text-blue-800'}`}>Jestem korepetytorem</Link>
                </li>
                <li className="flex justify-end  tracking-wider">
                  <Link
                    to="/teachers"
                    className={`font-medium px-10 py-3 transition duration-150 ease-in-out ${lightMode ? 'text-white hover:text-gray-200' : 'text-blue-600 hover:text-blue-800'}`}
                  >
                    Znajdź korepetytora
                  </Link>
                </li>
                <li className="flex justify-end">
                  <Link to="/signin" className="btn btn-sm text-white text-s bg-emerald-500 hover:bg-emerald-700 inline-flex">Zaloguj się
                    <span className="ml-2 inline-flex">
                      <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.7189 1.96875V19.0312C17.7189 19.2053 17.6497 19.3722 17.5267 19.4953C17.4036 19.6184 17.2367 19.6875 17.0626 19.6875H3.93762C3.76357 19.6875 3.59665 19.6184 3.47358 19.4953C3.35051 19.3722 3.28137 19.2053 3.28137 19.0312V17.7188H4.59387V18.375H16.4064V2.625H4.59387V4.59375H3.28137V1.96875C3.28137 1.7947 3.35051 1.62778 3.47358 1.50471C3.59665 1.38164 3.76357 1.3125 3.93762 1.3125H17.0626C17.2367 1.3125 17.4036 1.38164 17.5267 1.50471C17.6497 1.62778 17.7189 1.7947 17.7189 1.96875ZM8.06543 13.3153L8.99731 14.2472L12.2786 10.9659C12.3401 10.9049 12.3889 10.8323 12.4222 10.7524C12.4555 10.6724 12.4727 10.5866 12.4727 10.5C12.4727 10.4134 12.4555 10.3276 12.4222 10.2476C12.3889 10.1677 12.3401 10.0951 12.2786 10.0341L8.99731 6.75281L8.06543 7.68469L10.2311 9.84375H3.28137V11.1562H10.2311L8.06543 13.3153Z" fill="white" />
                      </svg>
                    </span>
                  </Link>
                </li>
              </ul>
            </nav> </>}

          {/* Mobile menu */}
          <div className="md:hidden">

            {/* Hamburger button */}
            <button ref={trigger} className={`hamburger ${mobileNavOpen && 'active'}`} aria-controls="mobile-nav" aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen(!mobileNavOpen)}>
              <span className="sr-only">Menu</span>
              <svg className="w-6 h-6 fill-current text-gray-300 hover:text-gray-600 transition duration-150 ease-in-out" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect y="4" width="24" height="2" rx="1" />
                <rect y="11" width="24" height="2" rx="1" />
                <rect y="18" width="24" height="2" rx="1" />
              </svg>
            </button>

            {loggedIn ? <>
              {/*Mobile Log Out navigation */}
              <nav id="mobile-nav" ref={mobileNav} className="absolute top-full z-20 left-0 w-full px-4 sm:px-6 overflow-hidden transition-all duration-300 ease-in-out" style={mobileNavOpen ? { maxHeight: mobileNav.current.scrollHeight, opacity: 1 } : { maxHeight: 0, opacity: .8 }}>
                <ul className="bg-gray-800 px-4 py-2">
                  <li>
                    <a href="/profile" onClick={handleNavigation} className="flex font-medium w-full text-gray-400 hover:text-gray-200 py-2 justify-center">Moje konto</a>
                  </li>
                  {isTeacher == false && <li>
                    <Link to="/lessonHistory" className="flex font-medium w-full text-gray-400 hover:text-gray-200 py-2 justify-center">Historia Lekcji</Link>
                  </li>}
                  {isTeacher == true && <li>
                    <Link to="/publication" className="flex font-medium w-full text-gray-400 hover:text-gray-200 py-2 justify-center">Moje ogłoszenie</Link>
                  </li>}
                  {isTeacher == true && <li>
                    <Link to="/teacherPanel" className="flex font-medium w-full text-gray-400 hover:text-gray-200 py-2 justify-center">Panel korepetytora</Link>
                  </li>}
                  <li>
                    <a href="/teachers" onClick={handleNavigation} className="flex font-medium w-full text-gray-400 hover:text-gray-200 py-2 justify-center">Znajdź korepetytora</a>
                  </li>
                  <li>
                    <button onClick={() => logout(socket, setLoggedIn, getLeavingConfirmed, navigate)} className="flex font-medium w-full text-gray-400 hover:text-gray-200 py-2 justify-center">Wyloguj się</button>
                  </li>
                </ul>
              </nav>
            </> : <>
              {/*Mobile Log In navigation */}
              <nav id="mobile-nav" ref={mobileNav} className="absolute top-full z-20 left-0 w-full px-4 sm:px-6 overflow-hidden transition-all duration-300 ease-in-out" style={mobileNavOpen ? { maxHeight: mobileNav.current.scrollHeight, opacity: 1 } : { maxHeight: 0, opacity: .8 }}>
                <ul className="bg-gray-800 px-4 py-2">
                  <li>
                    <Link to="/signin" className="flex font-medium w-full text-gray-400 hover:text-gray-200 py-2 justify-center">Zaloguj się</Link>
                  </li>
                  <li>
                    <Link to="/signup" className="flex font-medium w-full text-gray-400 hover:text-gray-200 py-2 justify-center">Utwórz konto</Link>
                  </li>
                  <li>
                    <a href="/teachers" onClick={handleNavigation} className="flex font-medium w-full text-gray-400 hover:text-gray-200 py-2 justify-center">Znajdź korepetytora</a>
                  </li>
                  <li>
                    <Link to="/startTeaching" className="flex font-medium w-full text-gray-400 hover:text-gray-200 py-2 justify-center">Jestem korepetytorem</Link>
                  </li>
                </ul>
              </nav>
            </>}
          </div>

        </div>
      </div>
      <Dialog
        header="Opuść pokój"
        visible={showConfirmationModal}
        style={{ width: 'auto', minWidth: 320, maxWidth: 400 }}
        onHide={() => setShowConfirmationModal(false)}
        modal
        className="custom-exit-modal"
        resizable={false}
      >
        <div className="text-center px-2 py-4">
          <div className="mb-6 text-lg font-semibold text-gray-800">
            Czy chcesz anulować zaproszenie i opuścić pokój?
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <button
              onClick={() => setShowConfirmationModal(false)}
              className="px-5 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition font-medium"
            >
              Anuluj
            </button>
            <button
              onClick={() => {
                setShowConfirmationModal(false);
                getLeavingConfirmed(true);
                navigate(pendingNavigation);
              }}
              className="px-5 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition font-semibold shadow-md border border-red-700"
              style={{ minWidth: 110 }}
            >
              Potwierdź
            </button>
          </div>
        </div>
      </Dialog>

    </header>
  );
}

export default Header;
