import { React } from 'react';
import { setupRecaptcha, initFirebase } from '../partials/FirebaseInitializer';
import { getAuth, signInWithPhoneNumber } from "firebase/auth";
import { Dialog } from 'primereact/dialog';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyPhoneNumberModal = ({ phoneNumber, modalVisible }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [verifyPhoneNumberModalVisible, setVerifyPhoneNumberModalVisible] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const navigate = useNavigate();

  const verificationCodeHandler = (e) => {
    if (e.ctrlKey) { return; }
    if (e.key.length > 1) { return; }
    if (/[0-9]/.test(e.key)) { return; }
    e.preventDefault();
  }

  useEffect(() => {
    setVerifyPhoneNumberModalVisible(modalVisible);
  }, [modalVisible]);

  // Inicjalizacja recaptcha verifier (invisible)
  useEffect(() => {
    (async () => {
      // czekamy na inicjalizację Firebase i pobieramy auth
      const fb = await initFirebase();
      const { auth } = fb;
      // utwórz/wywołaj recaptcha jeśli jeszcze nie istnieje
      if (!window.recaptchaVerifier) {
        // 'recaptcha-container' - możesz użyć id elementu lub string container zgodnie z Twoim użyciem
        setupRecaptcha('recaptcha-container', auth);
      }
    })();
  }, []);

  useEffect(() => {
    if (phoneNumber && phoneNumber.length === 9 && verifyPhoneNumberModalVisible) {
      console.log("Wysyłam kod weryfikacyjny na numer: " + phoneNumber);
      sendCode();
    }
  }, [phoneNumber, verifyPhoneNumberModalVisible]);
  // Wyślij SMS z kodem weryfikacyjnym
  const sendCode = async () => {
    const { auth } = initFirebase();
    const phone = "+48" + phoneNumber;
    if (!window.recaptchaVerifier) {
      setupRecaptcha('recaptcha-container', auth);
    }
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      window.confirmationResult = confirmationResult;
      setVerificationMessage("");
    } catch (error) {
      setVerificationMessage("Błąd podczas wysyłania kodu: " + error.message + " " + phoneNumber);
    }
  };

  // Zweryfikuj kod weryfikacyjny wpisany przez użytkownika
  const verifyCode = async () => {
    if (window.confirmationResult) {
      try {
        await window.confirmationResult.confirm(verificationCode);
        setVerificationMessage("");
        //close the modal
        setVerifyPhoneNumberModalVisible(false);
        setVerificationSuccess(true);
        return true;
      } catch (error) {
        setVerificationMessage("Niepoprawny kod: " + error.message);
        return false;
      }
    } else {
      setVerificationMessage("Najpierw wyślij kod weryfikacyjny.");
      return false;
    }
  };

  useEffect(() => {
    if (verificationSuccess) {
      console.log("Weryfikacja zakończona sukcesem")
      axios.put('/api/user/phoneNumberConfirmed')
      navigate('/', { replace: true });
    }
  }, [verificationSuccess]);

  return (
    <Dialog resizable={false} header="Weryfikacja numeru telefonu" visible={verifyPhoneNumberModalVisible} closable={false}>
      <div className="grid">
        <div className="mx-3 mb-5">
          <p>
            Podaj kod weryfikacyjny
          </p>
        </div>
        {/* Verification Code Field */}
        <div className="flex flex-wrap -mx-3 mb-4">
          <div className="w-full px-3">
            <input
              id="verification-code"
              type="text"
              onKeyDown={verificationCodeHandler}
              placeholder="123456"
              className="form-input w-full text-gray-900"
              value={verificationCode}
              onChange={e => setVerificationCode(e.target.value)}
              required
            />
            {/* Przycisk Wyślij */}
            <button
              type="button"
              className="mt-6 btn text-white bg-emerald-500 hover:bg-emerald-700 w-full"
              onClick={verifyCode}
            >
              Wyślij
            </button>
            {/* Komunikat o statusie weryfikacji */}
            {verificationMessage && (
              <span className="flex items-center font-medium tracking-wide text-red-500 text-xs mt-1 ml-1">
                {verificationMessage}
              </span>
            )}
          </div>
        </div>
      </div>
    </Dialog >
  );
}

export default VerifyPhoneNumberModal;