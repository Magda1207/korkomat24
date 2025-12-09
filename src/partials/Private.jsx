import Cookies from 'js-cookie';
import SignIn from '../pages/SignIn';
import Home from '../pages/Home';
import { useEffect, useState } from 'react'

const Private = ({ Component, setLoggedIn, loggedIn, socket, isConnected, teacherOnly, isTeacher, invitationStatusUpdated, myStatus }) => {
    const auth = Cookies.get('loggedIn')
    const [prevUrl, setPrevUrl] = useState()

    useEffect(() => {
        setPrevUrl(window.location.hash)
    })

    return !auth ? <SignIn prevUrl={prevUrl} loggedIn={loggedIn} setLoggedIn={setLoggedIn} socket={socket}/> : teacherOnly && isTeacher!== "1" ? <Home loggedIn={loggedIn} setLoggedIn={setLoggedIn} socket={socket} isConnected={isConnected}  myStatus={myStatus}/> : <Component  loggedIn='true' setLoggedIn={setLoggedIn} socket={socket} isConnected={isConnected}  isTeacher={isTeacher} invitationStatusUpdated={invitationStatusUpdated}  myStatus={myStatus}/> 
}

export default Private