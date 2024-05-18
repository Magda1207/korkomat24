import React from 'react';
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';

import Header from '../partials/Header';
import PageIllustration from '../partials/PageIllustration';
import Banner from '../partials/Banner';

import axios from 'axios';

function SignUp() {

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault()
    await axios.post('/api/signup', { email, username, phoneNumber, password })
      .then(() => {
        localStorage.setItem('email', email)
        localStorage.setItem('username', username)
        navigate('/', { replace: true });
      })
      .catch(e => {
        if (e.response.status == 401) {
          //redirect to login
          navigate('/signin', { replace: true });
        }
      })
  }

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">

      {/*  Site header */}
      <Header />

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
                <h1 className="h1">Nowe konto</h1>
              </div>

              {/* Form */}
              <div className="max-w-sm mx-auto">
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-wrap -mx-3 mb-4">
                    <div className="w-full px-3">
                      <label className="block text-gray-300 text-sm font-medium mb-1" htmlFor="email">Email <span className="text-red-600">*</span></label>
                      <input id="email" type="email" placeholder='email@domena.com' className="form-input w-full text-gray-900" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 mb-4">
                    <div className="w-full px-3">
                      <label className="block text-gray-300 text-sm font-medium mb-1" htmlFor="password">Hasło <span className="text-red-600">*</span></label>
                      <input id="password" type="password" placeholder='********' className="form-input w-full text-gray-900" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 mb-4">
                    <div className="w-full px-3">
                      <label className="block text-gray-300 text-sm font-medium mb-1" htmlFor="full-name">Imie <span className="text-red-600">*</span></label>
                      <input id="full-name" type="text" placeholder='Imie' className="form-input w-full text-gray-900" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-3 mb-4">
                    <div className="w-full px-3">
                      <label className="block text-gray-300 text-sm font-medium mb-1" htmlFor="company-name">Numer telefonu <span className="text-red-600">*</span></label>
                      <input id="phone-number" placeholder='000-000-000' type="number"className="form-input w-full text-gray-900" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                    </div>
                  </div>
                  {// Terms and Conditions / Privacy Policy
                  //<div className="text-sm text-gray-500 text-center">
                   // I agree to be contacted by Open PRO about this offer as per the Open PRO <Link to="#" className="underline text-gray-400 hover:text-gray-200 hover:no-underline transition duration-150 ease-in-out">Privacy Policy</Link>.
                  //</div>
                  }
                  <div className="flex flex-wrap -mx-3 mt-6">
                    <div className="w-full px-3">
                      <button className="btn text-white bg-purple-600 hover:bg-purple-700 w-full">Utwórz konto</button>
                    </div>
                  </div>
                </form>
                <div className="text-gray-400 text-center mt-6">
                  Masz już konto? <Link to="/signin" className="text-purple-600 hover:text-gray-200 transition duration-150 ease-in-out">Zaloguj się</Link>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

export default SignUp;