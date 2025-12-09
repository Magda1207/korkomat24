import { Link } from 'react-router-dom';

function Footer({ mainPage, roomPage, lightMode }) {

  const footerItems = [
    { label: 'Dane firmy', to: '/company' },
    { label: 'Warunki korzystania z serwisu', to: '/terms' },
    { label: 'Ochrona prywatności', to: '/privacy' },
    { label: 'Kontakt', to: '/contact' },
  ];

  return (
    <footer>
      <div className={`hidden bottom-0 w-full h-12 z-50 ${roomPage&&"sm:absolute "} ${mainPage?"sm:absolute text-white":"bg-neutral-50 text-black shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] "} sm:flex justify-center items-center`}>
        {footerItems.map((item, idx) => (
          <span key={item.to} className="inline-flex items-center">
            <Link to={item.to} className="hover:underline">
              {item.label}
            </Link>
            {idx < footerItems.length - 1 && <span className="mx-2 select-none" aria-hidden>|</span>}
          </span>
        ))}
      </div>
    </footer>
  );
}

export default Footer;
