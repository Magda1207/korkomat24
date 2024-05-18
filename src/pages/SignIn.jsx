import { React, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Header from '../partials/Header';
import PageIllustration from '../partials/PageIllustration';

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
    await axios.post('/api/token', { email, password })
      .then(() => {
        setLoginSuccessfull(true)
      })
      .catch(e => {
        console.log(e)
        if (e.response.status == 401) {
          setValidationMessage(e.response.data.description)
        }
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
          console.log(error)
        }
      }
      )()
    }
  }, [loginSuccessfull])

  // Save the info in local storage and navigate to previous url
  useEffect(() => {
    if (userInfo) {
      localStorage.setItem('username', userInfo.username)
      localStorage.setItem('room', userInfo.room)
      localStorage.setItem('accessCode', userInfo.accessCode)
      navigate(prevUrl, { replace: true });
    }
  }, [userInfo]);

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">

      {/*  Site header */}
      <Header loggedIn={loggedIn} setLoggedIn={setLoggedIn} />

      {/*  Page content */}
      <main className="grow">

        {/*  Page illustration */}
        <div className="relative max-w-6xl mx-auto h-0 pointer-events-none" aria-hidden="true">
          <PageIllustration />
        </div>

        <section className="relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="pt-32 pb-12 md:pt-40 md:pb-20">

              {/* Page header */}
              <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
                <h1 className="h1">Logowanie</h1>
              </div>

              {/* Form */}
              <div className="max-w-sm mx-auto">
                {/* Sign In with Google Form 
                <form>
                  <div className="flex flex-wrap -mx-3">
                    <div className="w-full px-3">
                      <button className="btn px-0 text-white bg-red-600 hover:bg-red-700 w-full relative flex items-center">
                        <svg className="w-4 h-4 fill-current text-white opacity-75 shrink-0 mx-4" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7.9 7v2.4H12c-.2 1-1.2 3-4 3-2.4 0-4.3-2-4.3-4.4 0-2.4 2-4.4 4.3-4.4 1.4 0 2.3.6 2.8 1.1l1.9-1.8C11.5 1.7 9.9 1 8 1 4.1 1 1 4.1 1 8s3.1 7 7 7c4 0 6.7-2.8 6.7-6.8 0-.5 0-.8-.1-1.2H7.9z" />
                        </svg>
                        <span className="h-6 flex items-center border-r border-white border-opacity-25 mr-4" aria-hidden="true"></span>
                        <span className="flex-auto pl-16 pr-8 -ml-16">Sign in with Google</span>
                      </button>
                    </div>
                  </div>
                </form>
                
                <div className="flex items-center my-6">
                  <div className="border-t border-gray-700 border-dotted grow mr-3" aria-hidden="true"></div>
                  <div className="text-gray-400">Or, sign in with your email</div>
                  <div className="border-t border-gray-700 border-dotted grow ml-3" aria-hidden="true"></div>
                </div>
                */}
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-wrap -mx-3 mb-4">
                    <div className="w-full px-3">
                      <label className="block text-gray-300 text-sm font-medium mb-1" htmlFor="email">Email</label>
                      <input id="email" type="email" className="form-input w-full text-gray-900" placeholder="email@domena.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 mb-4">
                    <div className="w-full px-3">
                      <label className="block text-gray-300 text-sm font-medium mb-1" htmlFor="password">Hasło</label>
                      <input id="password" type="password" className="form-input w-full text-gray-900" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" required />
                      <span className="flex items-center font-medium tracking-wide text-red-500 text-xs mt-1 ml-1">{validationMessage}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 mb-4">
                    <div className="w-full px-3">
                      <div className="flex justify-between">
                        {//<Link to="/reset-password" className="text-purple-600 hover:text-gray-200 transition duration-150 ease-in-out">Forgot Password?</Link>
                        }
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 mt-6">
                    <div className="w-full px-3">
                      <button type="submit" className="btn text-white bg-purple-600 hover:bg-purple-700 w-full">Zaloguj</button>
                    </div>
                  </div>
                </form>
                <div className="text-gray-400 text-center mt-6">
                  Nie masz konta? <Link to="/signup" className="text-purple-600 hover:text-gray-200 transition duration-150 ease-in-out">Zarejestruj się</Link>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

export default SignIn;