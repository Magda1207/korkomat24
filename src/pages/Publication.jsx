import { useState, useEffect } from 'react';
import 'quill/dist/quill.snow.css';
import Header from '../partials/Header';
import Footer from '../partials/Footer';
import SubjectLevelItem from '../partials/SubjectLevelItem';
import { useFetch } from '../server/common/apiCalls'
import icons from '../partials/icons';
import { restrictNonNumeric } from '../partials/functions/helpers'
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Editor } from "primereact/editor";

import axios from 'axios'
import learningCoupleImage from '../images/learning4.jpg'; // Dodaj import obrazka

const Publication = ({ loggedIn, setLoggedIn, myStatus }) => {
  const [editAboutMe, setEditAboutMe] = useState(false)
  const [editDescription, setEditDescription] = useState(false)
  const [publicationUpdated, setPublicationUpdated] = useState(0)
  const [publication] = useFetch('/api/publication', undefined, [publicationUpdated])
  const [subjects] = useFetch('/api/subjects')
  const [subjectsUpdated, setSubjectsUpdated] = useState(0)
  const [teacherSubjects] = useFetch('/api/teacherSubjects', undefined, [subjectsUpdated, publicationUpdated])
  const [subject, setSubject] = useState('')
  const [price, setPrice] = useState(null)
  const [aboutMe, setAboutMe] = useState('')
  const [description, setDescription] = useState('')
  const [level, setLevel] = useState('')
  //const [deleteConfirmationModalVisible, setDeleteConfirmationModalVisible] = useState(false)
  const [showAddSubjectSection, setShowAddSubjectSection] = useState(false)
  const [isPublished, setIsPublished] = useState()
  const [aboutMeValidationText, setAboutMeValidationText] = useState()
  const [descriptionValidationText, setDescriptionValidationText] = useState()
  const placeholderText = <span className="text-gray-400 italic">Uzupełnij pole</span>
  const [aboutMeMissing, setAboutMeMissing] = useState(false)
  const [descriptionMissing, setDescriptionMissing] = useState(false)
  const [subjectMissing, setSubjectMissing] = useState(false)

  useEffect(() => {
    setAboutMe(publication.aboutMe)
    setDescription(publication.description)
    setIsPublished(publication.isPublished)
  }, [publication])

  useEffect(() => {
    setLevel(false)
    setPrice(null)
  }, [subject])

  useEffect(() => {
    savePublication("isPublished")
  }, [isPublished])

  useEffect(() => {
    setDescriptionMissing(false)
    if (description && (description.includes('https://') || description.includes('http://') || description.includes('www.'))) {
      setDescriptionValidationText("Pole nie może zawierać linków");
      return;
    }
    else if (description && (description.includes('@'))) {
      setDescriptionValidationText("Pole nie może zawierać adresu e-mail");
      return;
    }
    else if (
      description &&
      (
        // 9 cyfr razem
        /\b\d{9}\b/.test(description) ||
        // 3x3 cyfry oddzielone spacją lub myślnikiem
        /\b\d{3}[- ]\d{3}[- ]\d{3}\b/.test(description)
      )
    ) {
      setDescriptionValidationText("Pole nie może zawierać numeru telefonu");
      return;
    }
    else {
      setDescriptionValidationText("");
    }
  }, [description])

  useEffect(() => {
    setAboutMeMissing(false)
    if (aboutMe && (aboutMe.includes('https://') || aboutMe.includes('http://') || aboutMe.includes('www.'))) {
      setAboutMeValidationText("Pole nie może zawierać linków");
      return;
    }
    else if (aboutMe && (aboutMe.includes('@'))) {
      setAboutMeValidationText("Pole nie może zawierać adresu e-mail");
      return;
    }
    else if (
      aboutMe &&
      (
        // 9 cyfr razem
        /\b\d{9}\b/.test(aboutMe) ||
        // 3x3 cyfry oddzielone spacją lub myślnikiem
        /\b\d{3}[- ]\d{3}[- ]\d{3}\b/.test(aboutMe)
      )
    ) {
      setAboutMeValidationText("Pole nie może zawierać numeru telefonu");
      return;
    }
    else {
      setAboutMeValidationText("");
    }
  }, [aboutMe])


  const savePublication = async (field) => {
    let data = {};
    if (field === 'aboutMe') {
      data.aboutMe = aboutMe;
    }
    if (field === 'description') {
      // Clean up empty HTML from the editor
      const isEmpty = !description || description.replace(/<(.|\n)*?>/g, '').trim() === '';
      data.description = isEmpty ? "" : description;
    }
    if (field === 'isPublished') {
      data.isPublished = isPublished;
    }
    await axios.put('/api/publication', data)
      .then(() => {
        if (field === 'aboutMe') setEditAboutMe(false);
        if (field === 'description') setEditDescription(false);
        setPublicationUpdated(prev => prev + 1);
      });
  };

  // const deletePublication = async () => {
  //   await axios.delete('/api/publication')
  //     .then(() => {
  //       setDeleteConfirmationModalVisible(false)
  //       setPublicationUpdated(prev => prev + 1)
  //     })
  // }

  const saveSubject = async () => {
    await axios.put('/api/teacherSubjects', { subjectId: subject, level: level, price: price })
      .then(() => {
        setSubject('Wybierz')
        setShowAddSubjectSection(false)
        setSubjectsUpdated(prev => prev + 1)
        setSubjectMissing(false)
      })
  }

  const deleteSubject = async (subjectId, level) => {
    await axios.delete(`/api/teacherSubjects?subjectId=${subjectId}&level=${encodeURIComponent(level)}`)
      .then(async () => {
        setSubjectsUpdated(prev => prev + 1)
        setSubject('Wybierz')

        // Fetch updated subjects list
        const updatedSubjects = await axios.get('/api/teacherSubjects').then(res => res.data);

        // If no subjects left, set isPublished to false
        if (!updatedSubjects || updatedSubjects.length === 0) {
          setIsPublished(false);
          // Optionally, update backend immediately:
          await axios.put('/api/publication', { isPublished: false });
        }
      })
  }

  const mySubjects = (
    teacherSubjects.map((subject) => (
      <div
        key={subject.id}
        className="p-4 w-full "
      >
        <div className="font-semibold mb-3">{subject.subject}</div>
        <ul className="flex flex-wrap gap-4">
          {subject.levels.map((levelObj, idx) => (
            <SubjectLevelItem
              key={idx}
              subjectId={subject.id}
              levelObj={levelObj}
              onDelete={deleteSubject}
            />
          ))}
        </ul>
      </div>
    ))
  )

  const saveSubjectButtonActive = (
    <button type="button" onClick={saveSubject} className="px-3 py-2 mt-3 mb-3 text-sm font-medium text-center text-white bg-green-500 rounded-xl hover:bg-green-600 focus:ring-4 focus:outline-none focus:ring-green-300">Zapisz przedmiot</button>
  )
  const saveSubjectButtonInactive = (
    <button type="button" className="px-3 py-2 mt-3 mb-3 text-sm font-medium text-center text-white bg-gray-400 rounded-xl hover:bg-gray-500 focus:ring-4 focus:outline-none focus:ring-gray-300">Zapisz przedmiot</button>
  )

  // const handleDeleteConfirmationModalClose = () => {
  //   setDeleteConfirmationModalVisible(false)
  // }

  const addSubjectSection = (
    <div className="bg-gray-100 p-4 rounded-md">
      <div className="grid lg:grid-cols-3 grid-cols-1 gap-4 items-end">
        {/* Przedmiot */}
        <div className="col-span-1 flex flex-col">
          <div className="text-sm font-semibold mb-1">
            Przedmiot<span className="text-red-500">*</span>:
          </div>
          <select id="subject" name="subject" autoComplete="subject-name" value={subject} onChange={(e) => setSubject(e.target.value)}
            className="border rounded-md px-3 py-1 w-full text-sm">
            <option>Wybierz przedmiot</option>
            {subjects.map((x) => <option key={x.subject} value={x.id}>{x.subject}</option>)}
          </select>
          <div className="text-xs text-gray-500 mt-1 invisible">
            Przedmiot, którego uczysz
          </div>
        </div>

        {/* Poziom */}
        <div className="col-span-1 flex flex-col">
          <div className="text-sm font-semibold mb-1">
            Poziom<span className="text-red-500">*</span>:
          </div>
          <select className="border rounded-md px-3 py-1 w-full text-sm" value={level} onChange={(e) => setLevel(e.target.value)}>
            <option >Wybierz poziom</option>
            <option key={1} >Szkoła podstawowa</option>
            <option key={2} >Szkoła średnia</option>
            <option key={4} >Matura - poziom podstawowy</option>
            <option key={5} >Matura - poziom rozszerzony</option>
            <option key={3} >Studia</option>
          </select>
          <div className="text-xs text-gray-500 mt-1 invisible">
            Poziom
          </div>
        </div>

        {/* Cena */}
        <div className="col-span-1 flex flex-col">
          <div className="text-sm font-semibold mb-1">
            Cena (45 minut)<span className="text-red-500">*</span>:
          </div>
          <input
            id="priceInput"
            onKeyDown={restrictNonNumeric}
            min="1"
            max="999"
            type="number"
            placeholder="PLN"
            className="border rounded-md px-3 py-1 w-full text-sm"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <div className="text-xs text-gray-500 mt-1">
            Kwota, która trafi do Ciebie: {price && !isNaN(price) ? (0.9 * Number(price)).toFixed(2) : '0.00'}
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          type="button"
          className="text-blue-600 text-sm font-medium hover:text-blue-800"
          onClick={() => setShowAddSubjectSection(false)}
        >
          Anuluj
        </button>
        {subject && level && price ? saveSubjectButtonActive : saveSubjectButtonInactive}
      </div>
    </div>
  )

  const addSubjectButton = (
    !showAddSubjectSection && (
      <div className="flex flex-wrap gap-4 my-3 pl-4">
        <button
          type="button"
          className={`flex h-16 justify-center items-center py-1 basis-[calc(33.333%-1rem)] min-w-[180px] bg-gray-50 border-2 border-dotted text-blue-600 font-medium rounded-lg shadow-none hover:bg-gray-50 focus:outline-none transition box-border ${subjectMissing ? "border-red-600" : "border-gray-400"}`}
          onClick={() => setShowAddSubjectSection(true)}
        >
          {//<span className="flex items-center group-hover:text-blue-800">{icons.Plus}</span>
          }
          <span>Dodaj przedmiot</span>
        </button></div>
    )
  )

  const aboutMeInputField = (
    <div className="flex flex-wrap -mx-3">
      <div className="w-full px-3">
        <div className="p-inputgroup flex-1">
          <InputText
            id="aboutMeInput"
            maxLength="100"
            type="text"
            placeholder='Nauczyciel z 10-letnim doświadczeniem'
            value={aboutMe}
            onChange={(e) => setAboutMe(e.target.value)}
          />
          <Button icon="pi pi-check" disabled={aboutMeValidationText} onClick={() => savePublication('aboutMe')} />
        </div>
        <span className="flex items-center font-medium tracking-wide text-red-500 text-xs mt-1 ml-1">{aboutMeValidationText}</span>
      </div>
    </div>
  )

  const editorHeader = (
    <span className="ql-formats">
      <select className="ql-header" defaultValue="">
        <option value="1"></option>
        <option value="2"></option>
        <option value=""></option>
      </select>
      <select className="ql-font">
        <option value="sans-serif"></option>
        <option value="serif"></option>
      </select>
      <button className="ql-bold"></button>
      <button className="ql-italic"></button>
      <button className="ql-underline"></button>
      <button className="ql-strike"></button>
      <select className="ql-color"></select>
      <select className="ql-background"></select>
      <button className="ql-list" value="ordered"></button>
      <button className="ql-list" value="bullet"></button>
      <select className="ql-align"></select>
      <button className="ql-image"></button>
      <button className="ql-code-block"></button>
    </span>
  );

  const descriptionInput = (
    <div className="flex flex-wrap -mx-3">
      <div className="w-full px-3 flex items-start">
        <Editor
          value={description}
          onTextChange={(e) => setDescription(e.htmlValue)}
          style={{ height: '320px' }}
          headerTemplate={editorHeader}
          className='w-full'
        />
        <Button
          icon="pi pi-check"
          onClick={() => savePublication('description')}
          className="h-full min-w-[40px] rounded-l-none"
          disabled={descriptionValidationText}
        />
      </div>
      <span className="flex items-center font-medium tracking-wide text-red-500 text-xs px-3 mt-1 ml-1">{descriptionValidationText}</span>
    </div>
  )

  const mySubjectsArea = (
    <div className="flex flex-wrap -mx-3">
      <div className="w-full px-3">
        <div className="font-medium w-full">
          {mySubjects && mySubjects.length > 0 ? (
            <>
              <div className="mb-3">{mySubjects}</div>
              <div>{addSubjectButton}</div>
            </>
          ) : (
            <div className="flex justify-start">{addSubjectButton}</div>
          )}
          {showAddSubjectSection && addSubjectSection}
        </div>
      </div>
    </div >
  )

  const infoModal = (
    <div className="mb-8 col-span-3 p-6 bg-blue-50 border border-blue-200 rounded-lg shadow flex items-center gap-4">
      <div>
        <div className="font-semibold text-blue-900 text-lg mb-1">Nie masz jeszcze ogłoszenia</div>
        <div className="text-blue-900 text-sm mb-2">
          Dodaj swoje ogłoszenie, aby uczniowie mogli Cię znaleźć i zapisać się na lekcje!
        </div>
      </div>
    </div>
  )

  const canPublish =
    aboutMe && aboutMe.trim() !== "" &&
    description && description.trim() !== "" &&
    teacherSubjects.length > 0

  const handlePublishToggle = () => {
    if (canPublish) setIsPublished(!isPublished)
    setAboutMeMissing(!aboutMe || aboutMe.trim() === "")
    setDescriptionMissing(!description || description.trim() === "")
    setSubjectMissing(teacherSubjects.length === 0)
  }

  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-gray-50">
      {/* Obrazek na górze */}
      <div className="relative w-full">
        <div className="w-full h-[32vh] md:h-[25vh] rounded-b-3xl overflow-hidden">
          <img
            src={learningCoupleImage}
            alt="Tło"
            className="w-full h-full object-cover object-center brightness-[0.6] contrast-50"
          />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/60 via-black/30 to-transparent pointer-events-none" />
        </div>
        {/* Nagłówek wyśrodkowany na obrazku */}
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
          <h1 className="text-5xl font-semibold text-white text-center drop-shadow-lg pointer-events-auto tracking-wider">
            Moje ogłoszenie
          </h1>
        </div>
      </div>

      {/*  Site header */}
      <Header loggedIn={loggedIn} setLoggedIn={setLoggedIn} myStatus={myStatus} lightMode={true} />

      {/*  Page content */}
      <main className="grow">

        <section className="relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="pt-8 md:pt-12 pb-12 md:pb-20">
              <div className="grid grid-cols-4">
                {!isPublished && infoModal}
              </div>
              <form>
                <div className="space-y-8">
                  <div className="mt-8 grid grid-cols-4 gap-y-8">
                    <div className="relative border-b border-gray-900/20 pb-2 col-span-3 text-2xl font-semibold text-gray-900">
                      Ogłoszenie
                      <span className="absolute bottom-4 right-0 flex items-center gap-6">
                        {/* Toggle */}
                        <div className="flex items-center">
                          <span className="font-semibold text-base text-gray-700 mr-2">
                            Publikuj
                          </span>
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isPublished}
                              onClick={handlePublishToggle}
                              className="sr-only peer"

                            />
                            <div className={`w-11 h-6 rounded-full transition-colors duration-200 flex items-center
                              ${canPublish
                                ? (isPublished ? "bg-blue-500" : "bg-gray-300")
                                : "bg-gray-200"
                              } peer-focus:outline-none`}>
                              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200
                                ${isPublished ? "translate-x-5" : "translate-x-1"}
                              `}></div>
                            </div>
                          </label>
                        </div>
                      </span>
                    </div>
                    <div className="col-span-3 bg-white rounded-lg shadow-sm p-4">
                      <div className="text-sm mx-4 pt-4 font-medium text-gray-400 border-b border-gray-900/20 ">
                        O mnie <span className="text-red-600">*</span>
                      </div>
                      <div className={`font-medium p-2 px-4 bg-white mt-2 rounded-lg ${aboutMeMissing ? "border border-red-600 text-red-600" : ""}`}>
                        {editAboutMe ? (
                          aboutMeInputField
                        ) : (
                          <div className="flex items-center">
                            <span>{publication.aboutMe || placeholderText}</span>
                            <span
                              className="ml-auto m-2 text-xs font-medium text-blue-600 dark:text-blue-500 hover:cursor-pointer"
                              onClick={() => { setEditAboutMe(!editAboutMe); setEditDescription(false) }}
                            >
                              {icons.Edit}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-sm mx-4 pt-4 font-medium text-gray-400 border-b border-gray-900/20 ">
                        Opis <span className="text-red-600">*</span>
                      </div>
                      <div className={`font-medium p-2 px-4 bg-white mt-2 rounded-lg ${descriptionMissing ? "border border-red-600 text-red-600" : ""}`}>
                        {editDescription ? (descriptionInput)
                          :
                          (
                            <div className="flex items-center">
                              <span
                                dangerouslySetInnerHTML={
                                  publication.description
                                    ? { __html: publication.description }
                                    : undefined
                                }
                              />
                              {!publication.description && placeholderText}
                              <span
                                className="ml-auto m-2 text-xs font-medium text-blue-600 dark:text-blue-500 hover:cursor-pointer"
                                onClick={() => { setEditDescription(!editDescription), setEditAboutMe(false) }}
                              >
                                {icons.Edit}
                              </span>
                            </div>
                          )}
                      </div>
                      <div className="text-sm mx-4 pt-4 font-medium text-gray-400 border-b border-gray-900/20 ">
                        Przedmioty <span className="text-red-600">*</span>
                      </div>
                      <div className="font-medium pt-2">
                        {mySubjectsArea}
                      </div>
                    </div>
                  </div>
                </div>
                {/* <Dialog header="Usuń ogłoszenie" visible={deleteConfirmationModalVisible} style={{ width: '50vw' }} onHide={handleDeleteConfirmationModalClose}>
                  Czy na pewno chcesz usunąć ogłoszenie?
                  <div className='grid grid-cols-4'>
                    <button type="submit" className="min-w-0 col-span-4 rounded-md bg-red-600 px-12 py-3 mt-10 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600" onClick={deletePublication}>Tak, chcę usunąć ogłoszenie</button>
                  </div>
                </Dialog > */}
              </form>
            </div>
          </div>
        </section >
      </main >
      <Footer />
    </div >
  );
}

export default Publication;