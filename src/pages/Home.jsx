import React, { useEffect, useState } from 'react';

import Header from '../partials/Header';
import HeroHome from '../partials/HeroHome';
import Footer from '../partials/Footer';

function Home({ loggedIn, setLoggedIn, isTeacher, myStatus }) {

  return (
        <div className="flex flex-col min-h-dvh overflow-hidden">
          {/*  Site header */}
          <Header loggedIn={loggedIn} setLoggedIn={setLoggedIn} myStatus={myStatus} lightMode={true} />

          {/*  Page content */}
          <main className="grow">
            <HeroHome isTeacher={isTeacher} loggedIn={loggedIn} />
          </main>
          {/*  Site footer */}
          <Footer mainPage={true} />
        </div>
  );
}

export default Home;