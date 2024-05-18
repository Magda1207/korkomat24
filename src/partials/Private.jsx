import Cookies from 'js-cookie';
import SignIn from '../pages/SignIn';

const Private = ({ Component, setLoggedIn, loggedIn, socket, isConnected }) => {
    const auth = Cookies.get('loggedIn')
    const prevUrl = location.pathname
    return auth ? <Component  loggedIn='true' setLoggedIn={setLoggedIn} socket={socket} isConnected={isConnected} /> : <SignIn prevUrl={prevUrl} loggedIn={loggedIn} setLoggedIn={setLoggedIn} socket={socket}/> 
}

export default Private