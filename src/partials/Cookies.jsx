import React, { useState, useEffect } from 'react';

function Cookies() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cookieConsent');
      if (!stored) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const acceptAll = () => {
    try {
      localStorage.setItem('cookieConsent', '1');
    } catch {}
    setVisible(false);
  };

  return (
    <>
      {visible && (
        <div className="fixed inset-x-0 bottom-0 z-50">
          <div className="mx-auto max-w-5xl rounded-t-2xl border border-gray-200 bg-white shadow-2xl p-4 md:p-5">
            <div className="flex flex-col md:flex-row md:items-center md:gap-6">
              <div className="flex-1 text-sm text-gray-800">
                <p className="font-semibold mb-1">Ciasteczka</p>
                <p className="text-gray-600">
                  Używamy plików cookies, aby zapewnić Ci najlepsze działanie naszej strony. Kontynuując, akceptujesz ich użycie.
                </p>
              </div>
              <div className="mt-3 md:mt-0 flex gap-2 shrink-0">
                <button
                  onClick={acceptAll}
                  className="px-3 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Akceptuj
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Cookies;