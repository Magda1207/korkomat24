import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../partials/Footer';
import Header from '../partials/Header';
import HeaderImage from '../partials/HeaderImage';

import axios from 'axios'

function SignIn({ prevUrl, loggedIn, setLoggedIn }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [validationMessage, setValidationMessage] = useState('')
  const [userInfo, setUserInfo] = useState();
  const [loginSuccessfull, setLoginSuccessfull] = useState()


  // Log in 
  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationMessage("")
    await axios.post('/api/token', { email, password }, { withCredentials: true })
      .then((res) => {
        if (res instanceof Error && res.response.status == 401) setValidationMessage(res.response.data.description)
        //else if (e.response) setLoginSuccessfull(false)
        else setLoginSuccessfull(true)
      })
  }

  // Get user information after logging in
  useEffect(() => {
    if (loginSuccessfull) {
      (async () => {
        try {
          const result = await axios.get('/api/user/info')
          setUserInfo(result.data)
        }
        catch (error) {
          //handle error
        }
      }
      )()
    }
  }, [loginSuccessfull])

  // Save the info in local storage and navigate to previous url
  useEffect(() => {
    if (userInfo) {
      localStorage.setItem('firstName', userInfo.firstName)
      localStorage.setItem('lastName', userInfo.lastName)
      if (userInfo.room) localStorage.setItem('room', userInfo.room)
      if (userInfo.accessCode) localStorage.setItem('accessCode', userInfo.accessCode)
      localStorage.setItem('email', userInfo.email)
      localStorage.setItem('phone', userInfo.phoneNumber)
      localStorage.setItem('isTeacher', userInfo.isTeacher)
      localStorage.setItem('userId', userInfo.id)
      navigate(prevUrl, { replace: true });
    }
  }, [userInfo]);

  return (
    <div className="flex flex-col min-h-screen overflow-hidden relative">
      <HeaderImage />

      {/*  Site header */}
      <Header loggedIn={loggedIn} setLoggedIn={setLoggedIn} lightMode={true}/>

      {/*  Page content */}
      <main className="flex flex-col grow relative z-10">
        <section className="relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {/* Cały tekst poniżej obrazka */}
            <div className="pt-8 md:pt-12">
              <div className="max-w-md mx-auto -mt-28 md:-mt-32 relative z-50">
                {/* more prominent framed card */}
                <div className="bg-white/95 dark:bg-gray-900/75 border border-emerald-100 dark:border-emerald-800 rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
                  <div className="mb-6 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Logowanie</h2>
                  </div>
                  <form onSubmit={handleSubmit}>
                    <div className="flex flex-wrap -mx-3 mb-4">
                      <div className="w-full px-3">
                        <label className="block text-gray-500 text-sm font-medium mb-2" htmlFor="email">E-mail</label>
                        <input
                          id="email"
                          type="email"
                          className="w-full text-gray-900 border border-gray-200 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 transition"
                          placeholder="email@domena.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          onInvalid={e => e.target.setCustomValidity('Podaj adres e-mail')}
                          onInput={e => e.target.setCustomValidity('')}
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap -mx-3 mb-4">
                      <div className="w-full px-3">
                        <label className="block text-gray-500 text-sm font-medium mb-2" htmlFor="password">Hasło</label>
                        <input
                          id="password"
                          type="password"
                          className="w-full text-gray-900 border border-gray-200 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 transition"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="********"
                          required
                          onInvalid={e => e.target.setCustomValidity('Podaj hasło')}
                          onInput={e => e.target.setCustomValidity('')}
                        />
                        <span className="flex items-center font-medium tracking-wide text-red-500 text-xs mt-2 ml-1">{validationMessage}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap -mx-3 mb-4">
                      <div className="w-full px-3">
                        <div className="flex justify-between items-center">
                          {/* miejsce na linki dodatkowe */}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap -mx-3 mt-6">
                      <div className="w-full px-3">
                        <button
                          type="submit"
                          className="w-full text-white bg-emerald-500 hover:bg-emerald-600 py-3 text-lg rounded-md shadow-lg transition disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed"
                          disabled={!email || !password}
                        >
                          Zaloguj
                        </button>
                      </div>
                    </div>
                  </form>
                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
                    <p className="text-gray-600 dark:text-gray-300">Nie masz konta? <Link to="/signup" className="text-emerald-800 dark:text-emerald-300 hover:text-emerald-500 transition">Zarejestruj się</Link></p>
                  </div>
                </div>
               </div>
             </div>
           </div>
         </section>
       </main>
       <Footer />
     </div>
   );
 }

 export default SignIn;