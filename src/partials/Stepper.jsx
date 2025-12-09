import { useState, useRef, useEffect } from 'react';
import { Steps } from 'primereact/steps';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { useFetch } from '../server/common/apiCalls'

const Stepper = () => {
  const [userInfo] = useFetch('api/user/info')
  const [publication] = useFetch('/api/publication')
  const [profileImage, setProfileImage] = useState()

  const items = [
    {
      label: 'Załóż konto',
      template: (item) => itemRenderer(item),
      done: true,
      number: 1
    },
    {
      label: 'Dodaj zdjęcie profilowe',
      template: (item) => itemRenderer(item),
      done: profileImage ? true : false,
      number: 2,
      href: "#/profile",
    },
    {
      label: 'Dodaj ogłoszenie',
      template: (item) => itemRenderer(item),
      done: publication?.isPublished ? true : false,
      number: 3,
      href: "#/publication",
    },
    {
      label: 'Gotowe!',
      template: (item) => itemRenderer(item),
      done: profileImage && publication ? true : false,
      number: 4
    }
  ];

  useEffect(() => {
    if (userInfo) setProfileImage(userInfo.profileImage)
  }, [userInfo])

  const itemRenderer = (item) => {
    const done = item.done
    const href = !done ? item.href : undefined;
    return (
      <a href={href} className="p-menuitem-link" tabIndex="-1" data-pc-section="action">
        <span className={`p-steps-number ${done && 'bg-emerald-400 text-white'} `} data-pc-section="step">{item.number}</span>
        <span className="p-steps-title font-normal" data-pc-section="label">{item.label}</span>
      </a>
    );
  };

  return (
    !profileImage || !publication ?
      <div className="card my-4"><Card>
        <h4 className="h4 mb-8">Gratulacje! Twoje konto jest prawie gotowe:</h4>
        
          <Steps model={items} readOnly={false} />
        </Card>
      </div>
      : null
  )
}

export default Stepper;
