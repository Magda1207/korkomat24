import { useState, useEffect } from 'react';

import { useFetch } from '../server/common/apiCalls'

function TeacherAvatar() {

  const [teachersDialogVisible, setTeachersDialogVisible] = useState()
  const [subject, setSubject] = useState()
  const [teachers] = useFetch('/api/teachers?subject='+subject, undefined, [subject])
  const [allActiveTeachers] = useFetch('/api/teachers')

  useEffect(() => {
    setSubject(localStorage.getItem('subject'))
  })


  return (
    <> Korepetytorzy Online{subject?<> ({subject}):</>:<>:</>}
      <div className="flex -space-x-4 rtl:space-x-reverse">
        {subject ?
          <>
            {teachers.map((teacher) => <img key={teacher.ProfileImage} className="w-10 h-10 border-2 border-white rounded-full dark:border-gray-800" src={teacher.ProfileImage} alt="" />)}
            <button onClick={() => { setTeachersDialogVisible(true) }} className="flex items-center justify-center w-10 h-10 text-xs font-medium text-white bg-gray-700 border-2 border-white rounded-full hover:bg-gray-600 dark:border-gray-800">+{teachers.filter((teacher) => teacher.Subject == subject).length}</button>
          </>
          :
          <>
            {allActiveTeachers.map((teacher) => <img key={teacher.ProfileImage} className="w-10 h-10 border-2 border-white rounded-full dark:border-gray-800" src={teacher.ProfileImage?teacher.ProfileImage:'/public/profileImages/profileAlt.png'} alt="" />)}
            <button onClick={() => { setTeachersDialogVisible(true) }} className="flex items-center justify-center w-10 h-10 text-xs font-medium text-white bg-gray-700 border-2 border-white rounded-full hover:bg-gray-600 dark:border-gray-800">+{allActiveTeachers.length}</button>
          </>}
        {/* <Dialog header="Korepetytorzy" resizable={false} visible={teachersDialogVisible} style={{ width: '50vw' }} onHide={() => setTeachersDialogVisible(false)}>
          Test
        </Dialog > */}
      </div>
    </>
  );
}

export default TeacherAvatar;
