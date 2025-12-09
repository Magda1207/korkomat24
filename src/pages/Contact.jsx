import Header from '../partials/Header';
import Footer from '../partials/Footer';
import HeaderImage from '../partials/HeaderImage';
import { useState } from 'react';
import axios from 'axios';


function Contact() {
	const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
	const [sent, setSent] = useState(false);
	const [error, setError] = useState('');

	const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		if (!form.name || !form.email || !form.message) {
			setError('Uzupełnij wymagane pola.');
			return;
		}
		try {
			// TODO: wyślij na backend (np. /api/contact)
			await axios.post('/api/contact', form);
			setSent(true);
		} catch {
			setError('Nie udało się wysłać wiadomości. Spróbuj ponownie.');
		}
	};

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
							{/* Ramka z formularzem kontaktowym */}
							<div className="bg-white/90 backdrop-blur rounded-2xl border border-gray-200 shadow-xl p-6 md:p-8 w-full max-w-3xl mx-auto">
								<div className="mb-6">
									<h1 className="text-2xl font-bold tracking-tight text-gray-900">
										Formularz kontaktowy
									</h1>
									<div className="mt-2 h-1 bg-emerald-500 rounded-full"></div>
								</div>
								{sent ? (
									<div className="text-emerald-600 font-medium">Dziękujemy! Twoja wiadomość została wysłana.</div>
								) : (
									<form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
										{error && <div className="text-sm text-red-600">{error}</div>}
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<label htmlFor="name" className="block text-sm font-medium text-gray-700">Imię i nazwisko*</label>
												<input
													id="name"
													name="name"
													value={form.name}
													onChange={handleChange}
													className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
												/>
											</div>
											<div>
												<label htmlFor="email" className="block text-sm font-medium text-gray-700">Email*</label>
												<input
													id="email"
													name="email"
													type="email"
													value={form.email}
													onChange={handleChange}
													className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
												/>
											</div>
										</div>
										<div>
											<label htmlFor="subject" className="block text-sm font-medium text-gray-700">Temat</label>
											<input
												id="subject"
												name="subject"
												value={form.subject}
												onChange={handleChange}
												className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
											/>
										</div>
										<div>
											<label htmlFor="message" className="block text-sm font-medium text-gray-700">Wiadomość*</label>
											<textarea
												id="message"
												name="message"
												rows={5}
												value={form.message}
												onChange={handleChange}
												className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
											/>
										</div>
										<div className="flex items-center justify-between pt-2">
											<p className="text-xs text-gray-500">Pola oznaczone * są wymagane.</p>
											<button
												type="submit"
												className="inline-flex items-center rounded-lg bg-emerald-500 text-white text-sm font-semibold px-4 py-2 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
											>
												Wyślij
											</button>
										</div>
									</form>
								)}
							</div>

						</div>
					</div>
				</section>
			</main>
			<Footer />
		</div>
	);
}

export default Contact;