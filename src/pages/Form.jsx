import { React, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../partials/Header';
import PageIllustration from '../partials/PageIllustration';
import { useFetch } from '../server/common/apiCalls'

import axios from 'axios'

const Form = ({ loggedIn, setLoggedIn, socket }) => {

  const navigate = useNavigate();
  const [subjects, fetchError] = useFetch('/api/subjects')
  const [subject, setSubject] = useState('')
  const [grade, setGrade] = useState('')
  const [section, setSection] = useState('')
  const [validationMessage, setValidationMessage] = useState()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationMessage("")
    await axios.patch('/api/roomSettings', { subject, grade, section })
      .then(() => {
        localStorage.setItem('subject', subject)
        localStorage.setItem('grade', grade)
        navigate('/room', { replace: true });
      })
      .catch(e => {
        console.log(e)
        if (e.response.status == 400) {
          setValidationMessage(e.response.data.description)
        }
      })
    
  }

  useEffect(() => {
    socket.connect();
    setSubject(document.getElementById('subject').value)
    setGrade(document.getElementById('grade').value)
  })

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">

      {/*  Site header */}
      <Header loggedIn={loggedIn} setLoggedIn={setLoggedIn}/>

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
                <h1 className="h1">Czego chcesz się uczyć?</h1>
              </div>

              {/* htmlForm */}

              <form onSubmit={handleSubmit}>
                <div className="space-y-12">
                  <div className="border-b border-gray-900/10 pb-12">
                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                      <div className="sm:col-span-2 sm:col-start-1">
                        <label htmlFor="subject" className="block text-sm font-medium leading-6 text-gray-900">Przedmiot</label>
                        <div className="mt-2">
                          <select id="subject" name="subject" autoComplete="subject-name" value={subject} onChange={(e) => setSubject(e.target.value)} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6">
                            {subjects.map((x) => <option key={x.subject}>{x.subject}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="grade" className="block text-sm font-medium leading-6 text-gray-900">Klasa</label>
                        <div className="mt-2">
                          <select id="grade" name="grade" value={grade} onChange={(e) => setGrade(e.target.value)} autoComplete="grade-name" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6">
                            <option>1 liceum</option>
                            <option>2 liceum</option>
                            <option>3 liceum</option>
                            <option>4 liceum</option>
                            <option>1 technikum</option>
                            <option>2 technikum</option>
                            <option>3 technikum</option>
                            <option>4 technikum</option>
                            <option>5 technikum</option>
                            <option>1 szkoła podstawowa</option>
                            <option>2 szkoła podstawowa</option>
                            <option>3 szkoła podstawowa</option>
                            <option>4 szkoła podstawowa</option>
                            <option>5 szkoła podstawowa</option>
                            <option>6 szkoła podstawowa</option>
                            <option>7 szkoła podstawowa</option>
                            <option>8 szkoła podstawowa</option>
                          </select>
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="section" className="block text-sm font-medium leading-6 text-gray-900">Dział (opcjonalnie)</label>
                        <div className="mt-2">
                          <input type="text" name="section" id="section" value={section} onChange={(e) => setSection(e.target.value)} autoComplete="section-name" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-x-6">
                  <button type="button" className="text-sm font-semibold leading-6 text-gray-900">Anuluj</button>
                  <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Wejdź do sali</button>
                </div>
              </form>
              {/* htmlForm */}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Form;