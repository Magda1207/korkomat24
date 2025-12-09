import { useState, useEffect, useRef } from 'react';
import { Galleria } from 'primereact/galleria';
import { useFetch } from '../server/common/apiCalls'
import { FileUpload } from 'primereact/fileupload';
import { Dialog } from 'primereact/dialog'
import { Message } from 'primereact/message';
import { Toast } from 'primereact/toast';
import { QRCodeCanvas } from 'qrcode.react';
import LoadingSpinner from './LoadingSpinner';
import icons from './icons';

import axios from 'axios'

const Gallery = ({ socket, getImageSrc, showGalleryInfo, setShowGalleryInfo }) => {
    const [activeIndex, setActiveIndex] = useState(0)
    const [isLoading, setIsLoading] = useState(false);
    const galleria = useRef(null)
    const [imageUploadedBySocket, setImageUploadedBySocket] = useState(0)
    const [imageUploadedLocally, setImageUploadedLocally] = useState(0)
    const [images, fetchError] = useFetch('/api/images', undefined, [imageUploadedBySocket, imageUploadedLocally])
    const [accessCode, setAccessCode] = useState();
    const [room, setRoom] = useState();
    const [addFromPhoneDialogVisible, setAddFromPhoneDialogVisible] = useState();
    const [toastMessage, setToastMessage] = useState()
    const toast = useRef();
    const fileUploadButtonRef = useRef(null)
    //const uploadFromDeviceBaseUrl = process.env.NODE_ENV === 'production' ? "https://magda1207.smallhost.pl" : "https://192.168.0.166:5173"
    const uploadFromDeviceBaseUrl = import.meta.env.VITE_BASE_URL
    const uploadFromDeviceUrl = uploadFromDeviceBaseUrl + "/#/up?code=" + accessCode

    //const apiBaseUrl = process.env.NODE_ENV === 'production' ? "https://api.magda1207.smallhost.pl" : undefined
    const apiBaseUrl = import.meta.env.VITE_AXIOS_BASE_URL;
    const uploadUrl = apiBaseUrl ? apiBaseUrl + 'api/upload' : 'api/upload'

    const onUpload = (e) => {
        setImageUploadedLocally(prev => prev + 1);
        setIsLoading(false);
    };

    const onBeforeUpload = (e) => {
        setIsLoading(true);
    };
    socket.on('photoUploaded', () => {
        console.log('photoUploaded event received')
        setImageUploadedBySocket(prev => prev + 1)
    })

    useEffect(() => {
        if (toastMessage) {
            toast.current.show({ severity: 'error', summary: 'Wystąpił błąd', detail: toastMessage });
            setToastMessage()
        }
    }, [toastMessage]);


    // const items = [
    //     {
    //         label: 'Z tego urządzenia',
    //         icon: 'pi pi-desktop',
    //         command: () => {
    //             addFile()
    //         }
    //     },
    //     {
    //         label: 'Z innego urządzenia',
    //         icon: 'pi pi-mobile',
    //         command: () => {
    //             setAddFromPhoneDialogVisible(true)
    //         }
    //     }
    // ];

    const addFile = () => {
        fileUploadButtonRef.current?.getInput().click()
    };

    useEffect(() => {
        setAccessCode(localStorage.getItem('accessCode'))
        setRoom(localStorage.getItem('room'))
    }, [])

    useEffect(() => {
        socket.emit('photoUploaded', { room: room });
    }, [imageUploadedLocally])

    const itemTemplate = (item) => {
        return <img src={item.itemImageSrc} style={{ width: '100%', display: 'block' }} />;
    }

    const thumbnailTemplate = (item) => {
        return <img src={item.itemImageSrc} style={{ display: 'block' }} />;
    }

    const deleteImage = async (e) => {
        const filename = e.target.id
        await axios.delete('/api/image?filename=' + filename)
            .then(() => {
                setImageUploadedLocally(prev => prev + 1)
            })
    }

    // const pasteImage = (e) => {
    //     getImage(e.target.previousElementSibling.getAttribute('src'))
    // }

    const qrcode = (<QRCodeCanvas
        value={uploadFromDeviceUrl}
        size={128}
        bgColor="#ffffff"
        fgColor="#000000"
        level="H"
    />)

    const uploadFromPhoneContent = (
        <div className='flex flex-col items-center'>
            <div className='my-4 flex justify-center items-center'>
                <div >{qrcode}</div>
            </div>
            <p>Aby dodać zdjęcie z innego urządzenia zeskanuj kod qr lub wejdź na przeglądarce telefonu na:<br />
                <a href={uploadFromDeviceUrl} className='text-blue-600 hover:underline cursor-pointer'> {uploadFromDeviceUrl}</a>
            </p>
        </div>
    )

    const drag = (ev) => {
        ev.dataTransfer.setData("text", ev.target.src);
    }

    const handleUploadErrors = async (e) => {
        // If the error status is 401 
        // it means the token has expired and we need to refresh it
        if (e.xhr.status === 401) {
            const email = localStorage.getItem('email')
            await axios.post('/api/refresh-token', { email });
            setToastMessage("Wystąpił błąd. Spróbuj jeszcze raz lub skontaktuj się z nami")
        }
    }

    const handleValidationFail = (e) => {
        if (e.size > 10000000) setToastMessage("Maksymalna wielkość pliku (10Mb) została przekroczona")
    }

    return (
        <>
            {/* Informacja dla ucznia */}
            {showGalleryInfo && (
                <div className="mx-6 mt-6 mb-2 relative">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-3 rounded pr-10">
                        Dodaj zdjęcia, aby móc z nich korzystać podczas lekcji. <br />
                        <strong>Uwaga!</strong> Galeria jest resetowana po każdej lekcji.
                        <button
                            onClick={() => setShowGalleryInfo(false)}
                            className="absolute top-2 right-2 text-yellow-700 hover:text-yellow-900 rounded-full p-1 transition-colors"
                            aria-label="Zamknij informację"
                            type="button"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 8.586l4.95-4.95a1 1 0 111.414 1.415L11.414 10l4.95 4.95a1 1 0 01-1.414 1.415L10 11.414l-4.95 4.95a1 1 0 01-1.415-1.415L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
            {/* Sekcja przycisków */}
            <div className="sticky top-0 z-20 bg-white px-0 xl:px-0">
                <div className="grid mt-5 grid-cols-1 md:grid-cols-2 gap-6 place-content-center pb-4 px-2 xl:px-32">
                    <button className='bg-white aspect-square m-auto px-10 rounded-md shadow-md' onClick={addFile}>
                        <div className='mb-2 flex justify-center items-center'>{icons.AddPicture}</div>
                        <div>Dodaj obraz</div>
                    </button>
                    <button onClick={() => setAddFromPhoneDialogVisible(true)}>
                        <div className='mb-2 flex justify-center items-center'>
                            <div className="hidden md:inline" >{qrcode}</div>
                        </div>
                        <div className="text-blue-600 text-sm hover:underline cursor-pointer">Dodaj obraz z innego urządzenia</div>
                    </button>
                </div>
                {/* Linia oddzielająca sekcję przycisków od galerii */}
                <div className="relative w-full px-2 xl:px-6">
                    <div className="h-0.5 bg-gray-200 shadow-sm w-full" />
                </div>
            </div>
            {/* Koniec sekcji przycisków */}
            <FileUpload ref={fileUploadButtonRef} onError={handleUploadErrors} onValidationFail={handleValidationFail} contentStyle={{ background: '#DF1717' }} className='hidden' mode="basic" chooseLabel="Dodaj plik" auto name="images" url={uploadUrl} accept="image/*" multiple maxFileSize={10000000} invalidFileSizeMessageSummary="Test" onUpload={onUpload} onBeforeUpload={onBeforeUpload} withCredentials={true} />
            <Dialog header="Dodaj zdjęcie z telefonu"  resizable={false} visible={addFromPhoneDialogVisible} style={{ width: '40vw' }} onHide={() => setAddFromPhoneDialogVisible(false)}>
                <Message severity="info" content={uploadFromPhoneContent} />
            </Dialog >
            <Toast ref={toast}></Toast>
            {/* Sekcja galerii */}
            <div className='max-h-[40vh] overflow-auto gallery-scrollbar'>
                {isLoading && <LoadingSpinner />}
                <Galleria ref={galleria} value={images} numVisible={7} style={{ maxWidth: '850px' }}
                    activeIndex={activeIndex} onItemChange={(e) => setActiveIndex(e.index)}
                    circular fullScreen showItemNavigators showThumbnails={false} item={itemTemplate} thumbnail={thumbnailTemplate} />
                <div className="grid items-start mt-5 grid-cols-3 gap-2">
                    {
                        images && images.map((image, index) => {
                            let filename = image.itemImageSrc.split('/').pop()
                            let imgEl = <img draggable="true" onDragStart={drag} name={filename} src={image.itemImageSrc} onClick={() => getImageSrc(image.itemImageSrc)} className='cursor-grab'
                            //onClick={ // uncomment to display large versions of gallery images
                            //     () => { setActiveIndex(index); galleria.current.show() }
                            // } 
                            />
                            return (
                                <div className='relative' key={index}>
                                    <button
                                        type="button"
                                        onClick={deleteImage}
                                        id={filename}
                                        className="absolute right-2 top-2 z-10 flex items-center justify-center rounded-full bg-white/80 border border-gray-300 shadow hover:bg-red-500 hover:text-white transition-colors focus:outline-none"
                                        title="Usuń zdjęcie"
                                    >
                                        <svg className="w-6 h-6  pointer-events-none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 9-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                    </button>
                                    <div key={filename} className='relative inline-flex border-solid border-2 border-stone-500 w-full aspect-square place-content-center' >
                                        {imgEl}
                                    </div>
                                </div>
                            )
                        })
                    }

                    {
                        3 - images.length % 3 > 0 ? [...Array(3 - images.length % 3)].map((x, i) =>
                            <div className='relative inline-flex border-solid border-2 ' key={i}>
                                <svg className="w-full h-full text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="m3 16 5-7 6 6.5m6.5 2.5L16 13l-4.286 6M14 10h.01M4 19h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z" />
                                </svg>
                            </div>
                        ) : <></>}

                </div>
            </div>
        </>
    )
}

export default Gallery