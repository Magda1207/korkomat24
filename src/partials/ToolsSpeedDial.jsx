
import React, { useRef, useState, useEffect } from 'react';

import Gallery from '../partials/Gallery';

import { SpeedDial } from 'primereact/speeddial';
import { Dialog } from 'primereact/dialog'
import { FileUpload } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Message } from 'primereact/message';


import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.css';


const ToolsSpeedDial = ({ getSelectedFunction, getImage, resetTools }) => {

  const [functionType, setFunctionType] = useState();
  const [galleryDialogVisible, setGalleryDialogVisible] = useState();
  const [imageUploaded, setImageUploaded] = useState(false)
  const [addFromPhoneDialogVisible, setAddFromPhoneDialogVisible] = useState();
  const [accessCode, setAccessCode] = useState();
  const toast = useRef();

  useEffect(() => {
    setFunctionType('pencil')
  }, [resetTools])

  useEffect(() => {
    getSelectedFunction(functionType)
  }, [functionType])

  useEffect(() => {
    setImageUploaded(false)
    setAccessCode(localStorage.getItem('accessCode'))
  })

  const items = [
    {
      label: 'Rysowanie',
      icon: 'pi pi-pencil',
      command: () => {
        setFunctionType('pencil')
      }
    },
    {
      label: 'Gumka',
      icon: 'pi pi-eraser',
      command: () => {
        setFunctionType('eraser')
      }
    },
    {
      label: 'Wstaw zdjęcie',
      icon: 'pi pi-images',
      command: () => {
        setFunctionType('image')
        setGalleryDialogVisible(true)
      }
    },
    {
      label: 'Linia prosta',
      icon: 'pi pi-minus',
      command: () => {
        setFunctionType('line')
      }
    },
    {
      label: 'Kółko',
      icon: 'pi pi-circle',
      command: () => {
        setFunctionType('circle')
      }
    }
    //{
    //  label: 'Czat',
    //  icon: 'pi pi-whatsapp',
    //  command: () => {
        //setFunctionType('line')
   //   }
   // }
  ];

  const onUpload = () => {
    toast.current.show({ severity: 'info', summary: 'Success', detail: 'Plik został dodany' });
    setImageUploaded(true)
  };


  const galleryFooterContent = (
    <div className='flex justify-center'>
      <Toast ref={toast}></Toast>
      <FileUpload className='m-5' mode="basic" chooseLabel="Dodaj zdjęcie z komputera" auto name="images" url="/api/upload" accept="image/*" multiple maxFileSize={10000000} onUpload={onUpload} />
      <Button className='m-5' icon='pi pi-mobile' label="Dodaj zdjęcie z telefonu" onClick={() => setAddFromPhoneDialogVisible(true)} />
    </div>
  )

  const uploadFromPhoneContent = (
    <p>Aby dodać zdjęcie z telefonu wejdź na przeglądarce telefonu na: <a href='/up'>korkomat.pl/up</a> <br />Kod dostępu: {accessCode}</p>
  )


  return (
    <>
      <div className="w-full h-full max-w-full max-h-full box-border">
        <div className="absolute bottom-0 left-0 m-7">
          <SpeedDial model={items} radius={120} type="quarter-circle" direction="up-right" buttonClassName="bg-violet-900 border-0" className="speeddial-bottom-left left-0 bottom-0  z-50" />
        </div>
      </div>
      <Dialog header="Moje Obrazy" pt={{ footer: { className: 'p-0 shadow-[0_-2px_15px_-7px_rgba(0,0,0,0.3)]' } }} footer={galleryFooterContent} visible={galleryDialogVisible} style={{ width: '50vw' }} onHide={() => setGalleryDialogVisible(false)}>
        <Gallery imageUploaded={imageUploaded} getImage={getImage} setGalleryDialogVisible={setGalleryDialogVisible}/>
      </Dialog >
      <Dialog header="Dodaj zdjęcie z telefonu" visible={addFromPhoneDialogVisible} style={{ width: '50vw' }} onHide={() => setAddFromPhoneDialogVisible(false)}>
        <Message severity="info" content={uploadFromPhoneContent} />
      </Dialog >
    </>
  )
}

export default ToolsSpeedDial