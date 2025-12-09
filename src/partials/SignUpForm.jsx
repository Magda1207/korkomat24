import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom';
import Footer from '../partials/Footer';
import Header from './Header';
import VerifyPhoneNumberModal from './VerifyPhoneNumberModal';
import HeaderImage from './HeaderImage';
import axios from 'axios';

function SignUp({ isTeacher: isTeacherProp }) {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [signUpSuccessfull, setSignUpSuccessfull] = useState()
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneValidationMessage, setPhoneValidationMessage] = useState();
  const [phoneNumberDisplay, setPhoneNumberDisplay] = useState('');
  const [passwordValidationMessage, setPasswordValidationMessage] = useState();
  const [confirmPasswordValidationMessage, setConfirmPasswordValidationMessage] = useState();
  const [emailValidationMessage, setEmailValidationMessage] = useState();
  const [firstNameValidationMessage, setFirstNameValidationMessage] = useState();
  const [lastNameValidationMessage, setLastNameValidationMessage] = useState();
  const [userInfo, setUserInfo] = useState();
  const [isTeacher, setIsTeacher] = useState(isTeacherProp || false);
  const [verifyPhoneNumberModalVisible, setVerifyPhoneNumberModalVisible] = useState(false);
  var re = /\S+@\S+\.\S+/;



  const handleSubmit = async (e) => {
    var formValidated = validateForm()

    if (formValidated) {
      e.preventDefault()
      const firstNameTrim = firstName.trim()
      const lastNameTrim = lastName.trim()
      await axios.post('/api/signup', { email, firstName: firstNameTrim, lastName: lastNameTrim, phoneNumber, password, isTeacher })

        .then((res) => {
          if (!(res instanceof Error)) {
            // localStorage.setItem('email', email)
            // localStorage.setItem('firstName', firstName)
            // localStorage.setItem('lastName', lastName)
            // localStorage.setItem('phone', phoneNumber)
            // localStorage.setItem('isTeacher', isTeacher)
            setSignUpSuccessfull(true)
          }
        })
    }
  }

  // Get user information after signing up
  useEffect(() => {
    if (signUpSuccessfull) {
      (async () => {
        const result = await axios.get('/api/user/info')
        setUserInfo(result.data)
        setVerifyPhoneNumberModalVisible(true)
      })()
    }
  }, [signUpSuccessfull])

  useEffect(() => {
    if (phoneNumber.length <= 3) setPhoneNumberDisplay(phoneNumber)
    else if (phoneNumber.length <= 6) setPhoneNumberDisplay(phoneNumber.substring(0, 3) + ' ' + phoneNumber.substring(3, 6))
    else if (phoneNumber.length <= 9) setPhoneNumberDisplay(phoneNumber.substring(0, 3) + ' ' + phoneNumber.substring(3, 6) + ' ' + phoneNumber.substring(6, 9))
    else setPhoneNumberDisplay(phoneNumber.substring(0, 3) + ' ' + phoneNumber.substring(3, 6) + ' ' + phoneNumber.substring(6, 9) + ' ' + phoneNumber.substring(9))
  }, [phoneNumber])


  useEffect(() => {
    if (userInfo) {
      localStorage.setItem('email', userInfo.email)
      localStorage.setItem('phone', userInfo.phoneNumber)
      localStorage.setItem('isTeacher', userInfo.isTeacher)
      localStorage.setItem('firstName', userInfo.firstName)
      localStorage.setItem('lastName', userInfo.lastName)
      if (userInfo.room) localStorage.setItem('room', userInfo.room)
      else localStorage.removeItem('room')
      //if(userInfo.accessCode) 
      localStorage.setItem('accessCode', userInfo.accessCode)
      //else localStorage.removeItem('accessCode')
      localStorage.setItem('userId', userInfo.id)
      setIsTeacher(userInfo.isTeacher)
      //navigate('/', { replace: true });
    }
  }, [userInfo]);


  useEffect(() => {
    if (password === confirmPassword) setConfirmPasswordValidationMessage('')
  }, [confirmPassword, password]);

  const checkConfirmPassword = () => {
    if (!confirmPassword) setConfirmPasswordValidationMessage("Potwierdź hasło")
    else if (password !== confirmPassword) setConfirmPasswordValidationMessage("Hasła nie są takie same. Spróbuj ponownie.")
    else setConfirmPasswordValidationMessage('')
  }

  const checkEmail = () => {
    if (email && !re.test(email)) setEmailValidationMessage('Niepoprawny email')
    else setEmailValidationMessage("")
  }

  const checkFirstName = () => {
    if (firstName) setFirstNameValidationMessage('')
  }

  const checkLastName = () => {
    if (lastName) setLastNameValidationMessage('')
  }

  const checkPassword = () => {
    const strengthMsg = validatePasswordStrength(password);
    if (strengthMsg) {
      setPasswordValidationMessage(strengthMsg);
      return;
    }
    if (password) setPasswordValidationMessage('');
    if (confirmPassword && password !== confirmPassword) setConfirmPasswordValidationMessage("Hasła nie są takie same. Spróbuj ponownie.");
  }

  const checkPhone = () => {
    if (phoneNumber && phoneNumber.length !== 9 || phoneNumber === '000000000') setPhoneValidationMessage('Nieprawidłowy numer telefonu')
    else setPhoneValidationMessage('')
  }

  const validateForm = () => {
    if (!email) setEmailValidationMessage("Podaj email")
    if (!password) setPasswordValidationMessage("Podaj hasło")
    else {
      const strengthMsg = validatePasswordStrength(password);
      if (strengthMsg) setPasswordValidationMessage(strengthMsg);
    }
    if (!confirmPassword) setConfirmPasswordValidationMessage("Potwierdź hasło")
    if (!firstName) setFirstNameValidationMessage("Podaj imię")
    if (!lastName) setLastNameValidationMessage("Podaj nazwisko")
    if (!phoneNumber) setPhoneValidationMessage("Podaj numer telefonu")
    if (re.test(email) && password && password === confirmPassword && firstName && lastName && phoneNumber.length === 9 && !validatePasswordStrength(password)) return 1
  }

  const updatePhoneNumber = (e) => {
    if (e.ctrlKey) { return; }
    if (e.key.length > 1) { return; }
    if (/[0-9]/.test(e.key)) { return; }
    e.preventDefault();
  }

  const validatePasswordStrength = (password) => {
    if (password.length < 8) {
      return "Hasło musi mieć co najmniej 8 znaków.";
    }
    if (!/[A-Z]/.test(password)) {
      return "Hasło musi zawierać przynajmniej jedną wielką literę.";
    }
    if (!/[0-9]/.test(password)) {
      return "Hasło musi zawierać przynajmniej jedną cyfrę.";
    }
    return "";
  }

  return (
    <div className="flex flex-col min-h-screen overflow-hidden relative bg-gray-50">
      {/* Obrazek na górze */}
      <HeaderImage />
      {/*  Site header */}
      <Header lightMode={true} />

      {/*  Page content */}
      {/* dodane pb-24 / md:pb-32 aby karta nie nachodziła na Footer */}
      <main className="flex flex-col grow relative z-10 pb-3">
        <section className="relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="pt-8 md:pt-12">
              {/* Ramka */}
              <div className="max-w-2xl mx-auto -mt-64 relative z-50">
                <div className="bg-white/95 dark:bg-gray-900/75 border border-emerald-100 dark:border-emerald-800 rounded-2xl shadow-2xl p-8 backdrop-blur-sm mb-8">
                  <div className="mb-6 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Nowe konto</h2>
                  </div>

                  {/* Toggle (Uczeń / Korepetytor) */}
                  <div className="flex justify-center mb-6">
                    <div className="flex bg-emerald-500 rounded-full p-1 w-full max-w-sm">
                      <button
                        type="button"
                        className={`flex-1 py-2 rounded-full text-lg font-semibold transition 
                          ${!isTeacher ? 'bg-white text-gray-900 shadow' : 'text-white'}`}
                        onClick={() => setIsTeacher(false)}
                      >
                        Uczeń
                      </button>
                      <button
                        type="button"
                        className={`flex-1 py-2 rounded-full text-lg font-semibold transition 
                          ${isTeacher ? 'bg-white text-gray-900 shadow' : 'text-white'}`}
                        onClick={() => setIsTeacher(true)}
                      >
                        Korepetytor
                      </button>
                    </div>
                  </div>

                  {/* Form */}
                  <div className="max-w-xl mx-auto">
                    <form onSubmit={handleSubmit} noValidate >
                      <div className="flex flex-wrap -mx-3 mb-4">
                        <div className="w-full px-3">
                          <label className="block text-gray-300 text-sm font-medium mb-1" htmlFor="email">E-mail <span className="text-red-600">*</span></label>
                          <input id="email" type="email" autoComplete="email" placeholder='email@domena.com' onBlur={checkEmail} className="form-input w-full text-gray-900" value={email} onChange={(e) => setEmail(e.target.value)} required />
                          <span className="flex items-center font-medium tracking-wide text-red-500 text-xs mt-1 ml-1">{emailValidationMessage}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap -mx-3 mb-4">
                        <div className="w-full px-3">
                          <label className="block text-gray-300 text-sm font-medium mb-1" htmlFor="password">Hasło <span className="text-red-600">*</span></label>
                          <input id="password" type="password" autoComplete="new-password" placeholder='Utwórz nowe hasło' onBlur={checkPassword} className="form-input w-full text-gray-900" value={password} onChange={(e) => setPassword(e.target.value)} required />
                          <span className="flex items-center font-medium tracking-wide text-red-500 text-xs mt-1 ml-1">{passwordValidationMessage}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap -mx-3 mb-4">
                        <div className="w-full px-3">
                          <label className="block text-gray-300 text-sm font-medium mb-1" htmlFor="password">Potwierdź hasło <span className="text-red-600">*</span></label>
                          <input id="repeat-password" type="password" autoComplete="new-password" placeholder='Potwierdź hasło' className="form-input w-full text-gray-900" onBlur={checkConfirmPassword} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                          <span className="flex items-center font-medium tracking-wide text-red-500 text-xs mt-1 ml-1">{confirmPasswordValidationMessage}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap -mx-3 mb-4">
                        <div className="w-full px-3">
                          <label className="block text-gray-300 text-sm font-medium mb-1" htmlFor="full-name">Imię <span className="text-red-600">*</span></label>
                          <input id="first-name" autoComplete="given-name" type="text" placeholder='Podaj imię' onBlur={checkFirstName} className="form-input w-full text-gray-900" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                          <span className="flex items-center font-medium tracking-wide text-red-500 text-xs mt-1 ml-1">{firstNameValidationMessage}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap -mx-3 mb-4">
                        <div className="w-full px-3">
                          <label className="block text-gray-300 text-sm font-medium mb-1" htmlFor="full-name">Nazwisko <span className="text-red-600">*</span></label>
                          <input id="last-name" autoComplete="family-name" type="text" placeholder='Podaj nazwisko' onBlur={checkLastName} className="form-input w-full text-gray-900" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                          <span className="flex items-center font-medium tracking-wide text-red-500 text-xs mt-1 ml-1">{lastNameValidationMessage}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap -mx-3 mb-4">
                        <div className="w-full px-3">
                          <label className="block text-gray-300 text-sm font-medium mb-1" htmlFor="company-name">Numer telefonu <span className="text-red-600">*</span></label>
                          <div className="flex items-center">
                            <button id="dropdown-phone-button" data-dropdown-toggle="dropdown-phone" className="flex-shrink-0 z-10 mr-2 inline-flex items-center py-2.5 px-4 text-m text-center form-input text-gray-900" type="button">
                              PL (+48)
                            </button>
                            <label htmlFor="phone-input" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Numer telefonu:</label>
                            <div className="relative w-full">
                              <input
                                type="text"
                                onKeyDown={updatePhoneNumber}
                                autoComplete="tel-national"
                                data-grouplength='4'
                                id="phone-input"
                                style={{ MozAppearance: "textfield" }}
                                onBlur={checkPhone}
                                className="form-input w-full text-gray-900"
                                placeholder="500-000-000"
                                value={phoneNumberDisplay}
                                onChange={e => {
                                  const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
                                  setPhoneNumber(digits);
                                }}
                                required
                              />
                            </div>
                          </div>
                          <span className="flex items-center font-medium tracking-wide text-red-500 text-xs mt-1 ml-1">{phoneValidationMessage}</span>
                        </div>
                      </div>
                      {// Terms and Conditions / Privacy Policy
                        //<div className="text-sm text-gray-500 text-center">
                        // I agree to be contacted by Open PRO about this offer as per the Open PRO <Link to="#" className="underline text-gray-400 hover:text-gray-200 hover:no-underline transition duration-150 ease-in-out">Privacy Policy</Link>.
                        //</div>
                      }
                      <div className="flex flex-wrap -mx-3 mt-6">
                        <div className="w-full px-3">
                          <button className="btn text-white bg-emerald-500 hover:bg-emerald-700 w-full">Utwórz konto {isTeacher ? "korepetytora" : "ucznia"} </button>
                        </div>
                      </div>
                    </form>
                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
                      <p className="text-gray-600 dark:text-gray-300">Masz już konto? <Link to="/signin" className="text-emerald-800 dark:text-emerald-300 hover:text-emerald-500 transition">Zaloguj się</Link></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <VerifyPhoneNumberModal phoneNumber={phoneNumber} modalVisible={verifyPhoneNumberModalVisible} />
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default SignUp;