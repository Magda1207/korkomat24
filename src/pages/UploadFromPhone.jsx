import { React, useRef, useState, useEffect } from 'react';

import Header from '../partials/Header';
import { useFetch } from '../server/common/apiCalls'

import { FileUpload } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { FloatLabel } from "primereact/floatlabel";

const UploadFromPhone = ({ loggedIn, setLoggedIn }) => {

  const toast = useRef();
  const [room, setRoom] = useState()
  const [code, setCode] = useState('')
  const [codeEntered, setCodeEntered] = useState(false)
  const [roomFromDb, fetchError] = useFetch('/api/roomByCode', {code: code}, [codeEntered])
  const [uploadUrl, setUploadUrl] = useState()

  useEffect(() => {
    setCodeEntered(false)
    setRoom(localStorage.getItem('room'))
  })

  useEffect(() => {
    localStorage.setItem('room', roomFromDb)
    setRoom(roomFromDb)
    setUploadUrl("/api/uploadMobile?room="+roomFromDb)
  }, [roomFromDb])

  useEffect(() => {
    if(code.length == 5) {
      setCodeEntered(true)
    }
  }, [code])

  const onUpload = () => {
    toast.current.show({ severity: 'info', summary: 'Sukces!', detail: 'Plik został dodany do galerii' });
  };
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">

      {/*  Site header */}
      <Header loggedIn={loggedIn} setLoggedIn={setLoggedIn} />

      <Toast ref={toast}></Toast>
      <div className='h-screen flex items-center justify-center'>
        {room ?
          <FileUpload mode="basic" chooseLabel="Dodaj zdjęcie z telefonu" auto name="images" url={uploadUrl} accept="image/*" multiple maxFileSize={10000000} onUpload={onUpload} />
          : <FloatLabel>
            <label htmlFor="accessCode">Kod dostępu</label>
            <InputText id="accessCode" value={code} onChange={(e) => setCode(e.target.value)} /></FloatLabel>}
      </div>
    </div>
  );
}

export default UploadFromPhone;