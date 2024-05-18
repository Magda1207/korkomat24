import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MenuDropdown from '../partials/MenuDropdown';
import Teachers from './TeachersAvatars'


import axios from 'axios'

function Header({ loggedIn, setLoggedIn }) {

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const trigger = useRef(null);
  const mobileNav = useRef(null);

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

  async function logout() {
    await axios.post('/api/logout')
    localStorage.clear()
    setLoggedIn(false)
  };

  return (
    <header className="absolute w-full z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">

          {/* Site branding */}
          <div className="shrink-0 mr-4">
            {/* Logo */}
            <Link to="/" className="block" aria-label="Cruip">
              <svg width="64px" height="64px" viewBox="-102.4 -102.4 1228.80 1228.80" className="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000" transform="rotate(-45)"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" stroke="#CCCCCC" strokeWidth="14.336000000000002"></g><g id="SVGRepo_iconCarrier"><path d="M512 960c-92.8 0-160-200-160-448S419.2 64 512 64s160 200 160 448-67.2 448-160 448z m0-32c65.6 0 128-185.6 128-416S577.6 96 512 96s-128 185.6-128 416 62.4 416 128 416z" fill="#050D42"></path><path d="M124.8 736c-48-80 92.8-238.4 307.2-363.2S852.8 208 899.2 288 806.4 526.4 592 651.2 171.2 816 124.8 736z m27.2-16c33.6 57.6 225.6 17.6 424-97.6S905.6 361.6 872 304 646.4 286.4 448 401.6 118.4 662.4 152 720z" fill="#050D42"></path><path d="M899.2 736c-46.4 80-254.4 38.4-467.2-84.8S76.8 368 124.8 288s254.4-38.4 467.2 84.8S947.2 656 899.2 736z m-27.2-16c33.6-57.6-97.6-203.2-296-318.4S184 246.4 152 304 249.6 507.2 448 622.4s392 155.2 424 97.6z" fill="#050D42"></path><path d="M512 592c-44.8 0-80-35.2-80-80s35.2-80 80-80 80 35.2 80 80-35.2 80-80 80zM272 312c-27.2 0-48-20.8-48-48s20.8-48 48-48 48 20.8 48 48-20.8 48-48 48zM416 880c-27.2 0-48-20.8-48-48s20.8-48 48-48 48 20.8 48 48-20.8 48-48 48z m448-432c-27.2 0-48-20.8-48-48s20.8-48 48-48 48 20.8 48 48-20.8 48-48 48z" fill="#5d5dff"></path></g></svg>
            </Link>
          </div>

          {loggedIn ? <>
            {/* Desktop Logout navigation */}
            <div className='ml-20'>
              <Teachers/>
            </div>
            <nav className="hidden md:flex md:grow">
              <ul className="flex grow justify-end flex-wrap items-center">
                <li>
                  <MenuDropdown setLoggedIn={setLoggedIn} />
                </li>
              </ul>
            </nav>

          </> : <>
            {/* Desktop Log in navigation */}
            <nav className="hidden md:flex md:grow">

              {/* Desktop sign in links */}
              <ul className="flex grow justify-end flex-wrap items-center">
                <li>
                  <Link to="/signup" className="font-medium text-gray-800 hover:text-gray-300 px-4 py-3 flex items-center transition duration-150 ease-in-out">Utwórz konto</Link>
                </li>
                <li>
                  <Link to="/signin" className="btn-sm text-white bg-purple-600 hover:bg-purple-700 ml-3">Zaloguj się</Link>
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
                    <button onClick={logout} className="text-purple-600 hover:text-gray-200 transition duration-150 ease-in-out">Wyloguj się</button>
                  </li>
                </ul>
              </nav>
            </> : <>
              {/*Mobile Log In navigation */}
              <nav id="mobile-nav" ref={mobileNav} className="absolute top-full z-20 left-0 w-full px-4 sm:px-6 overflow-hidden transition-all duration-300 ease-in-out" style={mobileNavOpen ? { maxHeight: mobileNav.current.scrollHeight, opacity: 1 } : { maxHeight: 0, opacity: .8 }}>
                <ul className="bg-gray-800 px-4 py-2">
                  <li>
                    <Link to="/signin" className="font-medium w-full inline-flex items-center justify-center border border-transparent px-4 py-2 my-2 rounded-sm text-white bg-gray-500 hover:bg-gray-600 transition duration-150 ease-in-out">Zaloguj się</Link>
                  </li>
                  <li>
                    <Link to="/signup" className="flex font-medium w-full text-gray-400 hover:text-gray-200 py-2 justify-center">Utwórz konto</Link>
                  </li>
                </ul>
              </nav>
            </>}
          </div>

        </div>
      </div>
    </header>
  );
}

export default Header;
