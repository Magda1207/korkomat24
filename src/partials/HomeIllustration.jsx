import React from 'react';

function HomeIllustration() {
  return (
    <>
      {/* Wave background */}
      <svg className="absolute z-10 bottom-0 w-full h-1/2 lg:h-2/5 md:h-2/5 sm:h-1/3" preserveAspectRatio='none' viewBox="0 0 1440 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path opacity="0.9" d="M-5 55.4121C276.562 -64.7653 356.784 55.4125 758.417 55.4121C1160.05 55.4117 1209.34 -49.7874 1506.1 70.1562C1802.87 190.1 1506.1 339 1506.1 339H-5V55.4121Z" stroke="url(#paint0_linear_74_19)" strokeWidth="3" />
        <path opacity="0.78" d="M1 64.2913C269.538 -46.6143 346.049 64.2916 729.103 64.2913C1112.16 64.2909 1159.16 -32.7919 1442.2 77.8978C1725.24 188.588 1442.2 326 1442.2 326H1V64.2913Z" fill="url(#paint1_linear_74_19)" />
        <defs>
          <linearGradient id="paint0_linear_74_19" x1="-5" y1="170.5" x2="1638" y2="170.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#5EB365" />
            <stop offset="1" stopColor="#1867B0" />
          </linearGradient>
          <linearGradient id="paint1_linear_74_19" x1="1" y1="170.5" x2="1568" y2="170.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#34C759" />
            <stop offset="1" stopColor="#007AFF" />
          </linearGradient>
        </defs>
      </svg>
    </>
  );
}

export default HomeIllustration;
