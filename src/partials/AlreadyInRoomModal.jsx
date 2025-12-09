import { Dialog } from 'primereact/dialog'
import { useState } from 'react';
import { logout } from '../partials/functions/global';
import { useNavigate } from 'react-router-dom';

const AlreadyInRoomModal = ({ socket, setLoggedIn }) => {
  const [showAlreadyInRoomModal, setShowAlreadyInRoomModal] = useState(false);
  const navigate = useNavigate();


  socket.on('already_in_room', () => {
    setShowAlreadyInRoomModal(true)
    console.log('Already in room');
  });

  socket.on('force_session', async () => {
    await logout(socket, setLoggedIn, null, navigate);
  });


  const handleLogout = async () => {
    await logout(socket, setLoggedIn, null, navigate);
    setShowAlreadyInRoomModal(false);
  }

  const onForceSession = () => {
    socket.emit('force_session');
    setShowAlreadyInRoomModal(false);
  }

  return (
    <Dialog
      header="Podwójne logowanie"
      visible={showAlreadyInRoomModal}
      style={{ width: '90vw', maxWidth: 800 }}
      onHide={() => setShowAlreadyInRoomModal(false)}
      breakpoints={{ '960px': '98vw', '640px': '100vw' }}
      modal
      closable={false}
      resizable={false}
    >
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Jesteś zalogowany na innym urządzeniu</h2>
        <div className="flex flex-col md:flex-row gap-6 justify-center">
          {/* Opcja 1 */}
          <div className="flex-1 bg-gray-50 rounded-lg shadow p-6 flex flex-col items-center border border-gray-200">
            <div className="text-3xl mb-2">🗂️</div>
            <div className="mb-4 text-gray-800 text-center">
              Jeśli masz otwartą stronę w innych kartach przeglądarki - zamknij je i odśwież stronę.
            </div>
          </div>
          {/* Opcja 2 */}
          <div className="flex-1 bg-gray-50 rounded-lg shadow p-6 flex flex-col items-center border border-gray-200">
            <div className="text-3xl mb-2">🔒</div>
            <div className="mb-4 text-gray-800 text-center">
              Jeśli to jedyna otwarta karta - możesz wymusić wylogowanie z innych urządzeń.
            </div>
            <button
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition shadow-lg border-2 border-green-700"
              onClick={onForceSession}
            >
              Wyloguj mnie z innych urządzeń
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default AlreadyInRoomModal;