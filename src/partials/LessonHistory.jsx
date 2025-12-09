import icons from '../partials/icons';
import { useFetch } from '../server/common/apiCalls'
import { useState } from 'react';
import { Dialog } from 'primereact/dialog';

function LessonHistory({ rowsLimit }) {
  const [lessonsHistory] = useFetch('/api/lessons/history?completed=1')
  const [showAll, setShowAll] = useState(false)

  const roleHeader =
    (lessonsHistory || []).some((l) => l?.studentFullName) ? 'Uczeń' : 'Korepetytor';

  const getMaxDateAndHour = (date1, date2) => {
    const d1 = date1 ? new Date(date1) : null;
    const d2 = date2 ? new Date(date2) : null;
    if (!d1 && !d2) return { date: '-', hour: '-' };
    const max = (!d1 || (d2 && d2 > d1)) ? d2 : d1;
    const date = max.toLocaleDateString('pl-PL');
    const hour = max.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    return { date, hour };
  };

  const rows = rowsLimit ? (lessonsHistory || []).slice(0, 4) : (lessonsHistory || []);

  // RENDER TABELI – używane w głównym widoku i w modalu
  const renderTable = (data) => (
    data.length === 0 ? (
      <div className="text-center text-gray-500 py-6">Brak lekcji do wyświetlenia</div>
    ) : (
      <table className="border border-gray-200 rounded-lg w-full">
        <thead className="bg-gray-50 sticky top-0 z-20 shadow-sm">
          <tr>
            <th className="px-4 py-2 font-medium text-gray-700 text-left whitespace-nowrap sticky top-0 bg-gray-50 z-20">{roleHeader}</th>
            <th className="px-4 py-2 font-medium text-gray-700 text-center whitespace-nowrap sticky top-0 bg-gray-50 z-20">Przedmiot</th>
            <th className="px-4 py-2 font-medium text-gray-700 text-center whitespace-nowrap sticky top-0 bg-gray-50 z-20">Data</th>
            <th className="px-4 py-2 font-medium text-gray-700 text-center whitespace-nowrap sticky top-0 bg-gray-50 z-20">Godzina</th>
            <th className="px-4 py-2 font-medium text-gray-700 text-center whitespace-nowrap sticky top-0 bg-gray-50 z-20">Podsumowanie</th>
          </tr>
        </thead>
        <tbody>
          {data.map((lesson) => {
            const { date, hour } = getMaxDateAndHour(lesson.userStartedDateUtc, lesson.teacherStartedDateUtc);
            const pdfAvailable = !!lesson.lessonSummaryPdf;
            return (
              <tr key={lesson.id} className="border-t">
                <td className="px-4 py-2 text-left">
                  {lesson.studentFullName || lesson.teacherFullName}
                </td>
                <td className="px-4 py-2 text-center">{lesson.subject || '-'}</td>
                <td className="px-4 py-2 text-center">{date}</td>
                <td className="px-4 py-2 text-center">{hour}</td>
                <td className="px-4 py-2">
                  <div className="flex justify-center items-center">
                    {pdfAvailable ? (
                      <a
                        href={lesson.lessonSummaryPdf}
                        target="_blank"
                        title="Pobierz PDF"
                        className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-red-50 transition-colors"
                        style={{ textDecoration: 'none' }}
                      >
                        <span className="text-red-600 text-xl">{icons.Pdf}</span>
                      </a>
                    ) : (
                      <span
                        className="inline-flex items-center justify-center w-8 h-8 rounded text-gray-300 opacity-60 cursor-not-allowed"
                        title="Brak podsumowania"
                        aria-disabled="true"
                      >
                        <span className="text-xl">{icons.Pdf}</span>
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    )
  );

  return (
    <div className="min-w-0 max-h-72 overflow-y-auto">
      {renderTable(rows)}
    </div>
  );
}

export default LessonHistory;
