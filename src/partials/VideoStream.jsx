import { useEffect, useRef, useState } from 'react';
import { useFetch } from '../server/common/apiCalls'
import { useImageExists } from './useImageExists'
import Peer from 'peerjs';
import icons from './icons'
import peerConfig from '../config/peerConfig'

const VideoStream = ({ socket, teacherUserId, isRemotePresent: getIsRemotePresent, room, isTeacher }) => {

  const [peerId, setPeerId] = useState('');
  const [remoteUser, setRemoteUser] = useState({ peerId: '', userId: '', firstName: '', lastName: '', profileImage: '' });
  const [userInfo] = useFetch('api/user/info')
  const [myInitials, setMyInitials] = useState('')
  const [profileImage, setProfileImage] = useState()
  const remoteVideoRef = useRef(null);
  const currentUserVideoRef = useRef(null);
  const peerInstance = useRef(null);
  const [remoteInitials, setRemoteInitials] = useState()
  const [isMuted, setIsMuted] = useState(JSON.parse(localStorage.getItem('isMuted') !== null
    ? localStorage.getItem('isMuted')
    : true));
  const [isRemoteMuted, setIsRemoteMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(
    localStorage.getItem('isVideoOff') !== null
      ? JSON.parse(localStorage.getItem('isVideoOff'))
      : true
  );
  const [isRemoteVideoOff, setIsRemoteVideoOff] = useState(false);
  const teacherProfileImageExists = useImageExists("/public/profileImages/" + teacherUserId + ".jpeg");
  const [mediaError, setMediaError] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [mediaPermission, setMediaPermission] = useState({ camera: '', microphone: '' });
  const [sendResponseToPeerId, setSendResponseToPeerId] = useState(null);

  const getMyMediaStream = (constraints) => {
    console.log("Getting my media stream");
    if (!constraints) {
      constraints = { audio: true, video: !isVideoOff };
    }
    navigator.mediaDevices.getUserMedia(constraints)
      .then((mediaStream) => {
        setLocalStream(mediaStream);
        console.log("Obtained media stream:", mediaStream);
        setMediaError(null);
      })
      .catch((err) => {
        if (err && err.name === "NotAllowedError") {
          setMediaError("Aby udzielić ponownie dostępu do kamery/mikrofonu, kliknij ikonę kamery/mikrofonu w pasku adresu i wybierz 'Zezwól'.");
        } else {
          setMediaError("Wystąpił błąd podczas uzyskiwania dostępu do kamery/mikrofonu.");
        }
        console.error('getUserMedia error when getting media stream:', err);
      });
  }

  const playMyStream = () => {
    currentUserVideoRef.current.srcObject = localStream;
    currentUserVideoRef.current.onloadedmetadata = () => {
      currentUserVideoRef.current.play();
    };
  }

  const playRemoteStream = (stream) => {
    if (!stream) {
      stream = remoteStream;
    }
    remoteVideoRef.current.srcObject = stream;
    remoteVideoRef.current.onloadedmetadata = () => {
      remoteVideoRef.current.play();
    };
  }

  const closeConnectionsAndCall = () => {
    if (peerInstance.current && peerInstance.current.connections) {
      Object.values(peerInstance.current.connections).forEach(connectionArr => {
        connectionArr.forEach(conn => conn.close && conn.close());
        console.log("Closed old connection");
      });
    }
    setTimeout(() => {
      call(remoteUser.peerId);
      console.log("Calling remote peer from closeConnectionsAndCall function:", remoteUser.peerId);
    }, 500);
  }

  // useEffect(() => {
  //   console.log("my localStream value changed", localStream);
  // }, [localStream]);

  // useEffect(() => {
  //   console.log("my remoteStream value changed", remoteStream);
  // }, [remoteStream]);

  // useEffect(() => {
  //   console.log("Remote peerId value changed", remoteUser.peerId);
  // }, [remoteUser.peerId]);

  // useEffect(() => {
  //   console.log("My peerId value changed", peerId);
  // }, [peerId]);

  // Initialize PeerJS
  useEffect(() => {
    const peer = new Peer({
      host: peerConfig.host,
      port: peerConfig.port,
      path: peerConfig.path,
      secure: peerConfig.secure, //TODO
      config: peerConfig.config // tylko ICE servers!
    });

    const handleOpen = (id) => setPeerId(id);
    const handleCall = (call) => {
      // Handle incoming call
      console.log("Incoming call from:", call.peer);
      navigator.mediaDevices.getUserMedia({ audio: true, video: !isVideoOff })
        .then(function (mediaStream) {
          console.log("Odebrano połączenie, odpowiadam streamem:", mediaStream);
          call.answer(mediaStream)
          call.on('stream', function (remoteStream) {
            setRemoteStream(remoteStream);
            console.log("Odebrano zdalny stream:", remoteStream);
          });
        })
        .catch(function (err) {
          if (err && err.name === "NotAllowedError") {
            setMediaError("Aby udzielić ponownie dostępu do kamery/mikrofonu, kliknij ikonę kamery/mikrofonu w pasku adresu i wybierz 'Zezwól'.");
          } else {
            setMediaError("Wystąpił błąd podczas uzyskiwania dostępu do kamery/mikrofonu.");
          }
          console.error('getUserMedia error1', err);
        });
    };

    peer.on('error', (err) => {
      console.error("PeerJS error:", err);
    });

    peer.on('open', handleOpen);
    peer.on('call', handleCall);

    peerInstance.current = peer;

    console.log("PeerJS instance created:", peer);
    return () => {
      peer.off('open', handleOpen);
      peer.off('call', handleCall);
      peer.off('error');
    };
  }, [])


  useEffect(() => {

    const checkPermissions = async () => {
      // Sprawdzenie uprawnień do kamery i mikrofonu
      const camera = await navigator.permissions.query({ name: 'camera' });
      const microphone = await navigator.permissions.query({ name: 'microphone' });

      console.log('Kamera:', camera.state); // 'granted', 'denied', 'prompt'
      console.log('Mikrofon:', microphone.state);

      setMediaPermission({ camera: camera.state, microphone: microphone.state });
    }

    checkPermissions();
  }, []);

  useEffect(() => {
    if (!localStream) getMyMediaStream();
  }, []);


  useEffect(() => {
    if (remoteUser.userId) {
      setRemoteInitials(remoteUser.firstName.slice(0, 1) + remoteUser.lastName.slice(0, 1))
    }
  }, [remoteUser.userId])

  // Mute/Unmute Microphone
  const toggleMute = () => {
    setIsMuted((prev) => {
      const newMuted = !prev;
      if (!newMuted && mediaPermission.microphone !== 'granted') {
        getMyMediaStream();
      }
      socket.emit('user_muted', { room, userId: userInfo.id, isMuted: newMuted });
      return newMuted;
    });
  };

  // Camera On/Off
  const toggleVideo = () => {
    setIsVideoOff((prev) => {
      const newVideoOff = !prev;
      // Check if localStream video tracks are available
      socket.emit('user_video_off', { room, userId: userInfo.id, isVideoOff: newVideoOff });
      return newVideoOff;
    });
  };

  // Odbieranie stanu mute/video od drugiego użytkownika
  useEffect(() => {
    socket.on('user_muted', (data) => {
      if (data.userId === remoteUser.userId) {
        setIsRemoteMuted(data.isMuted);
      }
    });
    socket.on('user_video_off', (data) => {
      if (data.userId === remoteUser.userId) {
        setIsRemoteVideoOff(data.isVideoOff);
      }
    });
    return () => {
      socket.off('user_muted');
      socket.off('user_video_off');
    };
  }, [socket, remoteUser.userId]); // TODO: remoteUser.userId chyba do wykasowania z dependencies?

  useEffect(() => {
    // If all my information are there, send the event to other sockets in the room
    if (peerId && userInfo) {
      console.log("isTeacher", isTeacher);
      socket.emit('peer_id_joined', { room, peerId, userId: userInfo.id, firstName: userInfo.firstName, lastName: userInfo.lastName, profileImage: userInfo.profileImage, muted: isMuted, videoOff: isVideoOff });
      console.log("Emitted peer_id_joined event with:", { room, peerId, userId: userInfo.id, firstName: userInfo.firstName, lastName: userInfo.lastName, profileImage: userInfo.profileImage, muted: isMuted, videoOff: isVideoOff });
    }
    socket.emit('get_remote_dimensions');
  }, [peerId, userInfo]);

  useEffect(() => {
    if (userInfo && userInfo.firstName) {
      setProfileImage(userInfo.profileImage)
      setMyInitials(userInfo.firstName.slice(0, 1) + userInfo.lastName.slice(0, 1))
    }
  }, [userInfo])

  useEffect(() => {
    socket.on('peer_id_joined', (data) => {
      console.log("Received peer_id_joined event with data:", data);
      if (remoteUser.peerId !== data.peerId) {
        setRemoteUser({
          peerId: data.peerId,
          userId: data.userId,
          firstName: data.firstName,
          lastName: data.lastName,
          profileImage: data.profileImage,
        });
        setIsRemoteMuted(data.muted);
        setIsRemoteVideoOff(data.videoOff);
        getIsRemotePresent(true);

        setSendResponseToPeerId(data.peerId);
      }
    });

    socket.on('peer_id_response', (data) => {
      console.log("Received peer_id_response event with data:", data);
      if (remoteUser.peerId !== data.peerId) {
        setRemoteUser({
          peerId: data.peerId,
          userId: data.userId,
          firstName: data.firstName,
          lastName: data.lastName,
          profileImage: data.profileImage,
        });
        setIsRemoteMuted(data.muted);
        setIsRemoteVideoOff(data.videoOff);
        getIsRemotePresent(true);
      }
    });

    // socket.on('lesson_finished', () => {
    //   peerInstance.current.destroy()
    // });

    socket.on('socket-disconnected', (data) => {
      console.log("socket-disconnected event received !!");
      getIsRemotePresent(false)
      setRemoteInitials('')
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    })

    return () => {
      socket.off('peer_id_joined');
      //socket.off('lesson_finished');
      socket.off('socket-disconnected');
    };
  }, [socket])

  useEffect(() => {
    if (sendResponseToPeerId && peerId && sendResponseToPeerId !== peerId) {
      // Each user has to sent their data at least once
      socket.emit('peer_id_response', { room, peerId, userId: userInfo.id, firstName: userInfo.firstName, lastName: userInfo.lastName, profileImage: userInfo.profileImage, muted: isMuted, videoOff: isVideoOff });
      console.log("Emitted peer_id_response event with:", { room, peerId, userId: userInfo.id, firstName: userInfo.firstName, lastName: userInfo.lastName, profileImage: userInfo.profileImage, muted: isMuted, videoOff: isVideoOff });
    }
  }, [sendResponseToPeerId, peerId]);


  const call = (remotePeerId) => {
    let mediaStream = localStream
    if (mediaStream) {
      console.log("Calling remote peer from call function, mediaStream exists", mediaStream);
      // Jeśli mamy już stream (np. po ponownym włączeniu kamery), użyj go
      const call = peerInstance.current.call(remotePeerId, mediaStream);

      call.on('stream', (remoteStream) => {
        console.log("Received remote stream in call function", remoteStream);
        console.log("remoteVideoRef.current", remoteVideoRef.current);
        setRemoteStream(remoteStream);
      });
    }
  }


  useEffect(() => {
    if (!localStream) {
      console.log("No local stream, trying to get it");
      getMyMediaStream();
    }
    if (localStream && !isVideoOff) {
      console.log("Local stream is present, setting to video element", localStream);
      //check if the localStream is not already set to avoid re-assigning
      if (currentUserVideoRef.current.srcObject === localStream) {
        console.log("Local stream is already set to video element, skipping re-assignment");
        return;
      }
      playMyStream();
    }

  }, [localStream]);

  useEffect(() => {
    console.log("remoteStream changed:", remoteStream);
    console.log("isRemoteVideoOff:", isRemoteVideoOff);
    if (remoteStream) {
      console.log("Remote stream is present, setting to video element", remoteStream);
      //check if the localStream is not already set to avoid re-assigning
      if (remoteVideoRef.current.srcObject === remoteStream) {
        console.log("Remote stream is already set to video element, skipping re-assignments");
        return;
      }
      playRemoteStream(remoteStream);
    }
    else if (!remoteStream) {
      console.log("Remote stream is not present");
    }
  }, [remoteStream]);

  useEffect(() => {
    if (!isVideoOff && remoteUser.peerId && localStream) {
      // Jesli włączono kamerę i mamy peerId zdalnego użytkownika, zadzwoń do niego
      // ale tylko jesli localStream juz istnieje
      console.log("Calling remote peer from useEffect after enabling video, remoteUser.peerId:", remoteUser.peerId);
      closeConnectionsAndCall();
    }
  }, [isVideoOff, localStream]);

  useEffect(() => {
    if (remoteUser.peerId && isTeacher === '1' && localStream) {
      // Połączenie inicjalne - po odswiezeniu strony lub dołączeniu do pokoju
      console.log("Initial call to remote peer from useEffect, remoteUser.peerId:", remoteUser.peerId);
      // Zamknij stare połączenia:
      if (remoteUser.peerId && localStream) {
        closeConnectionsAndCall();
      }
    }
  }, [remoteUser.peerId, localStream]); // Dodano localStream do dependencies

  // Zapisuj stan przy zmianie
  useEffect(() => {
    if (isMuted !== null) localStorage.setItem('isMuted', JSON.stringify(isMuted));
    if (currentUserVideoRef.current && currentUserVideoRef.current.srcObject) {
      currentUserVideoRef.current.srcObject.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted]);

  useEffect(() => {
    localStorage.setItem('isVideoOff', JSON.stringify(isVideoOff));
    if (!isVideoOff && localStream && localStream.getVideoTracks().length === 0) {
      console.log("No video tracks in localStream, getting media stream with video");
      getMyMediaStream();
    }
    if (!isVideoOff && localStream && localStream.getVideoTracks().length > 0) {
      currentUserVideoRef.current.srcObject.getVideoTracks().forEach(track => {
        track.enabled = !isVideoOff;
      });
    }
    if (!isVideoOff && localStream) {
      playMyStream();
    }
  }, [isVideoOff]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
      remoteVideoRef.current.srcObject.getAudioTracks().forEach(track => {
        track.enabled = !isRemoteMuted;
      });
    }
    if (!isVideoOff && localStream) {
      playRemoteStream();
    }
  }, [isRemoteMuted]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
      remoteVideoRef.current.srcObject.getVideoTracks().forEach(track => {
        track.enabled = !isRemoteVideoOff;
      });
    }
    if (!isRemoteVideoOff && remoteStream) {
      playMyStream();
    }
  }, [isRemoteVideoOff]);

  //////////////////////////
  const renderCurrentUserVideo = () => {
    return (
      <>
        <video
          className='rounded-xl aspect-square'
          ref={currentUserVideoRef}
          poster={profileImage}
          muted={true}
          style={{ display: isVideoOff || !localStream ? 'none' : 'block' }}
          playsInline
          webkit-playsinline="true"
          autoPlay
        />
        {(isVideoOff || !localStream) && (
          profileImage ? (
            <img
              src={profileImage}
              alt="Profilowe"
              className="rounded-xl aspect-square object-cover w-full h-full"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-yellow-50 rounded-xl">
              <span className="font-medium text-gray-600 dark:text-gray-300">{myInitials}</span>
            </div>
          )
        )}
      </>
    );
  };

  const renderRemoteUserVideo = () => {
    return (
      <>
        <video
          className='rounded-xl aspect-square'
          ref={remoteVideoRef}
          poster={remoteUser.profileImage}
          muted={isRemoteMuted}
          style={{ display: isRemoteVideoOff || !remoteStream ? 'none' : 'block' }}
          playsInline
          webkit-playsinline="true"
          autoPlay
        />
        {(isRemoteVideoOff || !remoteStream) && (
          remoteUser.profileImage ? (
            <img
              src={remoteUser.profileImage}
              alt="Profilowe zdalnego użytkownika"
              className="absolute inset-0 rounded-xl object-cover w-full h-full"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-cyan-50 rounded-xl">
              <span className="font-medium text-gray-600 dark:text-gray-300">{remoteInitials}</span>
            </div>
          )
        )}
      </>
    );
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        {/* Kolumna 1: Ty */}
        <div className="flex flex-col items-center">
          <div className='relative w-full place-content-center rounded-xl flex flex-col items-center aspect-square'>
            {renderCurrentUserVideo()}
            <div className="absolute bottom-0 left-0 w-full flex gap-2 px-2 bg-white/60 backdrop-blur-sm rounded-b-xl shadow-sm border-t border-gray-200 items-center justify-center">
              <button
                className={`transition-all duration-150 px-3 py-1 rounded-md hover:bg-blue-50 active:scale-95 ${isMuted ? 'text-red-500' : 'text-gray-700'}`}
                onClick={toggleMute}
                title={isMuted ? "Włącz dźwięk" : "Wycisz"}
                aria-pressed={isMuted}
                style={{ background: 'none', border: 'none' }}
              >
                {isMuted ? icons.MicOff : icons.Mic}
              </button>
              <button
                className={`transition-all duration-150 px-3 py-1 rounded-md hover:bg-blue-50 active:scale-95 ${isVideoOff ? 'text-yellow-500' : 'text-gray-700'}`}
                onClick={toggleVideo}
                title={isVideoOff ? "Włącz kamerę" : "Wyłącz kamerę"}
                aria-pressed={isVideoOff}
                style={{ background: 'none', border: 'none' }}
              >
                {isVideoOff ? icons.CameraOff : icons.Camera}
              </button>
            </div>
          </div>
          <span className="block mt-2 text-sm font-medium text-gray-700 text-center">
            {userInfo.firstName}
          </span>
        </div>

        {/* Kolumna 2: Zdalny użytkownik */}
        <div className="flex flex-col items-center">
          <div className={`relative ${!remoteUser.peerId && !teacherUserId && 'border-solid border-2 bg-gray-100'} w-full aspect-square place-content-center inline rounded-xl flex flex-col items-center`}>
            {remoteUser.peerId ? (
              <>
                {renderRemoteUserVideo()}
                <div className="absolute bottom-0 left-0 w-full flex gap-2 px-2 bg-gray-100/60 backdrop-blur-sm rounded-b-xl shadow-sm border-t border-gray-200 items-center justify-center">
                  <button
                    className={`px-3 py-1 rounded-md text-gray-400 cursor-not-allowed ${isRemoteMuted ? 'text-red-400' : ''}`}
                    disabled
                    title={isRemoteMuted ? "Zdalny użytkownik jest wyciszony" : "Zdalny użytkownik jest aktywny"}
                    aria-pressed={isRemoteMuted}
                    style={{ background: 'none', border: 'none', opacity: 0.7 }}
                  >
                    {isRemoteMuted ? icons.MicOff : icons.Mic}
                  </button>
                  <button
                    className={`px-3 py-1 rounded-md text-gray-400 cursor-not-allowed ${isRemoteVideoOff ? 'text-yellow-400' : ''}`}
                    disabled
                    title={isRemoteVideoOff ? "Zdalny użytkownik ma wyłączoną kamerę" : "Zdalny użytkownik ma włączoną kamerę"}
                    aria-pressed={isRemoteVideoOff}
                    style={{ background: 'none', border: 'none', opacity: 0.7 }}
                  >
                    {isRemoteVideoOff ? icons.CameraOff : icons.Camera}
                  </button>
                </div>
              </>
            ) : teacherProfileImageExists ? (
              <div className="waiting-mask">
                {<img src={"/public/profileImages/" + teacherUserId + ".jpeg"} className='opacity-20 rounded-xl' />}
              </div>
            ) : (
              icons.Avatar
            )}
          </div>
          <span className="block mt-2 text-sm font-medium text-gray-700 text-center">
            {remoteUser.firstName}
          </span>
        </div>
      </div>
      {/* Komunikat pod obiema kolumnami */}
      {mediaError && (
        <div className="w-full mt-4 mb-2 p-3 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded text-center relative flex flex-col items-end max-w-2xl mx-auto">
          <button
            className="text-yellow-700 hover:text-yellow-900 text-xl font-bold focus:outline-none mr-2"
            onClick={() => setMediaError(null)}
            aria-label="Zamknij komunikat"
            type="button"
            style={{ lineHeight: 1 }}
          >
            ×
          </button>
          <span className="flex-1 text-center text-sm mt-1 mr-1">
            {mediaError}
          </span>
        </div>
      )}
    </div>
  );
}

export default VideoStream;