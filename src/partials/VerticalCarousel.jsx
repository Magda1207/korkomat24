import React from "react";
import "../css/additional-styles/VerticalCarousel.css";
import teacher1 from '../images/teacher1.jpg';
import teacher2 from '../images/teacher2.jpg';
import teacher3 from '../images/teacher3.jpg';
import teacher4 from '../images/teacher4.jpg';
import teacher5 from '../images/teacher5.jpg';

const items = [
  {
    img: teacher1,
    name: "Martyna Majewska",
    desc: "Nauczyciel z 15-letnim doświadczeniem",
    subjects: ["chemia", "biologia"]
  },
  {
    img: teacher2,
    name: "Jan Kowalski",
    desc: "Nauki ścisłe to moja pasja!",
    subjects: ["matematyka", "informatyka"]
  },
  {
    img: teacher3,
    name: "Anna Nowak",
    desc: "Przygotowanie do matury i egzaminów",
    subjects: ["matematyka", "fizyka"]
  },
  {
    img: teacher4,
    name: "Piotr Zieliński",
    desc: "Zapraszam na korepetycje online",
    subjects: ["historia", "wos"]
  },
  {
    img: teacher5,
    name: "Maria Wiśniewska",
    desc: "Ze mną nauka języków to przyjemność",
    subjects: ["język angielski", "język hiszpański"]
  }
];

export default function VerticalCarousel() {
  return (
    <div className="carousel h-[30vh] select-none">
      <div className="carousel__wrap">
        {[...items, ...items].map((item, index) => (
          <div className="carousel__item flex items-center gap-2 rounded-lg p-1 shadow" key={index}>
            <img
              src={item.img}
              alt={item.name}
              className="w-16 h-16 rounded object-cover border border-gray-300"
            />
            <div className="flex flex-col flex-1">
              <span className="font-semibold text-black text-[0.9rem]">{item.name}</span>
              <div className="flex justify-between items-center">
                <span className="text-sm text-black text-[0.8rem]">{item.desc}</span>
                <button className="bg-[#3c9ef19c] mr-2 text-white px-3 py-0.5 rounded-full shadow transition text-[0.85rem] cursor-default">Zaproś</button>
              </div>
              <div className="flex gap-1 mt-1">
                {item.subjects.map((subject, i) => (
                  <span key={i} className="bg-gray-100 text-gray-700 text-xs px-1.5 py-0.5 rounded text-[0.7rem]">{subject}</span>
                ))}
                
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}