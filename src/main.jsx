import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router } from 'react-router-dom';
import App from './App';
import { PrimeReactProvider } from "primereact/api";
import FirebaseInitializer from './partials/FirebaseInitializer';


ReactDOM.createRoot(document.getElementById('root')).render(
  //<React.StrictMode>
  <Router>
    <FirebaseInitializer>
      <PrimeReactProvider>
        <App />
      </PrimeReactProvider>
    </FirebaseInitializer>
  </Router>
  // </React.StrictMode>
);
