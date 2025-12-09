import { React, useEffect, useState } from 'react';
import { restrictNonNumeric } from '../partials/functions/helpers'

import { useFetch } from '../server/common/apiCalls'

const Filters = ({ getSubject, getLevel, getRate, getActive, getPriceFrom, getPriceTo, getTeachername }) => {

  const [subjects] = useFetch('/api/subjects')
  const [subject, setSubject] = useState()
  const [level, setLevel] = useState()
  const [rate, setRate] = useState()
  const [teacherName, setTeacherName] = useState('')
  const [priceFrom, setPriceFrom] = useState('')
  const [priceTo, setPriceTo] = useState('')
  const [checked, setChecked] = useState(0)

  useEffect(() => {
    setSubject(document.getElementById('subject').value)
    setLevel(document.getElementById('level').value)
  })
  useEffect(() => {
    if (subject === "") getSubject(null)
    else getSubject(subject)
  }, [subject])

  useEffect(() => {
    if (level === "") getLevel(null)
    else getLevel(level)
  }, [level])

  useEffect(() => {
    if (rate === "") getRate(null)
    else getRate(rate)
  }, [rate])

  useEffect(() => {
    getActive(checked)
  }, [checked])

  useEffect(() => {
    getTeachername(teacherName)
  }, [teacherName])

  useEffect(() => {
    if (priceFrom === "") getPriceFrom(null)
    else getPriceFrom(priceFrom)
  }, [priceFrom])

  useEffect(() => {
    if (priceTo === "") getPriceTo(null)
    else getPriceTo(priceTo)
  }, [priceTo])

  return (

    <div className="space-y-12">
      <div className="pb-4 text-left">
        <div className="col-span-2 grid grid-cols-1 sm:grid-cols-6 lg:grid-cols-12 gap-x-6 gap-y-8">
          <div className="sm:col-span-2 sm:col-start-1">
            <label htmlFor="subject" className="block text-sm font-medium leading-6 text-gray-900">Przedmiot:</label>
            <div className="mt-2">
              <select id="subject" name="subject" autoComplete="subject-name" value={subject} onChange={(e) => setSubject(e.target.value)} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6">
                <option value="">Dowolny</option>
                {subjects.map((x) => <option key={x.subject}>{x.subject}</option>)}
              </select>
            </div>
          </div>

          <div className="col-span-2">
            <label htmlFor="level" className="block text-sm font-medium leading-6 text-gray-900">Szkoła:</label>
            <div className="mt-2">
              <select id="level" name="level" value={level} onChange={(e) => setLevel(e.target.value)} autoComplete="level-name" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6">
                <option value="">Dowolna</option>
                <option key={1}>Szkoła podstawowa</option>
                <option key={2}>Szkoła średnia</option>
                <option key={4}>Matura - poziom podstawowy</option>
                <option key={5}>Matura - poziom rozszerzony</option>
                <option key={3}>Studia</option>
              </select>
            </div>
          </div>

          <div className="col-span-1">
            <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">Cena od: </label>
            <div className="mt-2">
              <input autoComplete="off" min="1" max="999" type="search" name="name" id="name" placeholder="PLN" value={priceFrom} onKeyDown={restrictNonNumeric} onChange={(e) => setPriceFrom(e.target.value)} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
            </div>
          </div>

          <div className="col-span-1">
            <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">Cena do: </label>
            <div className="mt-2">
              <input autoComplete="off" min="1" max="999" type="search"  name="name" id="name" placeholder="PLN" value={priceTo} onKeyDown={restrictNonNumeric} onChange={(e) => setPriceTo(e.target.value)} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
            </div>
          </div>

          <div className="col-span-2">
            <label htmlFor="rate" className="block text-sm font-medium leading-6 text-gray-900">Ocena:</label>
            <div className="mt-2">
              <select id="rate" name="rate" value={rate} onChange={(e) => setRate(e.target.value)} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6">
                <option value={0}>Dowolna</option>
                <option value={3}>Minimum 3</option>
                <option value={4}>Minimum 4</option>
                <option value={5}>Minimum 5</option>
              </select>
            </div>
          </div>

          <div className="col-span-2">
            <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">Imię i nazwisko: </label>
            <div className="mt-2">
              <input type="search" autoComplete="off" name="name" id="name"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)} className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
            </div>
          </div>

          <div className="col-span-2 ">
            <label htmlFor="activeCheckbox" className="block text-sm font-medium leading-6 text-gray-900">Dostępni teraz: </label>
            <div className="mt-2 ml-7 flex justify-start" onClick={() => setChecked(Number(!checked))}>
              <input type="checkbox" value="" id="activeCheckbox" className="sr-only peer" checked={checked} readOnly />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}

export default Filters;