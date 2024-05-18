
import React, { useRef, useState, useEffect } from 'react';
import { SpeedDial } from 'primereact/speeddial';
import { Toast } from 'primereact/toast';

import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.css';


const ColorPaletteSpeedDial = ({ getSelectedColor }) => {
  const toast = useRef(null);
  const [color, setColor] = useState('black');

  useEffect(() => {
    getSelectedColor(color)
  }, [color])

  const items = [
    {
      label: 'Czarny',
      className: 'bg-black',
      command: () => {
        setColor('black')
      }
    },
    {
      label: 'Zielony',
      className: 'bg-green-600',
      command: () => {
        setColor('green')
      }
    },
    {
      label: 'Niebieski',
      className: 'bg-blue-700',
      command: () => {
        setColor('blue')
      }
    },
    {
      label: 'Fioletowy',
      className: 'bg-violet-800',
      command: () => {
        setColor('DarkViolet')
      }
    },
    {
      label: 'Czerwony',
      className: 'bg-red-600',
      command: () => {
        setColor('red')
      }
    }
  ];

  return (
    <div className="w-full h-full max-w-full max-h-full box-border">
      <div className="absolute bottom-0 right-0 m-7">
      <Toast ref={toast} />
        <SpeedDial model={items} radius={120} showIcon="pi pi-palette text-[22px]" type="quarter-circle" direction="up-left" buttonClassName="bg-yellow-400 border-0" className="speeddial-bottom-right right-0 bottom-0 z-50"  />
      </div>
    </div>
  )
}

export default ColorPaletteSpeedDial