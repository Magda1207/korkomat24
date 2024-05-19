import React from 'react';

import HeroImage from '../images/landing-page-image.png';

function HeroHome() {
  return (
    <section>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        {/* Hero content */}
        <div className="relative pt-32 pb-10 md:pt-40 md:pb-16">
          {/* Section header */}
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-16">
            <h1 className="h1 mb-4" data-aos="fade-up">
              Korkomat
            </h1>
            <p className="text-xl text-gray-400 mb-8" data-aos="fade-up" data-aos-delay="200">
              Sprawdzian już jutro? Spotkaj się z korepetytorem nawet zaraz.
            </p>
            <div className="max-w-xs mx-auto sm:max-w-none sm:flex sm:justify-center">
              <div data-aos="fade-up" data-aos-delay="400">
                <a className="btn text-white bg-amber-500 hover:bg-amber-600 w-full mb-4 sm:w-auto sm:mb-0" href="/korkomat24/form">
                  Wchodzę!
                </a>
              </div>
            </div>
          </div>

          {/* Hero image */}
          <div>
            <div className="relative flex justify-center items-center" data-aos="fade-up" data-aos-delay="200">
              <img className="mx-auto -z-50" src={HeroImage} width="1024" height="504" alt="Hero" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroHome;
