import { useEffect, useState, useRef, useImperativeHandle } from 'react';
import pdfMake from "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
import logo from '../images/logo.png';
import * as fabric from 'fabric';
import axios from 'axios';

import { readFile } from './functions/helpers'

const PdfMaker = ({ innerRef, teacher, lessonStartedDate }) => {
  const [logoUrl, setLogoUrl] = useState();
  const logoUrlRef = useRef();
  const dd = useRef();

  useEffect(() => {
    logoUrlRef.current = logoUrl;
  }, [logoUrl]);

  useEffect(() => {
    logoBase64()
  }, [])

  const logoBase64 = async () => {
    const blob = await fetch(logo).then(r => r.blob());
    await readFile(blob).then(r => {
      setLogoUrl(r)
    })
  }

  function waitForLogo(ref) {
    console.log("wait for logo called")
    return new Promise(resolve => {
      console.log("1", ref.current)
      if (ref.current) return resolve();
      const interval = setInterval(() => {
        console.log("2", ref.current)
        if (ref.current) {
          console.log("3", ref.current)
          clearInterval(interval);
          console.log("4", ref.current)
          resolve();
        }
      }, 50);
    });
  }

  const imageJsonFiles = async () => {
    var jsonFiles = []
    await axios.get('/api/lessonJsonFiles')
      .then((r) => {
        const response = r.data
        response.forEach((json) => {
          jsonFiles.push(json.content)
        }
        )
      })
    return jsonFiles
  }

  function getRequiredCanvasSize(json) {
    let maxRight = 595;
    let maxBottom = 0;

    json.objects.forEach(obj => {
      const left = obj.left || 0;
      const top = obj.top || 0;
      const width = obj.width || 0;
      const height = obj.height || 0;
      const scaleX = obj.scaleX || 1;
      const scaleY = obj.scaleY || 1;

      const effectiveWidth = width * scaleX;
      const effectiveHeight = height * scaleY;

      const right = left + effectiveWidth;
      const bottom = top + effectiveHeight;

      if (right > maxRight) maxRight = right;
      if (bottom > maxBottom) maxBottom = bottom;
    });

    return {
      width: Math.ceil(maxRight),
      height: Math.ceil(maxBottom)
    };
  }

  const loadFabricJsonToImage = async (json) => {
    let imageData
    const canvas = new fabric.StaticCanvas('canvasID');
    const { width, height } = getRequiredCanvasSize(json);

    canvas.set({
      width: width,
      height: height,
    });

    await canvas.loadFromJSON(json)
      .then(() => {
        imageData = canvas.toDataURL();
      })
    return imageData;
  }

  const convertJsonFilesToImages = async (jsonFiles) => {
    const images = [];
    for (const json of jsonFiles) {
      // Pomiń puste JSON-y
      if (!json.objects || json.objects.length === 0) continue;

      const imageData = await loadFabricJsonToImage(json);
      // Pomiń, jeśli imageData jest pusty lub niepoprawny
      if (!imageData || imageData === "data:,") continue;

      const imageObject = {
        image: imageData,
        width: 450,
        margin: 5,
        alignment: 'left'
      }

      images.push(imageObject)
    }
    return images;
  };

  const createPdfFile = async (room, jsonFiles) => {
    const images = await convertJsonFilesToImages(jsonFiles);

    dd.current = {
      info: {
        title: 'Korki24 - Podsumowanie Spotkania',
      },
      pageMargins: [40, 60, 40, 60],
      header: () => ({
        layout: "noBorders",
        alignment: 'center',
        table: {
          widths: [200, 'auto', 'auto'],
          body: [
            [
              { image: logoUrlRef.current, width: 80, height: 60, alignment: 'left', margin: [50, 0, 0, 0] },
              { text: lessonStartedDate.split('T', 1)[0], alignment: 'right', color: 'gray', margin: [0, 20, 0, 0], opacity: 0.7 },
              { text: `Korepetytor: ${teacher}`, alignment: 'right', color: 'gray', margin: [0, 20, 0, 0], opacity: 0.7 },
            ],
          ],
        },
      }),
      footer: (currentPage, pageCount) => ({
        text: `${currentPage} z ${pageCount}`,
        alignment: 'center',
        margin: [0, 10, 0, 0],
        color: 'gray',
      }),
      content: {
        table: {
          widths: ['*'],
          body: images.map((img) => [
            {
              image: img.image,
              width: img.width
            },
          ]),
        }
      } // Add the images to the PDF content
    };

    const pdfGen = pdfMake.createPdf(dd.current);

    // Save or send the PDF
    pdfGen.getBase64((data) => {
      postToServer(data, room);
    });
  };

  const postToServer = async (data, room) => {
    //const formData = new FormData();
    //console.log(data)
    //formData.append("pdfFile", data);
    //formData.append("roomId", room);

    await axios.post('/api/upload/lessonSummary', {
      pdfFile: data,
      roomId: room
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  useImperativeHandle(innerRef, () => ({
    async generatePdf(room) {
      console.log("generate pdf function called")
      await waitForLogo(logoUrlRef);
      console.log("generate pdf function called, waiting for logo done")
      const imgJsonFiles = await imageJsonFiles();
      createPdfFile(room, imgJsonFiles);
    },
  }));

  return null;
};

export default PdfMaker;