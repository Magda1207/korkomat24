import learningImage from '../images/learning4.jpg'; 
import { useState } from 'react';

function HeaderImage() {
    const [imageLoaded, setImageLoaded] = useState(false)
    return (
        <div className="relative w-full">
            <div className="w-full h-[32vh] md:h-[40vh] rounded-b-3xl overflow-hidden relative">
                {/* placeholder background while image loads */}
                <div className={`absolute inset-0 bg-gray-100 ${imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-400`} />
                <img
                    src={learningImage}
                    alt="Tło"
                    loading="lazy"
                    onLoad={() => setImageLoaded(true)}
                    className={`w-full h-full object-cover object-center transition-all duration-700 ease-out ${imageLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-md scale-105'}`}
                />
                {/* gradient / vignette nad obrazkiem aby tekst był czytelny i żeby zatuszować krawędzie */}
                <div className={`absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent pointer-events-none transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`} />
            </div>
        </div >
    );
}
export default HeaderImage;