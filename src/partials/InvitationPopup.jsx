import React, { useEffect, useState } from "react";
import "../css/additional-styles/VerticalCarousel.css";

export default function InvitationPopup( ) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Start animation after mount
    setTimeout(() => setShow(true), 1000);
  }, []);

  return (
    <>
      {show && (
        <div
          className="fixed left-1/2 top-1/2 z-50 animate-invitation-popup 
            w-1/6 rounded-lg shadow-lg p-4
            transition-all flex flex-col items-center select-none"
    >
      <div className="text-base font-semibold text-black mb-1.5 text-center">Masz nowe zaproszenie!</div>
      <div className="text-sm text-black mb-3 text-center">od: Kasia N.</div>
      <div className="flex gap-2 justify-center">
        {/* <button
          className="bg-gray-100 text-black px-2.5 py-1.5 rounded font-medium shadow hover:bg-gray-200 transition"
          onClick={onReject}
        >
          Odrzuć
        </button> */}
        <div
          className="bg-[#39a99f99] text-white px-3 py-1.5 rounded-full text-xs shadow transition"
        >
          Zaakceptuj
        </div>
      </div>
    </div>
        )}
    </>
  );
}