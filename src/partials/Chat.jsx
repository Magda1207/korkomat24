import { useState, useRef, useEffect } from 'react';
import icons from './icons';
import axios from 'axios'
import { useFetch } from '../server/common/apiCalls';

const Chat = ({ loggedIn, userId, socket, roomId }) => {
  const [isMinimized, setIsMinimized] = useState(true);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);
  // fetch messages only if logged in
  const [messages] = useFetch(loggedIn ? '/api/chatMessages' : null, { roomId }, [roomId]);
  const [localMessages, setLocalMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastSeenMessageIdRef = useRef(null);

  // avoid infinite loops if useFetch returns a new array reference on each render
  //const lastChatMessagesRef = useRef(null);

  // useEffect(() => {
  //   // scroll to bottom on component mount
  //   if (!loggedIn) {
  //     setMessages([
  //       { id: 1, text: "Dzień dobry, już podłączam słuchawki i zaraz się słyszymy", sender: 'me', time: '09:10' },
  //       { id: 2, text: "Ok :-)", sender: 'other', time: '09:11' },
  //       { id: 3, text: "Już jestem", sender: 'me', time: '09:12' },
  //     ]);
  //   }
  // }, [loggedIn]);

  // sync lokalnego stanu z danymi z serwera
  useEffect(() => {
    setLocalMessages(Array.isArray(messages) ? messages : []);
  }, [messages]);

  // zliczanie nieprzeczytanych, gdy czat zminimalizowany i przyjdzie nowa wiadomość (od innego użytkownika)
  useEffect(() => {
    if (!Array.isArray(localMessages) || localMessages.length === 0) return;
    const last = localMessages[localMessages.length - 1];
    if (!last) return;
    if (lastSeenMessageIdRef.current === last.id) return;
    lastSeenMessageIdRef.current = last.id;
    if (isMinimized && String(last.senderUserId) !== String(userId)) {
      setUnreadCount(c => c + 1);
    }
  }, [localMessages, isMinimized, userId]);

  // reset po otwarciu czatu
  useEffect(() => {
    if (!isMinimized) {
      setUnreadCount(0);
      if (localMessages.length) {
        lastSeenMessageIdRef.current = localMessages[localMessages.length - 1].id;
      }
    }
  }, [isMinimized, localMessages]);

  // auto-scroll na nowe wiadomości lub pokazanie okna
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages, isMinimized]);

  // odbiór wiadomości z socketu -> aktualizacja stanu
  useEffect(() => {
    if (!socket) return;
    const handler = (data) => {
      console.log('Received chatMessage via socket:', data);
      setLocalMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          text: data.text,
          senderUserId: data.senderUserId,
          sentDateUtc: data.sentDateUtc || data.time,
        }
      ]);
    };
    socket.on('chatMessage', handler);
    return () => socket.off('chatMessage', handler);
  }, [socket]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    const now = new Date();
    // MySQL/UTC kompatybilne
    const sentDateUtc = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString().slice(0, 19).replace('T', ' ');
    const newMsg = { id: Date.now(), text, senderUserId: userId, sentDateUtc };
    // lokalnie dodajemy do stanu
    setLocalMessages(prev => [...prev, newMsg]);
    if (!loggedIn) {
      setInput('');
      return;
    }
    await axios.post( '/api/chatMessage', {
      text: newMsg.text,
      sentDateUtc: newMsg.sentDateUtc,
      roomId,
      senderUserId: userId,
    })
      .then(
        () => {
          setInput('');
          // powiadom innych
          socket.emit('chatMessage', {
            text: newMsg.text,
            senderUserId: userId,
            sentDateUtc: newMsg.sentDateUtc
          });
        }
      );
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed right-6 bottom-14 z-40 flex flex-col items-end gap-2">
      <div className={`bg-white flex flex-col overflow-hidden w-[320px] md:w-[360px] shadow-xl rounded-2xl border border-gray-200 ${isMinimized ? 'hidden' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
          <span className="text-sm font-medium text-gray-800">Czat</span>

        </div>
        {/* Messages */}
        <div ref={scrollRef} className="overflow-y-auto px-3 py-3 max-h-56">
          <div className="flex flex-col gap-2">
            {localMessages.map(msg => {
              const isMine = String(msg.senderUserId) === String(userId);
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`${isMine
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-900 border border-gray-200'
                    } rounded-2xl ${isMine ? 'rounded-br-sm' : 'rounded-bl-sm'} px-3 py-2 shadow-sm max-w-[75%] break-words`}>
                    <div className="text-sm leading-snug">{msg.text}</div>
                    <div className={`mt-1 text-[10px] ${isMine ? 'text-white/80' : 'text-gray-500'} text-right`}>
                      {msg.sentDateUtc ? new Date(msg.sentDateUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Input */}
        <div className="p-2.5 border-t border-gray-200 bg-white flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Wpisz wiadomość..."
            className="flex-1 rounded-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <button
            onClick={sendMessage}
            className="h-9 w-9 flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 text-white transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Wyślij"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><path d="M11.5 12H5.42M5.25 12.8L4.24 15.8C3.69 17.44 3.42 18.26 3.61 18.77C3.79 19.21 4.15 19.54 4.61 19.67C5.13 19.82 5.92 19.46 7.5 18.75L17.64 14.19C19.18 13.49 19.95 13.15 20.19 12.66C20.4 12.25 20.4 11.75 20.19 11.33C19.95 10.85 19.18 10.51 17.64 9.81L7.48 5.24C5.91 4.53 5.12 4.18 4.6 4.32C4.14 4.45 3.77 4.78 3.6 5.22C3.4 5.73 3.68 6.55 4.22 8.19L5.25 11.28C5.34 11.56 5.39 11.7 5.41 11.85C5.42 11.97 5.42 12.10 5.41 12.23C5.34 12.52 5.28 12.66 5.25 12.8Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>
       {/* Chat icon */}
       <div
         className={`relative cursor-pointer ${unreadCount > 0 && isMinimized ? 'animate-bounce' : ''}`}
         onClick={() => setIsMinimized(!isMinimized)}
         aria-label="Toggle chat"
       >
         {/* efekt ping przy nowej wiadomości */}
         {unreadCount > 0 && isMinimized && (
           <span className="absolute -top-1 -right-1 inline-flex h-5 w-5 rounded-full bg-red-500 opacity-75 animate-ping"></span>
         )}
         {icons.ChatIcon}
         {/* badge z liczbą nieprzeczytanych */}
         {unreadCount > 0 && isMinimized && (
           <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 text-white text-[10px] px-1 leading-none">
             {unreadCount}
           </span>
         )}
       </div>
     </div>
  );
}

export default Chat;