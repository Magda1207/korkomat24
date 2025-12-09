import { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';

const InviteATeacherModal = ({
    teacherDetails,
    confirmationModalVisible,
    defaultSubject,
    defaultLevel,
    closeModal,
    inviteTeacher
}) => {
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');

    useEffect(() => {
        setSelectedSubject(defaultSubject || '');
        setSelectedLevel(defaultLevel || '');
    }, [defaultSubject, defaultLevel]);

    // Find price for selected subject and level
    let selectedPrice = null;
    if (selectedSubject && selectedLevel) {
        const subj = teacherDetails.subjects.find(s => s.subject === selectedSubject);
        if (subj) {
            const lvl = subj.levels.find(l => l.level === selectedLevel);
            if (lvl) selectedPrice = lvl.price;
        }
    }

    const handleModalClose = () => {
        closeModal();
    };

    return (
        <Dialog
            header={<span className="text-2xl font-semibold text-gray-900">Zaproś korepetytora: {teacherDetails.name}</span>}
            visible={confirmationModalVisible}
            style={{ width: '100%', maxWidth: 500 }}
            onHide={handleModalClose}
            className="!rounded-2xl"
            resizable={false}
        >

            <div className="flex gap-6 mb-8 mt-8">
                {/* Przedmiot */}
                <div className="flex-1">
                    <div className="text-base font-medium mb-2 text-gray-600">Przedmiot</div>
                    {defaultSubject ? (
                        <div className="border border-gray-300 rounded-xl py-3 px-5 bg-white text-base font-semibold text-gray-800 text-center">
                            {defaultSubject}
                        </div>
                    ) : (
                        <select
                            id="subject"
                            name="subject"
                            autoComplete="subject-name"
                            className="border border-gray-300 rounded-xl py-3 px-5 w-full text-base font-semibold text-gray-800 bg-white"
                            value={selectedSubject}
                            onChange={e => {
                                setSelectedSubject(e.target.value);
                                setSelectedLevel('');
                            }}
                        >
                            <option value="">Wybierz przedmiot</option>
                            {teacherDetails.subjects.map((x) => (
                                <option key={x.subject} value={x.subject}>{x.subject}</option>
                            ))}
                        </select>
                    )}
                </div>
                {/* Poziom */}
                <div className="flex-1">
                    <div className="text-base font-medium mb-2 text-gray-600">Poziom</div>
                    {defaultLevel ? (
                        <div className="border border-gray-300 rounded-xl py-3 px-5 bg-white text-base font-semibold text-gray-800 text-center">
                            {defaultLevel}
                        </div>
                    ) : (
                        <select
                            className="border border-gray-300 rounded-xl py-3 px-5 w-full text-base font-semibold text-gray-800 bg-white"
                            value={selectedLevel}
                            onChange={e => setSelectedLevel(e.target.value)}
                            disabled={!selectedSubject}
                        >
                            <option value="">Wybierz poziom</option>
                            {selectedSubject &&
                                teacherDetails.subjects
                                    .find(s => s.subject === selectedSubject)
                                    ?.levels.map((lvl, idx) => (
                                        <option key={idx} value={lvl.level}>{lvl.level}</option>
                                    ))}
                        </select>
                    )}
                </div>
            </div>
            {/* Cena za godzinę */}
            <div className="rounded-xl border border-gray-200 bg-white py-8 px-4 mb-8 flex flex-col items-center">
                <div className="text-base text-gray-500 mb-2">Cena za 45 min:</div>
                <div className="text-5xl font-bold text-gray-800 leading-none">
                    {selectedPrice !== null ? (
                        <>
                            {selectedPrice} zł
                        </>
                    ) : (
                        <span className="text-2xl font-semibold text-gray-400">—</span>
                    )}
                </div>
            </div>
            <div className="flex">
                <button
                    type="button"
                    id={teacherDetails.id}
                    className="flex-1 rounded-xl bg-green-600 px-12 py-4 text-lg font-semibold text-white shadow-sm hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                    onClick={() => inviteTeacher(teacherDetails.id, selectedSubject, selectedLevel, selectedPrice)}
                    disabled={
                        !selectedSubject ||
                        !selectedLevel ||
                        selectedPrice === null
                    }
                >
                    Wyślij zaproszenie
                </button>
            </div>
        </Dialog>
    );
};

export default InviteATeacherModal;