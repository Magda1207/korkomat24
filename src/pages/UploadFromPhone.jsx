import { useRef, useState, useEffect } from 'react';

import { useFetch } from '../server/common/apiCalls'
import { useSearchParams } from 'react-router-dom';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import LoadingSpinner from '../partials/LoadingSpinner';
const UploadFromPhone = ({ socket }) => {

  const toast = useRef();
  const [uploadUrl, setUploadUrl] = useState()
  const [socketConnected, setSocketConnected] = useState(socket.connected)
  const [searchParams, setSearchParams] = useSearchParams();
  const code = searchParams.get("code")
  const [refreshRoom, setRefreshRoom] = useState(1)
  const [imagesDirectoryFromDb, loading] = useFetch('/api/imagesDirectoryByCode', { code: code }, [refreshRoom, code]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnyoneElseHere, setIsAnyoneElseHere] = useState(false);

  const apiBaseUrl = import.meta.env.VITE_AXIOS_BASE_URL;
  const uploadBaseUrl = apiBaseUrl ? apiBaseUrl + '/api/uploadMobile' : '/api/uploadMobile'

  useEffect(() => {
    if (!socketConnected) {
      socket.connect()
      setSocketConnected(true)
    }
  })


  socket.on('is_anyone_here_response', (data) => {
    console.log("is_anyone_here_response received:", data.response);
    setIsAnyoneElseHere(data.response);
  });

  useEffect(() => {
    if (imagesDirectoryFromDb) {
      localStorage.setItem('room', imagesDirectoryFromDb.id)
      setUploadUrl(uploadBaseUrl + "?room=" + imagesDirectoryFromDb.id)
      socket.emit('is_anyone_here', { room: imagesDirectoryFromDb.id })
    }
    else {
      toast.current.show({ severity: 'error', summary: 'Błąd', detail: 'Brak dostępu do pokoju' });
    }

  }, [imagesDirectoryFromDb])

  const onUpload = () => {
    setIsLoading(false);
    socket.emit('photoUploaded', { room: imagesDirectoryFromDb.id, isTeacherDir: imagesDirectoryFromDb?.teacherDir });
    if (imagesDirectoryFromDb) toast.current.show({ severity: 'info', detail: 'Dodawanie plików zakończone sukcesem' });
  };

  const onBeforeUpload = () => {
    setRefreshRoom(prev => prev + 1);
    if (imagesDirectoryFromDb && !imagesDirectoryFromDb.teacherDir) {
      console.log("Checking if anyone else is here in room:", imagesDirectoryFromDb.id);
      socket.emit('is_anyone_here', { room: imagesDirectoryFromDb.id });
    }
    setIsLoading(true);
  };

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        setRefreshRoom(prev => prev + 1);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);
  // Note: To test locally on mobile, remove the isAnyoneElseHere check below (socket is not working locally)
  // or test on browser 
  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Toast ref={toast}></Toast>
      <div className='h-screen flex items-center justify-center'>
        {loading || isLoading ? (
          <LoadingSpinner />
        ) : imagesDirectoryFromDb?.id && (imagesDirectoryFromDb.teacherDir || isAnyoneElseHere) ? (
          <FileUpload mode="basic" chooseLabel="Dodaj obraz(y)" auto name="images" url={uploadUrl} accept="image/*" multiple maxFileSize={10000000} onUpload={onUpload} onBeforeUpload={onBeforeUpload} />
        ) : (!loading && !imagesDirectoryFromDb) ? (
          <p>Brak dostępu do pokoju</p>
        ) : null}
      </div>
    </div>
  );
}

export default UploadFromPhone;