import React, { useState, useEffect, useRef } from 'react';
import { Galleria } from 'primereact/galleria';
import { useFetch } from '../server/common/apiCalls'

import axios from 'axios'

const Gallery = ({ imageUploaded, getImage, setGalleryDialogVisible }) => {
    const [activeIndex, setActiveIndex] = useState(0)
    const galleria = useRef(null)
    const [imagesUpdated, setImagesUpdated] = useState(false)
    const [images, fetchError] = useFetch('/api/images', undefined, [imagesUpdated])

    useEffect(() => {
        // When Gallery is open, refresh every few seconds
        const intervalCall = setInterval(() => {
            setImagesUpdated(true)
        }, 4000);
        return () => {
          // clean up
          clearInterval(intervalCall);
        };
      }, []);

    useEffect(() => {
        setImagesUpdated(false)
    })

    useEffect(() => {
        if (imageUploaded) { setImagesUpdated(true) }
    }, [imageUploaded])


    const itemTemplate = (item) => {
        return <img src={item.itemImageSrc} style={{ width: '100%', display: 'block' }} />;
    }

    const thumbnailTemplate = (item) => {
        return <img src={item.itemImageSrc} style={{ display: 'block' }} />;
    }

    const deleteImage = async (e) => {
        console.log("Delete")
        const filename = e.target.id
        await axios.delete('/api/image?filename=' + filename)
            .then(() => {
                setImagesUpdated(true)
            })
            .catch(e => {
                if (e.response.status == 401) {
                    console.log("Unauthorized")
                }
            })
    }

    const pasteImage = (e) => {
        console.log("paste image called")
        getImage(e.target.previousElementSibling)
        setGalleryDialogVisible(false)
    }

    return (
        <div className='relative'>
            <Galleria ref={galleria} value={images} numVisible={7} style={{ maxWidth: '850px' }}
                activeIndex={activeIndex} onItemChange={(e) => setActiveIndex(e.index)}
                circular fullScreen showItemNavigators showThumbnails={false} item={itemTemplate} thumbnail={thumbnailTemplate} />
            <div className="grid grid-cols-2 gap-4" >
                {
                    images && images.map((image, index) => {
                        let filename = image.itemImageSrc.split('\\').pop()
                        let imgEl = <img className='w-3/6 float-left' name={filename} src={image.itemImageSrc} style={{ cursor: 'pointer' }} onClick={
                            () => { setActiveIndex(index); galleria.current.show() }
                        } />
                        return (
                            <div key={index}>
                                {imgEl}
                                <button className='inline-flex m-1 items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20' onClick={pasteImage}>Dodaj na tablicę</button><br />
                                <button id={filename} className='inline-flex m-1 items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10' onClick={deleteImage}>Usuń [X]</button>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default Gallery