import { useEffect, useState } from 'react'
import { useIdleTimer } from 'react-idle-timer'
import { Dialog } from 'primereact/dialog'
import { logout } from '../partials/functions/global';
import useSound from 'use-sound';
import notificationSound from '../sounds/sound__success_low.mp3';
import { useNavigate } from 'react-router-dom';

const timeout = 3690_000 // 1h + 90 seconds = 3690_000
const promptBeforeIdle = 90_000 //  90 seconds = 90_000

const IdleDetector = ({ setLoggedIn, socket }) => {
  const [state, setState] = useState('Active')
  const [remaining, setRemaining] = useState(timeout)
  const [idleModalVisible, setIdleModalVisible] = useState(false)
  const [play] = useSound(notificationSound);
  const navigate = useNavigate();

  const onIdle = () => {
    setState('Idle')
    setIdleModalVisible(false)
    logout(socket, setLoggedIn, null, navigate)
  }

  const onActive = () => {
    setState('Active')
    setIdleModalVisible(false)
  }

  const onPrompt = () => {
    setState('Prompted')
    setIdleModalVisible(true)
    play()
  }

  const { getRemainingTime, activate } = useIdleTimer({
    onIdle,
    onActive,
    onPrompt,
    timeout,
    promptBeforeIdle,
    throttle: 500
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(Math.ceil(getRemainingTime() / 1000))
    }, 500)

    return () => {
      clearInterval(interval)
    }
  })

  const handleStillHere = () => {
    activate()
  }

  return (
    <>
      <Dialog header="Jesteś tam?" resizable={false} visible={idleModalVisible} style={{ width: '50vw' }} onHide={() => setIdleModalVisible(false)}>
        <div className="mb-2 text-center">Wylogowanie za: {remaining} sek.</div>
        <div className='grid grid-cols-4'>
          <button type="submit" className="min-w-0 col-span-4 m-1 rounded-md bg-green-600 px-12 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600" onClick={handleStillHere}>Wciąż tu jestem</button>
        </div>
      </Dialog >
    </> 
  )
}

export default IdleDetector;