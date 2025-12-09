import { useEffect, useState } from 'react';

import Filters from './Filters'
import TeachersListItem from './TeachersListItem'
import LoadingSpinner from './LoadingSpinner'
import { useFetch } from '../server/common/apiCalls'

const FindTeacherContent = ({ socket, loggedIn, isTeacher, displayOnModal }) => {

  const [subject, setSubject] = useState()
  const [level, setLevel] = useState()
  const [rate, setRate] = useState()
  const [active, setActive] = useState()
  const [priceFromFilter, setPriceFromFilter] = useState()
  const [priceToFilter, setPriceToFilter] = useState()
  const [teacherName, setTeacherName] = useState()
  const [sort, setSort] = useState("-createdDateUtc")
  const [teachers, loading] = useFetch('/api/teachers', { subject, level, rate, priceFrom: priceFromFilter, priceTo: priceToFilter }, [subject, level, rate, priceFromFilter, priceToFilter])
  const [allActiveSocketUsers, setAllActiveSocketUsers] = useState([])
  const [sortedTeachers, setSortedTeachers] = useState([])
  const [sortedTeachersWithStatuses, setSortedTeachersWithStatuses] = useState([])
  const [teachersFilteredByName, setTeachersFilteredByName] = useState([])

  useEffect(() => {
    socket.emit('get_all_socket_users');
  }, [])

  useEffect(() => {
    socket.on('all_socket_clients', (data) => {
      setAllActiveSocketUsers(data)
    });
  }, [socket])


  useEffect(() => {
    setSortedTeachers([...sortedTeachers.sort(dynamicSort(sort))])
  }, [sort])

  useEffect(() => {
    setSortedTeachers(teachers.sort(dynamicSort(sort)))
  }, [teachers])

  useEffect(() => {
    if (teacherName) setTeachersFilteredByName(sortedTeachersWithStatuses.filter(x => x.name.toLowerCase().includes(teacherName.toLowerCase())))
  }, [teacherName, sortedTeachersWithStatuses])

  //everytime user loads the list or active socket list is changing, get statuses from socket and assign them to teachers
  useEffect(() => {
    var statusesAssinged = sortedTeachers.map(x => {
      var socketUser = allActiveSocketUsers.find(socketUser => socketUser.userId === x.id)
      var status = allActiveSocketUsers.find(socketUser => socketUser.userId === x.id)?.status
      x.status = status || 'inactive'
      x.socketId = socketUser ? socketUser.socketId : null
      return x
    }
    );
    var statusOrder = { active: 2, busy: 1, inactive: 0 };
    var sortActiveFirst = statusesAssinged.sort((a, b) => (statusOrder[b.status] || 0) - (statusOrder[a.status] || 0));

    setSortedTeachersWithStatuses(sortActiveFirst)

  }, [sortedTeachers, allActiveSocketUsers])


  const getSubject = (sub) => {
    setSubject(sub)
  }

  const getLevel = (level) => {
    setLevel(level)
  }

  const getTeachername = (name) => {
    setTeacherName(name)
  }

  const getRate = (rate) => {
    setRate(rate)
  }

  const getActive = (act) => {
    if (!act) setActive(null)
    else setActive(act)
  }

  const getPriceFrom = (priceFrom) => {
    setPriceFromFilter(priceFrom)
  }

  const getPriceTo = (priceTo) => {
    setPriceToFilter(priceTo)
  }

  function dynamicSort(property) {
    var sortOrder = 1;
    if (property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
    }
    return function (a, b) {
      var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
      return result * sortOrder;
    }
  }

  const sortElement = (
    <div className="grid grid-cols-5 m-2">
      <label htmlFor="level" className="block text-left ml-2 col-start-5 text-sm font-medium leading-6 text-gray-900">Sortowanie:</label>
      <div className="col-start-5">
        <select id="level" name="level" value={sort} onChange={(e) => setSort(e.target.value)} autoComplete="level-name" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset sm:max-w-xs sm:text-sm sm:leading-6">
          <option value="-createdDateUtc">Domyślne</option>
          <option value="priceMin">Cena: od najniższej</option>
          <option value="-priceMax">Cena: od najwyższej</option>
          <option value="-rate">Ocena: od najwyższej</option>
          <option value="-totalReviews">Liczba ocen: od najwyższej</option>
        </select>
      </div>
    </div>
  )

  const renderTeachers = () => {
    const list = teacherName ? teachersFilteredByName : sortedTeachersWithStatuses;
    const filtered = list.filter(teacher => !active || teacher.status === 'active');
    if (filtered.length === 0) {
      return <div>Brak wyników spełniających kryteria.</div>;
    }
    return (<>
      
      {filtered.map(teacher => {
        return (
          <TeachersListItem
            key={teacher.id}
            teacherDetails={teacher}
            socket={socket}
            loggedIn={loggedIn}
            isTeacher={isTeacher}
            selectedSubject={subject}
            selectedLevel={level}
          />
        );
      })}
    </>
    )
  };

  return (
    <section className="relative">
      {/* Gradient background
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#34C759] via-[#e0f7fa] to-[#007AFF] opacity-70" />
       */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* if !displayOnModal then pt-20 */}
        <div className={`pb-6 sticky top-10 z-20 ${displayOnModal ? '' : 'pt-20'}`}>
          <div className="relative w-full mx-auto">
            <div className="absolute inset-0 rounded-2xl bg-white shadow-xl border border-gray-200" />
            <div className="relative z-10 p-8">
              <Filters
                getSubject={getSubject}
                getLevel={getLevel}
                getRate={getRate}
                getActive={getActive}
                getPriceFrom={getPriceFrom}
                getPriceTo={getPriceTo}
                getTeachername={getTeachername}
              />
            </div>
          </div>
          <div className="pl-4 text-lg text-gray-700">
          {sortElement}
          </div>
        </div>
        {/* Calculate h to fit the screen */}
        <div className={`relative overflow-auto  ${displayOnModal ? 'h-[calc(100vh-460px)] top-7' : 'h-[calc(100vh-370px)] top-10 rounded-lg'} custom-scrollbar `}>
          <div className="sticky top-0 z-30 pointer-events-none h-4" />
          {loading ? <LoadingSpinner /> : (
            <div className="space-y-4 px-2 py-2">
              {renderTeachers()}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default FindTeacherContent;