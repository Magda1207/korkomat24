import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import Header from '../partials/Header';
import Footer from '../partials/Footer';
import HeaderImage from '../partials/HeaderImage';

const faqData = [
	{
		question: 'Jak zacząć udzielać korepetycji online?',
		answer: 'To proste - załóż konto korepetytora, podaj swoją stawkę i czekaj na zaproszenia od uczniów. Pamiętaj, że aby dostawać zaproszenia, musisz być zalogowany.',
	},
	{
		question: 'Jak przebiega lekcja?',
		answer:
			'Po otrzymaniu zaproszenia dołączasz do wirtualnej tablicy i zapoznajesz się z uczniem i materiałem który chce przerobić. Jeśli jesteście zdecydowani, klikacie "Rozpocznij lekcję" i działacie. Lekcja trwa 45 minut.',
	},
	{
		question: 'Kiedy dostanę płatność za odbyte lekcje?',
		answer:
			'W dowolnym momencie możesz wypłacić środki z konta korepetytora na swoje konto bankowe.',
	},
	{
		question: 'Czy za odbyte lekcje muszę płacić podatki?',
		answer:
			'Tak, jako korepetytor jesteś zobowiązany do płacenia podatków od swoich dochodów. Zalecamy skonsultowanie się z doradcą podatkowym w celu uzyskania szczegółowych informacji.',
	},
	{
		question: 'Co jeszcze muszę wiedzieć?',
		answer:
			'Zapoznaj się z Regulaminem Serwisu - znajdziesz w nim wszystkie potrzebne informacje. Jeśli masz dodatkowe pytania, skontaktuj sie z nami.',
	},
];

function FAQList() {
	const [openIndex, setOpenIndex] = useState(null);

	return (
		<div className="bg-white rounded-xl shadow-md p-8 max-w-2xl mx-auto">
			<h2 className="text-2xl font-bold text-center mb-6 tracking-wide">
				Najczęstsze pytania
			</h2>
			<ul>
				{faqData.map((item, idx) => (
					<li key={idx} className="border-b border-gray-200 py-4">
						<button
							className="flex justify-between items-center w-full text-lg font-medium text-gray-900 focus:outline-none"
							onClick={() =>
								setOpenIndex(openIndex === idx ? null : idx)
							}
						>
							<span>{item.question}</span>
							<span className="text-2xl font-bold">
								{openIndex === idx ? '−' : '+'}
							</span>
						</button>
						{openIndex === idx && (
							<div className="mt-3 text-gray-700 text-base">
								{item.answer}
							</div>
						)}
					</li>
				))}
			</ul>
			{/* Przyciski przeniesione do ramki FAQ */}
			<div className="flex flex-wrap -mx-3 mt-8">
				<div className="w-full px-3 flex justify-center">
					<Link
						to="/teacherSignUp"
						className="inline-block text-white bg-stone-800 hover:bg-stone-700 tracking-wider py-2 px-6 rounded-xl shadow-lg text-base transition duration-150 ease-in-out border border-gray-900"
					>
						Utwórz konto korepetytora
					</Link>
				</div>
			</div>
			<div className="text-gray-700 text-center mt-2">
				Masz już konto?{' '}
				<Link
					to="/signin"
					className="text-blue-900 underline hover:text-blue-950 transition duration-150 ease-in-out font-medium"
				>
					Zaloguj się
				</Link>
			</div>
		</div>
	);
}

function StartTeaching() {
	return (
		<div className="flex flex-col min-h-screen overflow-hidden relative">
			{/* Obrazek na górze */}
			<HeaderImage />

			{/*  Site header */}
			<Header lightMode={true} />

			{/*  Page content */}
			<main className="grow relative z-10 -mt-28 mb-6">
				<section className="relative">
					<div className="max-w-6xl mx-auto px-4 sm:px-6">
						<div className="pt-8 md:pt-12">
							{/* FAQ z przyciskami w środku */}
							<FAQList />
						</div>
					</div>
				</section>
			</main>
			<Footer />
		</div>
	);
}

export default StartTeaching;