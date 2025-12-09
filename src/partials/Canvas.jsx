import React, { useRef, useEffect, useState } from 'react';
import * as fabric from 'fabric';
import { EraserBrush } from '@erase2d/fabric';

import { emitModify, emitPointer, emitAdd, modifyObj, addObj, remotePointer, remoteEraser, removeObj } from '../socket/socket'
import { saveTabContent, removeObject, addImage, loadTab, addTextboxAtPointer, activateAllObjects } from './functions/canvasFuntions';
import { v1 as uuid } from 'uuid'
import Toolbox from './Toolbox';
import Tabs from './Tabs';
import TabsDemo from './TabsDemo';
import LoadingSpinner from './LoadingSpinner';
import DemoVersionImage from '../images/demoVersion.png';

const Canvas = ({ room, socket, loggedIn, isTeacher, isTutorialDisplayed }) => {
  const canvasRef = useRef(null);
  const [activeTab, setActiveTab] = useState()
  const activeTabRef = useRef(activeTab)
  const roomRef = useRef(room);
  const [remoteDimensions, setRemoteDimensions] = useState()
  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth
  })
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedTool, setSelectedTool] = useState()
  const [selectedColor, setSelectedColor] = useState()
  const [imageCount, setImageCount] = useState(0)

  const updateImageCount = () => {
    if (!canvasRef.current) return;
    // W Fabric typ dla obrazów bywa 'image' (lowercase). W zapisanym JSON wcześniej mogło być 'Image'.
    // Dodatkowo dla bezpieczeństwa sprawdzamy instanceof.
    const objs = canvasRef.current.getObjects();
    const count = objs.filter(o => {
      const t = o.type;
      return t && fabric.FabricImage && o instanceof fabric.FabricImage;
    }).length;
    setImageCount(count);
  }


  useEffect(() => {
    (async () => {
      console.log("Canvas dimensions ", dimensions)
      if (canvasRef.current) {
        const initCanvas = new fabric.Canvas(canvasRef.current, {
          width: dimensions.width - 10,
          height: dimensions.height - 132, // Adjust height to fit below the header (mt-16)
          isDrawingMode: true,
          selection: false,
          stopContextMenu: true
        });
        initCanvas.freeDrawingBrush = new fabric.PencilBrush(initCanvas);

        initCanvas.backgroundColor = '#ffffff';

        initCanvas.renderAll();

        canvasRef.current = initCanvas;
        if (loggedIn) socket.emit('dimensions_changed', dimensions)
        else {
          // console.log("loggedIn", loggedIn) //TODO: DELETED, to be resolved - napis pojawia się dla zalogowanego teachera po odswiezeniu
          // const textboxWidth = initCanvas.width * 3 / 4
          // const textboxLeft = (initCanvas.width - textboxWidth) / 2
          // const textboxTop = initCanvas.height / 4
          // let object = new fabric.Textbox('Zaloguj się, aby w pełni korzystać z tablicy', {
          //   fontSize: 40,
          //   width: textboxWidth,
          //   left: textboxLeft,
          //   top: textboxTop,
          //   draggable: false,
          //   selectable: false,
          //   hasControls: false,
          //   moveCursor: 'none',
          //   textAlign: 'center',
          //   fill: 'gray'
          // })

          //const imageWidth = initCanvas.width * 3 / 4
          //const imageHeight = initCanvas.height * 3 / 4
          //const imageLeft = (initCanvas.width - imageWidth) / 2
          //const imageTop = (initCanvas.height - imageHeight) / 2

          let object = await fabric.FabricImage.fromURL(DemoVersionImage)
          let scale;
          if (object.height > initCanvas.height) {
            scale = initCanvas.height / object.height;
          } else if (object.width > initCanvas.width / 4) {
            scale = initCanvas.width / 4 / object.width;
          } else {
            scale = 1;
          }
          object.set({
            left: (initCanvas.width - object.width * scale) / 2,
            top: (initCanvas.height - object.height * scale) / 2,
            scaleX: scale,
            scaleY: scale,
            selectable: false,
            evented: false,
          })

          initCanvas.add(object)
        }
      }
    })();
    return () => {
      if (canvasRef.current && typeof canvasRef.current.dispose === 'function') {
        canvasRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (activeTab) activeTabRef.current = activeTab
  }, [activeTab]);

  useEffect(() => {
    if (!hasLoaded && activeTab && room) {
      setIsLoading(true); // pokaż spinner
      loadTab(room, canvasRef.current, activeTab)
        .then(() => {
          setIsLoading(false); //ukryj spinner
          updateImageCount();
        });
      setHasLoaded(true);
    }
  }, [activeTab, room, hasLoaded]);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth
      });
      if (canvasRef.current) {
        canvasRef.current.setWidth(window.innerWidth - 10);
        canvasRef.current.setHeight(window.innerHeight - 132);
        canvasRef.current.renderAll();
      }
    };

    const syncDimensions = () => {
      socket.emit('dimensions_changed', dimensions);
      socket.emit('get_remote_dimensions');
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener("beforeunload", syncDimensions);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener("beforeunload", syncDimensions);
    };
  }, []);

  useEffect(() => {
    //console.log("device pixel ratio", window.devicePixelRatio)
    const dpr = window.devicePixelRatio || 1;
    //const canvasWidth = remoteDimensions ? Math.min(dimensions.width*dpr, remoteDimensions.width) : dimensions.width*dpr
    //const canvasHeight = remoteDimensions ? Math.min(dimensions.height*dpr, remoteDimensions.height) : dimensions.height*dpr
    const canvasWidth = remoteDimensions ? Math.min(dimensions.width, remoteDimensions.width) : dimensions.width
    const canvasHeight = remoteDimensions ? Math.min(dimensions.height, remoteDimensions.height) : dimensions.height



    if (canvasRef.current) {
      // Rozmiar fizyczny (piksele)
      canvasRef.current.setWidth((canvasWidth - 10));
      canvasRef.current.setHeight(canvasHeight - 132);

      // Rozmiar CSS (widoczny na stronie)
      // canvasRef.current.upperCanvasEl.style.width = `${canvasWidth / dpr - 10 }px`;
      // canvasRef.current.upperCanvasEl.style.height = `${(canvasHeight  - 132)}px`;
      // canvasRef.current.lowerCanvasEl.style.width = `${(canvasWidth / dpr - 10)}px`;
      // canvasRef.current.lowerCanvasEl.style.height = `${(canvasHeight / dpr - 132)}px`;

      canvasRef.current.renderAll();
      //console.log("Faktyczny canvas height", canvasRef.current.height, "width", canvasRef.current.width)
    }
    //socket.emit('dimensions_changed', dimensions)
    //canvasRef.current.setZoom(0.95/dpr);
  }, [dimensions, remoteDimensions])

  useEffect(() => {
    socket.emit('dimensions_changed', dimensions)
  }, [dimensions])

  socket.on('remote_dimensions_changed', (data) => {
    //console.log("remote dimensions changed", data)
    setRemoteDimensions(data)
  })

  socket.on('dimensions_requested', () => {
    socket.emit('dimensions_changed', dimensions);
  })

  // Add keydown event listener for Delete key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Delete') {
        if (canvasRef.current) {
          const activeObject = canvasRef.current.getActiveObject();
          if (activeObject) {
            removeObject(canvasRef.current, activeObject);
            saveTabContent(canvasRef.current, activeTabRef.current)
          }
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(
    () => {
      let mouseDown = false
      if (canvasRef.current) {
        canvasRef.current.off('object:modified')
        canvasRef.current.off('object:moving')
        canvasRef.current.off('object:scaling')
        canvasRef.current.off('object:rotating')
        canvasRef.current.off('text:changed')
        canvasRef.current.off('text:editing:exited')
        canvasRef.current.off('path:created')
        canvasRef.current.off('mouse:move')
        canvasRef.current.off('mouse:down')
        canvasRef.current.off('mouse:up')
        canvasRef.current.off('object:added')
        canvasRef.current.off('object:removed')

        canvasRef.current.on('mouse:down', function (options) {
          mouseDown = true

          const myPointer = {
            x: options.pointer.x,
            y: options.pointer.y,
            drawingStart: canvasRef.current.isDrawingMode,
          }
          emitPointer(myPointer)
        })

        let timeout = null
        canvasRef.current.on('mouse:move', function (options) {
          clearTimeout(timeout);
          timeout = setTimeout(function () {
            const myPointer = {
              x: options.pointer.x,
              y: options.pointer.y,
              pointerStopped: true,
            }
            emitPointer(myPointer)
          }, 1000);

          const myPointer = {
            x: options.pointer.x,
            y: options.pointer.y,
            drawing: canvasRef.current.isDrawingMode && !(canvasRef.current.freeDrawingBrush instanceof EraserBrush) && mouseDown,
          }
          emitPointer(myPointer)

        })
        canvasRef.current.on('mouse:up', function (options) {
          mouseDown = false
          // Not logged in  users and teachers (no room) cannot save tab contents
          if (loggedIn && roomRef.current) saveTabContent(canvasRef.current, activeTabRef.current)

          const myPointer = {
            x: options.pointer.x,
            y: options.pointer.y,
            drawingEnd: canvasRef.current.isDrawingMode
          }
          emitPointer(myPointer)
        })

        canvasRef.current.on('object:modified', function (options) {
          if (options.target) {
            const modifiedObj = {
              obj: options.target,
              id: options.target.id,
            }
            emitModify(modifiedObj)
          }
        })


        canvasRef.current.on('object:moving', function (options) {
          if (options.target) {
            const modifiedObj = {
              obj: options.target,
              id: options.target.id,
            }
            emitModify(modifiedObj)
          }
        })

        canvasRef.current.on('object:scaling', function (options) {
          if (options.target) {
            const modifiedObj = {
              obj: options.target,
              id: options.target.id,
            }
            emitModify(modifiedObj)
          }
        })

        canvasRef.current.on('object:rotating', function (options) {
          if (options.target) {
            const modifiedObj = {
              obj: options.target,
              id: options.target.id,
            }
            emitModify(modifiedObj)
          }
        })

        canvasRef.current.on('text:changed', function (options) {
          if (options.target) {
            const modifiedObj = {
              obj: options.target,
              id: options.target.id,
            }
            emitModify(modifiedObj)
          }
        })


        canvasRef.current.on('path:created', function (options) {
          const id = uuid()
          options.path.set({ id: id, erasable: true })
          if (options) {
            const addedObject = {
              obj: options.path,
              id: id,
              erasable: options.erasable
            }
            emitAdd(addedObject)
          }
        });

        // Aktualizacja licznika obrazów przy dodaniu/usunięciu obiektu
        canvasRef.current.on('object:added', function () {
          updateImageCount();
        });
        canvasRef.current.on('object:removed', function () {
          updateImageCount();
        });

        // Inicjalne przeliczenie
        updateImageCount();

        modifyObj(canvasRef.current)
        addObj(canvasRef.current)
        removeObj(canvasRef.current)
        remotePointer(canvasRef.current)
        remoteEraser(canvasRef.current)
      }
    }, [canvasRef.current])

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    let firstClick = true;

    const handleMouseDown = (opt) => {

      if (selectedTool !== 'Textbox') return;
      const textPointer = canvas.getPointer(opt.e);
      if (firstClick) {
        addTextboxAtPointer(canvas, textPointer, selectedColor);
        firstClick = false;
      }
      else {
        setSelectedTool('Pointer');
        activateAllObjects(canvas);
      }
    };

    if (selectedTool === 'Textbox') {
      canvas.on('mouse:down', handleMouseDown);
    }

    return () => {
      canvas.off('mouse:down', handleMouseDown);
    };
  }, [selectedTool]);

  function allowDrop(ev) {
    ev.preventDefault();
  }

  async function drop(ev) {
    ev.preventDefault();
    let imageUrl = ev.dataTransfer.getData("text");
    let x = ev.nativeEvent.offsetX
    let y = ev.nativeEvent.offsetY
    setIsLoading(true);
    await addImage(imageUrl, canvasRef.current, x, y)
    setIsLoading(false);
    saveTabContent(canvasRef.current, activeTabRef.current);
    updateImageCount();
  }

  // Funkcja ładowania karty
  const getActiveTab = (actTab, skipSave = false, fromRemote = false) => {
    setIsLoading(true); // pokaż spinner
    const prevTab = activeTabRef.current;
    if (prevTab && !skipSave && !fromRemote) saveTabContent(canvasRef.current, prevTab);
    setActiveTab(actTab);
    loadTab(room, canvasRef.current, actTab)
      .then(() => {
        setIsLoading(false); //ukryj spinner
        updateImageCount();
      });
  };

  const getImageSrc = async (src) => {
    console.log('getImageSrc called', src);
    setIsLoading(true);
    await addImage(src, canvasRef.current, undefined, undefined, imageCount)
    saveTabContent(canvasRef.current, activeTabRef.current)
    setIsLoading(false);
    updateImageCount();
  }

  // useEffect(() => {
  //   console.log('isLoading changed:', isLoading);
  // }, [isLoading]);

  const getSelectedTool = (tool) => {
    setSelectedTool(tool)
  }

  const getSelectedColor = (color) => {
    setSelectedColor(color)
  }

  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  useEffect(() => {
    if (!canvasRef.current) return;
    console.log("selectedTool", selectedTool)
    // upperCanvasEl to faktyczny DOM-owy canvas, na którym Fabric.js ustawia kursor
    const upperCanvas = canvasRef.current.upperCanvasEl;
    if (upperCanvas) {
      //if (selectedTool === 'DrawingMode' || selectedTool === 'Eraser' || selectedTool === 'Line'  || selectedTool === 'Circle' || selectedTool === 'Rect' || selectedTool === 'Triangle' || selectedTool === 'RightTriangle') {
      if (selectedTool !== 'Pointer' && selectedTool !== 'Textbox') {
        upperCanvas.classList.add('custom-crosshair-cursor');
      } else {
        upperCanvas.classList.remove('custom-crosshair-cursor');
      }
    }
  }, [selectedTool, isLoading, hasLoaded]);


  // --- GLOBAL CANVAS EVENT HANDLERS ---
  const registerGlobalCanvasHandlers = () => {
    if (!canvasRef.current) return;
    let mouseDown = false;
    // Najpierw zdejmij stare handlery, żeby nie dublować
    canvasRef.current.off('mouse:down');
    canvasRef.current.off('mouse:move');
    canvasRef.current.off('mouse:up');
    // ...inne off jeśli potrzeba...

    canvasRef.current.on('mouse:down', function (options) {
      mouseDown = true;
      const myPointer = {
        x: options.pointer.x,
        y: options.pointer.y,
        drawingStart: canvasRef.current.isDrawingMode,
      };
      emitPointer(myPointer);
    });

    let timeout = null;
    canvasRef.current.on('mouse:move', function (options) {
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        const myPointer = {
          x: options.pointer.x,
          y: options.pointer.y,
          pointerStopped: true,
        };
        emitPointer(myPointer);
      }, 1000);

      const myPointer = {
        x: options.pointer.x,
        y: options.pointer.y,
        drawing: canvasRef.current.isDrawingMode && !(canvasRef.current.freeDrawingBrush instanceof EraserBrush) && mouseDown,
      };
      emitPointer(myPointer);
    });

    canvasRef.current.on('mouse:up', function (options) {
      mouseDown = false;
      // Not logged in  users and teachers (no room) cannot save tab contents
      if (loggedIn && roomRef.current) saveTabContent(canvasRef.current, activeTabRef.current);
      const myPointer = {
        x: options.pointer.x,
        y: options.pointer.y,
        drawingEnd: canvasRef.current.isDrawingMode
      };
      emitPointer(myPointer);
    });
  };

  useEffect(
    () => {
      // ...existing code...
      // Zamiast rejestrować handlery tutaj, wywołaj funkcję:
      registerGlobalCanvasHandlers();
      // ...pozostałe handlery (object:modified itd.)...
      // ...existing code...
    }, [canvasRef.current])

  return (
    <div className="canvas-container bg-light-blue mx-auto mb-1" onDrop={drop} onDragOver={allowDrop} >
      {isLoading && <LoadingSpinner />}
      {loggedIn && room && <Tabs socket={socket} getActiveTab={getActiveTab} canvasWidth={dimensions.width} />}
      {!loggedIn && isTutorialDisplayed && <TabsDemo canvasWidth={dimensions.width} />}
      <Toolbox
        canvas={canvasRef.current ? canvasRef.current : undefined}
        socket={socket}
        tab={activeTab}
        loggedIn={loggedIn}
        isTeacher={isTeacher}
        getImageSrc={getImageSrc}
        getSelectedTool={getSelectedTool}
        tool={selectedTool}
        getSelectedColor={getSelectedColor}
        registerGlobalCanvasHandlers={registerGlobalCanvasHandlers}
      />
      <canvas
        className={`z-30 w-full h-full ${selectedTool === 'DrawingMode' ? 'custom-crosshair-cursor' : ''}`}
        ref={canvasRef}
      />
    </div>
  )
}

export default Canvas;