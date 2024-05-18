import { React, useState, useEffect } from 'react';

import Header from '../partials/Header';
import PageIllustration from '../partials/PageIllustration';
import ImageCropper from '../partials/Cropper'
import Avatar from '../partials/Avatar'

import axios from 'axios'

function readFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(reader.result), false)
    reader.readAsDataURL(file)
  })
}

function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[arr.length - 1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

const Profile = ({ loggedIn, setLoggedIn }) => {

  const [imageSrc, setImageSrc] = useState()
  const [cropImageDialogVisible, setCropImageDialogVisible] = useState()
  const [croppedImage, setCroppedImage] = useState()

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
        .then(() => {
          console.log("Profile image updated")
        })
        .catch(e => {
          if (e.response.status == 400) {
            console.log(e.response.data.description)
          }
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

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">

      {/*  Site header */}
      <Header loggedIn={loggedIn} setLoggedIn={setLoggedIn} />

      {/*  Page content */}
      <main className="grow">

        {/*  Page illustration */}
        <div className="relative max-w-6xl mx-auto h-0 pointer-events-none" aria-hidden="true">
          <PageIllustration />
        </div>

        <section className="relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="pt-32 pb-12 md:pt-40 md:pb-20">


              {/* htmlForm */}

              <form>
                <div className="space-y-12">
                  <div className="border-b border-gray-900/10 pb-12">
                    <h2 className="text-base font-semibold leading-7 text-gray-900">Mój Profil</h2>


                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                      <div className="col-span-full">
                        <label htmlFor="photo" className="block text-sm font-medium leading-6 text-gray-900">Zdjęcie profilowe</label>
                        <div className="mt-2 flex items-center gap-x-3">
                          <Avatar />
                          <label htmlFor="getFile" className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow">
                            Wybierz zdjęcie
                          </label>
                          <input id='getFile' className="hidden" type="file" onChange={onFileChange} accept="image/*" />
                          <ImageCropper cropImageDialogVisible={cropImageDialogVisible} imageSrc={imageSrc} setCropImageDialogVisible={setCropImageDialogVisible} getCroppedImage={getCroppedImage} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/*    <div className="border-b border-gray-900/10 pb-12">
      <h2 className="text-base font-semibold leading-7 text-gray-900">Mój Profil</h2>
      <p className="mt-1 text-sm leading-6 text-gray-600">Use a permanent address where you can receive mail.</p>

      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">First name</label>
          <div className="mt-2">
            <input type="text" name="first-name" id="first-name" autoComplete="given-name" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="last-name" className="block text-sm font-medium leading-6 text-gray-900">Last name</label>
          <div className="mt-2">
            <input type="text" name="last-name" id="last-name" autoComplete="family-name" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
          </div>
        </div>

        <div className="sm:col-span-4">
          <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">Email address</label>
          <div className="mt-2">
            <input id="email" name="email" type="email" autoComplete="email" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
          </div>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="country" className="block text-sm font-medium leading-6 text-gray-900">Country</label>
          <div className="mt-2">
            <select id="country" name="country" autoComplete="country-name" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6">
              <option>United States</option>
              <option>Canada</option>
              <option>Mexico</option>
            </select>
          </div>
        </div>

        <div className="col-span-full">
          <label htmlFor="street-address" className="block text-sm font-medium leading-6 text-gray-900">Street address</label>
          <div className="mt-2">
            <input type="text" name="street-address" id="street-address" autoComplete="street-address" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
          </div>
        </div>

        <div className="sm:col-span-2 sm:col-start-1">
          <label htmlFor="city" className="block text-sm font-medium leading-6 text-gray-900">City</label>
          <div className="mt-2">
            <input type="text" name="city" id="city" autoComplete="address-level2" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="region" className="block text-sm font-medium leading-6 text-gray-900">State / Province</label>
          <div className="mt-2">
            <input type="text" name="region" id="region" autoComplete="address-level1" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="postal-code" className="block text-sm font-medium leading-6 text-gray-900">ZIP / Postal code</label>
          <div className="mt-2">
            <input type="text" name="postal-code" id="postal-code" autoComplete="postal-code" className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
          </div>
        </div>
      </div>
  </div> 

    <div className="border-b border-gray-900/10 pb-12">
      <h2 className="text-base font-semibold leading-7 text-gray-900">Notifications</h2>
      <p className="mt-1 text-sm leading-6 text-gray-600">We'll always let you know about important changes, but you pick what else you want to hear about.</p>

      <div className="mt-10 space-y-10">
        <fieldset>
          <legend className="text-sm font-semibold leading-6 text-gray-900">By Email</legend>
          <div className="mt-6 space-y-6">
            <div className="relative flex gap-x-3">
              <div className="flex h-6 items-center">
                <input id="comments" name="comments" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
              </div>
              <div className="text-sm leading-6">
                <label htmlFor="comments" className="font-medium text-gray-900">Comments</label>
                <p className="text-gray-500">Get notified when someones posts a comment on a posting.</p>
              </div>
            </div>
            <div className="relative flex gap-x-3">
              <div className="flex h-6 items-center">
                <input id="candidates" name="candidates" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
              </div>
              <div className="text-sm leading-6">
                <label htmlFor="candidates" className="font-medium text-gray-900">Candidates</label>
                <p className="text-gray-500">Get notified when a candidate applies htmlFor a job.</p>
              </div>
            </div>
            <div className="relative flex gap-x-3">
              <div className="flex h-6 items-center">
                <input id="offers" name="offers" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
              </div>
              <div className="text-sm leading-6">
                <label htmlFor="offers" className="font-medium text-gray-900">Offers</label>
                <p className="text-gray-500">Get notified when a candidate accepts or rejects an offer.</p>
              </div>
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-sm font-semibold leading-6 text-gray-900">Push Notifications</legend>
          <p className="mt-1 text-sm leading-6 text-gray-600">These are delivered via SMS to your mobile phone.</p>
          <div className="mt-6 space-y-6">
            <div className="flex items-center gap-x-3">
              <input id="push-everything" name="push-notifications" type="radio" className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600" />
              <label htmlFor="push-everything" className="block text-sm font-medium leading-6 text-gray-900">Everything</label>
            </div>
            <div className="flex items-center gap-x-3">
              <input id="push-email" name="push-notifications" type="radio" className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600" />
              <label htmlFor="push-email" className="block text-sm font-medium leading-6 text-gray-900">Same as email</label>
            </div>
            <div className="flex items-center gap-x-3">
              <input id="push-nothing" name="push-notifications" type="radio" className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600" />
              <label htmlFor="push-nothing" className="block text-sm font-medium leading-6 text-gray-900">No push notifications</label>
            </div>
          </div>
        </fieldset>
      </div>
    </div>
*/}

                </div>

                {/*  <div className="mt-6 flex items-center justify-end gap-x-6">
    <button type="button" className="text-sm font-semibold leading-6 text-gray-900">Cancel</button>
    <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Save</button>
  </div>*/}
              </form>

              {/* htmlForm */}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

export default Profile;