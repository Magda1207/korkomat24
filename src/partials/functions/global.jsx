//import { useNavigate } from 'react-router-dom';
import axios from 'axios';
  // Zachowaj te klucze przy czyszczeniu localStorage
  const PERSIST_LOCAL_KEYS = ['cookieConsent'];

  export const clearAuthStorage = () => {
    const backup = Object.fromEntries(
      PERSIST_LOCAL_KEYS.map(k => [k, localStorage.getItem(k)])
    );
    localStorage.clear();
    PERSIST_LOCAL_KEYS.forEach(k => {
      if (backup[k] !== null) localStorage.setItem(k, backup[k]);
    });
  };

  export async function logout(socket, setLoggedIn, getLeavingConfirmed, navigate) {
    //const navigate = useNavigate();
    if (typeof getLeavingConfirmed === 'function') {
      getLeavingConfirmed(true)
    }
    await axios.post('/api/logout')
    //localStorage.clear()
    clearAuthStorage();
    socket.disconnect()
    socket.connect()
    setLoggedIn(false)
    navigate('/', { replace: true });
  };


export default {logout, clearAuthStorage};


