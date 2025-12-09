import axios from 'axios'
import { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog'

function AddOpinionModal( { displayReviewModal, teacher } ) {
  const [review, setReview] = useState({ rating: 0, comment: '' });
  const [sendingReview, setSendingReview] = useState(false);
  const [reviewSent, setReviewSent] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  const MAX_COMMENT = 400;
  const charsLeft = MAX_COMMENT - (review.comment?.length || 0);
  const getInitials = (name) =>
    (name || '?')
      .trim()
      .split(/\s+/)
      .map((s) => s[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  const handleReviewModalClose = () => {
    setReviewModalVisible(false)
    location.reload()
  }

  useEffect(() => {
    if (displayReviewModal) setReviewModalVisible(true);
  }, [displayReviewModal]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!review.rating) {
      setReviewError('Wybierz ocenę.');
      return;
    }
    if (!teacher?.teacherUserId) {
      setReviewError('Brak danych korepetytora. Odśwież stronę i spróbuj ponownie.');
      return;
    }

    setSendingReview(true);
    setReviewError('');
    setReviewSent(false);

    try {
      await axios.post(
        '/api/opinion',
        {
          rate: review.rating,
          comment: review.comment?.trim(),
          teacherUserId: teacher.teacherUserId,
        },
        { validateStatus: (s) => s >= 200 && s < 300 }
      );
      setReviewSent(true);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (err?.response?.status ? `Błąd ${err.response.status}.` : 'Wystąpił błąd.');
      setReviewError(`Nie udało się zapisać opinii. ${msg}`);
    } finally {
      setSendingReview(false);
    }
  };

  return (
    <Dialog
      header="Dodaj opinię"
      visible={reviewModalVisible}
      onHide={handleReviewModalClose}
      modal
      dismissableMask
      draggable={false}
      resizable={false}
      style={{ width: '520px', maxWidth: '92vw' }}
      breakpoints={{ '960px': '75vw', '640px': '92vw' }}
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600/10 text-green-700 font-semibold">
            {getInitials(teacher?.teacherName)}
          </div>
          <div>
            <div className="text-sm text-left text-gray-500">Korepetytor</div>
            <div className="text-base text-left font-semibold text-gray-900">
              {teacher?.teacherName || 'Nieznany'}
            </div>
          </div>
        </div>

        {reviewSent ? (
          <div>
            <div className="w-full rounded-lg border border-green-300 bg-green-50 px-4 py-3 mb-5 text-sm text-green-900">
              Dziękujemy! Opinia została zapisana.
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
                onClick={handleReviewModalClose}
              >
                OK
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submitReview} className="flex flex-col gap-5">
            <div className="flex w-full justify-center">
              <div className="relative inline-flex items-center gap-3" role="group" aria-label="Ocena">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setReview((prev) => ({ ...prev, rating: n }))}
                    className={`text-3xl leading-none transition-transform hover:scale-110 ${review.rating >= n ? 'text-yellow-400' : 'text-gray-300'}`}
                    aria-pressed={review.rating >= n}
                    aria-label={`${n} ${n === 1 ? 'gwiazdka' : 'gwiazdek'}`}
                  >
                    ★
                  </button>
                ))}
                <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 text-sm text-gray-600 min-w-[38px] text-center">
                  {review.rating ? `${review.rating}/5` : ''}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-end mb-2">
                <span className={`text-xs ${charsLeft < 20 ? 'text-gray-700' : 'text-gray-500'}`}>
                  {Math.max(0, charsLeft)}/{MAX_COMMENT}
                </span>
              </div>
              <textarea
                className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                rows="5"
                maxLength={MAX_COMMENT}
                placeholder="Podziel się krótką informacją zwrotną."
                value={review.comment}
                onChange={(e) => setReview((prev) => ({ ...prev, comment: e.target.value }))}
              />
            </div>

            {reviewError && (
              <div
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                role="alert"
              >
                {reviewError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                className="rounded-md px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
                onClick={handleReviewModalClose}
                disabled={sendingReview}
              >
                Anuluj
              </button>
              <button
                type="submit"
                disabled={sendingReview}
                className="inline-flex items-center rounded-md bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-60"
              >
                {sendingReview ? 'Wysyłanie…' : 'Opublikuj'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Dialog>
  );
}

export default AddOpinionModal;
