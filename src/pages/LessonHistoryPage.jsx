import Header from '../partials/Header';
import Footer from '../partials/Footer';
import HeaderImage from '../partials/HeaderImage';
import { useEffect, useState } from 'react';
import axios from 'axios';
import LessonHistory from '../partials/LessonHistory';
import AddOpinionModal from '../partials/AddOpinionModal';


function LessonHistoryPage({ loggedIn, setLoggedIn, myStatus }) {
    const [missingReviews, setMissingReviews] = useState([]);
    const [hiddenBannerIds, setHiddenBannerIds] = useState({});
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [displayReviewModal, setDisplayReviewModal] = useState(false);

    useEffect(() => {
        if (!loggedIn) return;
        axios
            .get('/api/missingReviewsLastMonth')
            .then((response) => {
                const list = response.data?.response || [];
                setMissingReviews(list);
            })
            .catch((err) => {
                console.error('Failed to fetch missing reviews:', err);
            });
    }, [loggedIn]);

    const closeBanner = (id) =>
        setHiddenBannerIds((prev) => ({ ...prev, [id]: true }));

    const openOpinionModal = (t) => {
        setSelectedTeacher(t);
        setDisplayReviewModal(true);
    };

    const handleOpinionModalClose = () => {
        setDisplayReviewModal(false);
        setSelectedTeacher(null);
    };

    return (
        <div className="flex flex-col min-h-screen overflow-hidden relative">
            {/* Obrazek na górze */}
            <HeaderImage />

            {/*  Site header */}
            <Header lightMode={true} loggedIn={loggedIn} setLoggedIn={setLoggedIn} myStatus={myStatus} />

            {/*  Page content */}
            <main className="grow relative z-10 mt-10 mb-6">
                <section className="relative">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        <div className="pt-8 md:pt-12">

                            {/* BANERY Z PROŚBĄ O OPINIĘ */}
                            {loggedIn && missingReviews
                                .filter((t) => !hiddenBannerIds[t.id])
                                .map((t) => (
                                    <div
                                        key={t.id}
                                        className="mb-4 w-full rounded-xl border border-amber-300 bg-amber-50 shadow-sm px-6 py-5 relative flex flex-col items-center text-center"
                                    >
                                        <button
                                            type="button"
                                            aria-label="Zamknij"
                                            onClick={() => closeBanner(t.id)}
                                            className="absolute top-2 right-2 text-amber-600/70 hover:text-amber-700 transition"
                                        >
                                            ×
                                        </button>
                                        <p className="text-sm text-amber-900 mb-4 max-w-xl">
                                            Nie dodałeś jeszcze opinii dla korepetytora{' '}
                                            <span className="font-semibold">
                                                {t.FirstName} {t.LastName}
                                            </span>.
                                            Czy chcesz dodać opinię?
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => openOpinionModal(t)}
                                            className="inline-flex items-center rounded-md bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-5 py-2 shadow-sm"
                                        >
                                            Dodaj opinię
                                        </button>
                                    </div>
                                ))}

                            {/* Ramka historia lekcji */}
                            <div className="bg-white/90 backdrop-blur rounded-2xl border border-gray-200 shadow-xl p-6 md:p-8 w-full mx-auto">
                                <div className="mb-6">
                                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                                        Historia Lekcji
                                    </h1>
                                    <div className="mt-2 h-1 bg-emerald-500 rounded-full"></div>
                                </div>
                                {loggedIn ? <LessonHistory /> : null}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />

            {/* Modal dodawania opinii */}
            {displayReviewModal && selectedTeacher && (
                <AddOpinionModal
                    displayReviewModal={displayReviewModal}
                    teacher={{
                        teacherUserId: selectedTeacher.id,
                        teacherName: `${selectedTeacher.FirstName} ${selectedTeacher.LastName}`,
                    }}
                />
            )}
        </div>
    );
}

export default LessonHistoryPage;