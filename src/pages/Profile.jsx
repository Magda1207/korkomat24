import { useState, useEffect } from 'react';
import Header from '../partials/Header';
import ImageCropper from '../partials/Cropper'
import Avatar from '../partials/UserAvatar'
import Breadcrumbs from '../partials/Breadcrumbs';
import Footer from '../partials/Footer';
import { Dialog } from 'primereact/dialog'
import LessonHistory from '../partials/LessonHistory';
import { readFile, dataURLtoFile } from '../partials/functions/helpers'
import icons from '../partials/icons';
import axios from 'axios'
import { useFetch } from '../server/common/apiCalls' // dodaj ten import jeśli jeszcze go nie ma
import learningCoupleImage from '../images/learning4.jpg'; // Dodaj import obrazka

const Profile = ({ loggedIn, setLoggedIn, myStatus }) => {

  const [imageSrc, setImageSrc] = useState()
  const [cropImageDialogVisible, setCropImageDialogVisible] = useState()
  const [croppedImage, setCroppedImage] = useState()
  const [firstAndLastName, setFirstAndLastName] = useState()
  const [email, setEmail] = useState()
  const [phone, setPhone] = useState()
  const [phoneDisplay, setPhoneDisplay] = useState()
  const [lessonHistoryModalVisible, setLessonHistoryModalVisible] = useState(false)

  const [activeLessons] = useFetch('/api/lessons/history?active=1');

  useEffect(() => {
    const firstName = localStorage.getItem('firstName')
    const lastName = localStorage.getItem('lastName')
    const email = localStorage.getItem('email')
    const phone = localStorage.getItem('phone')
    if (firstName && lastName) setFirstAndLastName(firstName + " " + lastName)
    if (email) setEmail(email)
    if (phone) setPhone(phone)
  }, [])

  useEffect(() => {
    if (phone) {
      let phoneDisplay = phone.substring(0, 3) + " " + phone.substring(3, 6) + " " + phone.substring(6, 9)
      setPhoneDisplay(phoneDisplay)
    }
  }, [phone])

  useEffect(() => {
    async function updateProfileImageData() {
      var file = dataURLtoFile(croppedImage, 'profileImage.jpg');
      const formData = new FormData();
      formData.append("images", file);
      await axios.post('/api/upload/profileImage', formData, {
        headers: {
          'Content-Type': 'image/jpeg'
        }
      })
        .then((res) => {
          if (!(res instanceof Error)) location.reload()
        })
    }
    if (croppedImage) updateProfileImageData();
  }, [croppedImage])

  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      let imageDataUrl = await readFile(file)

      setImageSrc(imageDataUrl)
      setCropImageDialogVisible(true)
    }
  }

  const getCroppedImage = (croppedImg) => {
    setCroppedImage(croppedImg)
  }

  const handleRemovePhoto = () => {
    axios.post('/api/upload/removeProfileImage')
      .then((res) => {
        if (!(res instanceof Error)) {
          setCroppedImage(null)
          setImageSrc(null)
          location.reload()
        }
      })
      .catch((error) => {
        console.error("Error removing profile image:", error);
      });
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
        <div className="absolute top-20 left-0 w-full h-full flex items-center justify-center pointer-events-none">
          <div className="text-5xl font-semibold text-white text-center drop-shadow-lg pointer-events-auto tracking-wider">
            Moje konto
          </div>
        </div>
      </div>

      {/*  Site header */}
      <Header loggedIn={loggedIn} setLoggedIn={setLoggedIn}  myStatus={myStatus} lightMode={true}/>

      {/*  Page content */}
      <main className="grow">
        <section className="relative">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="pt-20 pb-12 md:pt-24 md:pb-20">
              {/* Profile Card */}
              <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col sm:flex-row items-center gap-6 mb-8">
                <div className="flex flex-col items-center sm:items-start">
                  <Avatar size="large" />
                  <label
                    htmlFor="getFile"
                    className="self-center mt-3 text-xs font-medium text-blue-600 dark:text-blue-500 hover:underline cursor-pointer transition"
                  >
                    Edytuj zdjęcie
                  </label>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="self-center mt-1 text-xs font-medium text-red-600 hover:underline cursor-pointer transition bg-transparent border-0 p-0"
                  >
                    [x] Usuń 
                  </button>
                  <input
                    id="getFile"
                    className="hidden"
                    type="file"
                    onChange={onFileChange}
                    accept="image/*"
                  />
                  <ImageCropper
                    cropImageDialogVisible={cropImageDialogVisible}
                    imageSrc={imageSrc}
                    setCropImageDialogVisible={setCropImageDialogVisible}
                    getCroppedImage={getCroppedImage}
                  />
                </div>
                <div className="flex-1 flex flex-col items-center sm:items-start mt-4 sm:mt-0">
                  <div className="text-2xl font-semibold text-gray-900 mb-1">{firstAndLastName}</div>
                  <div className="flex items-center text-gray-700 gap-2 mb-1">
                    <span className="w-5 h-5 flex items-center justify-center">{icons.MyProfileEmail}</span>
                    <span className="text-base">{email}</span>
                  </div>
                  <div className="flex items-center text-gray-700 gap-2">
                    <span className="w-5 h-5 flex items-center justify-center">{icons.MyProfilePhone}</span>
                    <span className="text-base">{phoneDisplay}</span>
                  </div>
                </div>
              </div>

              {/* Account Balance Card */}
              <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col gap-4 mb-8">
                <div className="text-lg font-semibold text-gray-900">Stan konta: 98 zł</div>
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center justify-center w-14 h-14">
                    {icons.MyProfileDollar}
                  </span>
                  <div>
                    <div className="flex flex-col gap-2 mt-2 text-blue-600 text-sm font-medium">
                      <a href="#" className="hover:underline flex items-center gap-2">
                        <span className="w-5 h-5 flex items-center">{icons.MoneyIn}</span>
                        Dodaj środki
                      </a>
                      <a href="#" className="hover:underline flex items-center gap-2">
                        <span className="w-5 h-5 flex items-center">{icons.MoneyOut}</span>
                        Wypłać środki
                      </a>
                      <a className="hover:underline flex items-center gap-2 cursor-pointer">
                        <span className="w-5 h-5 flex items-center">{icons.List}</span>
                        Historia transakcji
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/*  Site footer */}
      <Footer />
    </div>
  );
}

export default Profile;