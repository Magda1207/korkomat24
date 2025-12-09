import { React, useEffect, useState } from 'react';

import Header from '../partials/Header';
import PageIllustration from '../partials/PageIllustration';

const AllSocketUsers = ({ socket, isConnected }) => {

  const [clients, setClients] = useState([])

  // useEffect(() => {
  //   if (!isConnected) {
  //     socket.connect()
  //   }
  // })

  useEffect(() => {
    socket.on('all_socket_clients', (data) => {
      setClients(data)
    });
  }, [socket])

  const getSocketUsers = () => {
    socket.emit('get_all_socket_users');
  }

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">

      {/*  Site header */}
      <Header />

      {/*  Page content */}
      <main className="grow">
        {/*  Page illustration */}
        <div className="relative max-w-6xl mx-auto h-0 pointer-events-none" aria-hidden="true">
          <PageIllustration />
        </div>
        <section className="relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="pt-28 pb-12">
              Sockets from server:
              <table className="table table-auto border-collapse border border-slate-400">
                <thead>
                  <tr>
                    <th className='border border-slate-300'>Socket id</th>
                    <th className='border border-slate-300'>Room id</th>
                    <th className='border border-slate-300'>User id</th>
                    <th className='border border-slate-300'>Is teacher?</th>
                  </tr>
                </thead>
                <tbody>
                {clients && clients.map((client) =>
                  <tr>
                    <td className='border border-slate-300'>{client.socketId}</td>
                    <td className='border border-slate-300'>{client.room}</td>
                    <td className='border border-slate-300'>{client.userId}</td>
                    <td className='border border-slate-300'>{client.isTeacher}</td>
                  </tr>
                  )}
                </tbody>
              </table>
              <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mt-5 rounded-full' onClick={getSocketUsers}>Pobierz połączonych użytkowników</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AllSocketUsers;