import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter  as Router } from 'react-router-dom';
import App from './App';
import { PrimeReactProvider } from "primereact/api";

import axios from 'axios'
//import.meta.env.VITE_REACT_APP_BASE_URL

//axios.defaults.baseURL = process.env.VITE_REACT_APP_BASE_URL;
axios.defaults.baseURL= process.env.NODE_ENV === 'production' ? "https://api.magda1207.smallhost.pl" :"/"

ReactDOM.createRoot(document.getElementById('root')).render(
  //<React.StrictMode>
    <Router basename={"/korkomat24/"}>
    <PrimeReactProvider>
        <App />
      </PrimeReactProvider>
    </Router>
 // </React.StrictMode>
);
