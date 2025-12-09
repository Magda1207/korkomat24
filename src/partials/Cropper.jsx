import React, { useState, useEffect } from 'react'
import Cropper from 'react-easy-crop'
import { Dialog } from 'primereact/dialog'
import getCroppedImg from './functions/cropImage'


const ImageCropper = ({ imageSrc, cropImageDialogVisible, setCropImageDialogVisible, getCroppedImage }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [dialogShown, setDialogShown] = useState()
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  const handleHide = () => {
    setCropImageDialogVisible(false)
    setDialogShown(false)
  }

  const cropImage = async () => {
    try {
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        0
      )
      getCroppedImage(croppedImage)
      setCropImageDialogVisible(false)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div>
      <Dialog header="Przytnij zdjęcie" resizable={false} visible={cropImageDialogVisible} style={{ width: '50vw' }} onHide={handleHide} onShow={() => { setDialogShown(true) }}>
        <div className='relative h-96'> {dialogShown ? <>
          <div >
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={2 / 2}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div className="controls grid justify-items-stretch">
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => {
                setZoom(e.target.value)
              }}
              className="absolute justify-self-center mt-6"
            />
          </div>
          <button onClick={cropImage} className="absolute mb-3 bottom-0 inset-x-1/4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">Gotowe</button>
          </> : "Ładowanie zdjęcia..."}
        </div>
      </Dialog >
    </div>
  )
}

export default ImageCropper
