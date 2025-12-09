import { useState, useEffect } from 'react';

import SubjectLevelItem from './SubjectLevelItem';
import TeacherAvatar from './TeacherAvatar';
import axios from 'axios';

const TeacherPublicationOverview = ({ teacherDetails }) => {
  const [teacherInitial, setTeacherInitial] = useState()
  const placeholderText = <span className="text-gray-400 italic">Brak informacji</span>
  const [teacherReviews, setTeacherReviews] = useState([]);

  const aboutMeValue = teacherDetails.aboutMe || placeholderText;
  const descriptionValue = teacherDetails.description || placeholderText;
  const teacherSubjects = teacherDetails.subjects || placeholderText;

  useEffect(() => {
    setTeacherInitial(
      teacherDetails.name.slice(0, 1) +
      teacherDetails.name.slice(teacherDetails.name.indexOf(' ') + 1, teacherDetails.name.indexOf(' ') + 2)
    )
    axios.get('/api/teacherRates?teacherUserId=' + teacherDetails.id)
      .then((response) => {
        setTeacherReviews(response.data);
      }).catch((error) => {
        console.error('Error fetching teacher reviews:', error);
      });
  }, [])

  const mySubjects = (
    teacherSubjects.map((subject) => (
      <div
        key={subject.subject}
        className="p-4 w-full text-left"
      >
        <div className="font-semibold mb-3">{subject.subject}</div>
        <ul className="flex flex-wrap gap-4">
          {subject.levels.map((levelObj) => (
            <SubjectLevelItem
              key={subject.subject + '-' + levelObj.level}
              subjectId={subject.subject}
              levelObj={levelObj}
              readOnly={true}
            />
          ))}
        </ul>
      </div>
    ))
  )

  return (
    <div className="flex flex-col overflow-hidden">
      <main className="grow">
        <section className="relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div>
              <form>
                <div className="space-y-4">
                  {/* Top section: Avatar + AboutMe */}
                  <div className="flex items-center gap-6 mb-8">
                    <div className="flex-shrink-0 ml-6">
                      <TeacherAvatar
                        status={teacherDetails.status}
                        profileImage={teacherDetails.profileImage}
                        teacherInitial={teacherInitial}
                      />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-900 mb-2">{teacherDetails.name}</div>
                      <div className="text-lg font-medium text-gray-900 break-words text-left">
                        {aboutMeValue}
                      </div>
                    </div>
                  </div>
                  {/* Rest of content full width */}
                  <div className="w-full bg-white rounded-lg p-4">
                    <div className="text-sm mx-4 pt-4 font-medium text-gray-400 border-b border-gray-900/20 text-left">
                      Opis
                    </div>
                    <div className="font-medium p-2 px-4 bg-white mt-2 rounded-lg">
                      <div className="flex items-center">
                        <span
                          dangerouslySetInnerHTML={
                            descriptionValue
                              ? { __html: descriptionValue }
                              : null
                          }
                        />

                      </div>
                    </div>
                    <div className="text-sm mx-4 pt-4 font-medium text-gray-400 border-b border-gray-900/20 text-left">
                      Przedmioty
                    </div>
                    <div className="font-medium pt-2 flex flex-col items-start">
                      {mySubjects && mySubjects.length > 0 ? (
                        <div className="mb-3 w-full">{mySubjects}</div>
                      ) : null}
                    </div>

                    {/* Opinie */}
                    {(() => {
                      const totalReviews = Array.isArray(teacherReviews) ? teacherReviews.length : 0;
                      const avgRating = totalReviews
                        ? teacherReviews.reduce((sum, r) => sum + (Number(r?.rate) || 0), 0) / totalReviews
                        : 0;

                      return (
                        <>
                          <div className="text-sm mx-4 pt-4 font-medium text-gray-400 border-b border-gray-900/20 text-left">
                            Opinie
                          </div>
                          <div className="pt-2 text-left mx-4">
                            {totalReviews ? (
                              <>
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map(n => (
                                      <span key={n} className={n <= Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-700 font-medium">
                                    {avgRating.toFixed(1)} / 5
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    ({totalReviews})
                                  </span>
                                </div>
                                <ul className="divide-y divide-gray-200">
                                  {teacherReviews.map((r, idx) => {
                                    const rating = Number(r?.rate) || 0;
                                    const firstName = (r?.FirstName ?? '').trim();
                                    const lastName = (r?.LastName ?? '').trim();
                                    const lastInitial = lastName ? `${lastName.charAt(0).toUpperCase()}.` : '';
                                    const name = (firstName || lastInitial) ? `${firstName} ${lastInitial}`.trim() : 'Użytkownik';
                                    return (
                                      <li key={r?.id ?? idx} className="py-3">
                                        <div className="flex items-center justify-between">
                                          <div className="text-sm font-medium text-gray-900">{name}</div>
                                          <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map(n => (
                                              <span key={n} className={n <= rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                                            ))}
                                            <span className="text-xs text-gray-600 ml-1">{rating}/5</span>
                                          </div>
                                        </div>
                                        <div className="mt-1">
                                          {r?.comment}
                                        </div>
                                      </li>
                                    )
                                  })}
                                </ul>
                              </>
                            ) : (
                              <div className="text-sm text-gray-500 text-left">Brak opinii.</div>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section >
      </main >
    </div >
  );
}

export default TeacherPublicationOverview;