import React, { useState, useEffect } from 'react';

import { Dialog } from 'primereact/dialog'

import { useFetch } from '../server/common/apiCalls'

function Teachers() {

  const [teachersDialogVisible, setTeachersDialogVisible] = useState()
  const [subject, setSubject] = useState()
  const [teachers] = useFetch('/api/teachers', undefined, [subject])
  const [allActiveTeachers] = useFetch('/api/allActiveTeachers')

  useEffect(() => {
    setSubject(localStorage.getItem('subject'))
  })


  return (
    <> Korepetytorzy Online{subject?<> ({subject}):</>:<>:</>}
      <div className="flex -space-x-4 rtl:space-x-reverse">
        {subject ?
          <>
            <img className="w-10 h-10 border-2 border-white rounded-full dark:border-gray-800" src="/uploadedFiles/d4b0d0b1-ff59-11ee-a0f9-3822e21b4a70/cropped.jpg" alt="" />
            <img className="w-10 h-10 border-2 border-white rounded-full dark:border-gray-800" src="/uploadedFiles/d4b0d0b1-ff59-11ee-a0f9-3822e21b4a70/IMG_20240422_134709.jpg" alt="" />
            <img className="w-10 h-10 border-2 border-white rounded-full dark:border-gray-800" src="/uploadedFiles/d4b0d0b1-ff59-11ee-a0f9-3822e21b4a70/zdjecie4.png" alt="" />
            <img className="w-10 h-10 border-2 border-white rounded-full dark:border-gray-800" src="/uploadedFiles/d4b0d0b1-ff59-11ee-a0f9-3822e21b4a70/cropped.jpg" alt="" />
            <img className="w-10 h-10 border-2 border-white rounded-full dark:border-gray-800" src="/uploadedFiles/d4b0d0b1-ff59-11ee-a0f9-3822e21b4a70/IMG_20240422_134709.jpg" alt="" />
            {teachers.filter((teacher) => teacher.Subject == subject).map((teacher) => <img key={teacher.ProfileImage} className="w-10 h-10 border-2 border-white rounded-full dark:border-gray-800" src={teacher.ProfileImage} alt="" />)}
            <button onClick={() => { setTeachersDialogVisible(true) }} className="flex items-center justify-center w-10 h-10 text-xs font-medium text-white bg-gray-700 border-2 border-white rounded-full hover:bg-gray-600 dark:border-gray-800">+{teachers.filter((teacher) => teacher.Subject == subject).length}</button>
          </>
          :
          <>
            {allActiveTeachers.map((teacher) => <img key={teacher.ProfileImage} className="w-10 h-10 border-2 border-white rounded-full dark:border-gray-800" src={teacher.ProfileImage?teacher.ProfileImage:'/profileImages/profileAlt.png'} alt="" />)}
            <button onClick={() => { setTeachersDialogVisible(true) }} className="flex items-center justify-center w-10 h-10 text-xs font-medium text-white bg-gray-700 border-2 border-white rounded-full hover:bg-gray-600 dark:border-gray-800">+{allActiveTeachers.length}</button>
          </>}
        <Dialog header="Korepetytorzy" visible={teachersDialogVisible} style={{ width: '50vw' }} onHide={() => setTeachersDialogVisible(false)}>
          Test
        </Dialog >
      </div>
    </>
  );
}

export default Teachers;
