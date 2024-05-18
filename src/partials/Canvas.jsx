import React, { useState, useRef, useEffect } from 'react';

import Tabs from '../partials/Tabs'
import ToolsSpeedDial from '../partials/ToolsSpeedDial'
import ColorPaletteSpeedDial from '../partials/ColorPaletteSpeedDial'
//const Canvas = ({ room, socket, functionType, color }) => {

const Canvas = ({ room, socket }) => {

  const [activeTab, setActiveTab] = useState(1);
  const [previousTab, setPreviousTab] = useState();
  const [activeTabDataURL, setActiveTabDataURL] = useState();
  const [functionType, setFunctionType] = useState()
  const [resetTools, setResetTools] = useState(false)
  const [color, setColor] = useState()
  const [imageSrc, setImageSrc] = useState()

  const canvasRef = useRef(null)
  const contextRef = useRef(null)
  const isDrawing = useRef(false)
  var startX = useRef(null)
  var startY = useRef(null)

  const canvasTempRef = useRef(null)
  const contextTempRef = useRef(null)

  const canvasPointerRef = useRef(null)
  const contextPointerRef = useRef(null)

  const canvasImageRef = useRef(null)
  const contextImageRef = useRef(null)

  useEffect(() => {
    console.log("Canvas, socket connected: " + socket.connected)
    setResetTools(false)
  })

  //Canvas settings on initial render
  useEffect(() => {
    const canvas = canvasRef.current
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const context = canvas.getContext("2d")
    context.lineCap = "round"
    context.strokeStyle = "black"
    context.shadowColor = "rgba(0, 0, 0, .4)";
    context.shadowBlur = .2;
    context.lineJoin = 'round';
    contextRef.current = context

    const canvasTemp = canvasTempRef.current
    canvasTemp.width = canvas.offsetWidth
    canvasTemp.height = canvas.offsetHeight
    const contextTemp = canvasTemp.getContext("2d")
    contextTemp.strokeStyle = "black"
    contextTempRef.current = contextTemp

    const canvasPointer = canvasPointerRef.current
    canvasPointer.width = canvas.offsetWidth
    canvasPointer.height = canvas.offsetHeight
    const contextPointer = canvasPointer.getContext("2d")
    contextPointerRef.current = contextPointer

    const canvasImage = canvasImageRef.current
    canvasImage.width = canvas.offsetWidth
    canvasImage.height = canvas.offsetHeight
    const contextImage = canvasImage.getContext("2d")
    contextImageRef.current = contextImage

  }, [])

  // Receive and process messages from socket
  useEffect(() => {
    socket.on('drawClick', (data) => {
      const { x, y, type, functionType, color, imageSrc } = data
      pointer(x, y)
      if (functionType === 'pencil') {
        drawWithPencil(x, y, type, color)
      }
      if (functionType === 'line') {
        drawLine(x, y, type, color)
      }
      if (functionType === 'rectangle') {
        drawRectangle(x, y, type, color)
      }
      if (functionType === 'circle') {
        drawCircle(x, y, type, color)
      }
      if (functionType === 'eraser') {
        erase(x, y, type, color)
      }
      if (functionType === 'image') {
        pasteImage(x, y, type, imageSrc)
      }
    })

    socket.on('loadTabContent', (data) => {
      if (data) {
        var img = new Image;
        img.onload = () => {
          contextRef.current.drawImage(img, 0, 0, img.width, img.height)
        }
        img.src = data;
      }
    })

    return () => {
      socket.off('drawClick')
      socket.off('loadTabContent')
    };

  }, [socket])

  // Clear the Canvas after adding a new tab
  useEffect(() => {
    setActiveTabDataURL(canvasRef.current.toDataURL())
    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  }, [activeTab])

  useEffect(() => {
    socket.emit('saveTabContent', { room: room, tab: previousTab, dataURL: activeTabDataURL })
  }, [activeTabDataURL])

  const drawWithPencil = (offsetX, offsetY, type, receivedColor = color) => {
    contextRef.current.strokeStyle = receivedColor

    if (type === "mousedown") {
      contextRef.current.beginPath()
      contextRef.current.moveTo(offsetX, offsetY)
      isDrawing.current = true
    }
    else if (type === "mousemove") {
      if (!isDrawing.current) {
        return
      }
      contextRef.current.lineTo(offsetX, offsetY)
      contextRef.current.stroke()
    }
    else if (type === "mouseup") {
      isDrawing.current = false
      contextRef.current.closePath()
    }
  }

  const drawRectangle = (offsetX, offsetY, type, receivedColor = color) => {
    contextRef.current.strokeStyle = receivedColor
    contextTempRef.current.strokeStyle = receivedColor

    if (type === "mousedown") {
      contextRef.current.beginPath()
      startX = offsetX
      startY = offsetY
      isDrawing.current = true
    }
    else if (type === "mousemove") {
      if (!isDrawing.current) {
        return
      }
      contextTempRef.current.clearRect(0, 0, canvasTempRef.current.width, canvasTempRef.current.height);

      contextTempRef.current.beginPath()
      contextTempRef.current.rect(startX, startY, offsetX - startX, offsetY - startY);
      contextTempRef.current.stroke()
    }
    else if (type === "mouseup") {
      contextTempRef.current.clearRect(0, 0, canvasTempRef.current.width, canvasTempRef.current.height);
      contextRef.current.rect(startX, startY, offsetX - startX, offsetY - startY);
      contextRef.current.stroke()

      isDrawing.current = false
    }
  }

  const drawCircle = (offsetX, offsetY, type, receivedColor = color) => {
    contextRef.current.strokeStyle = receivedColor
    contextTempRef.current.strokeStyle = receivedColor

    if (type === "mousedown") {
      contextRef.current.beginPath()
      startX = offsetX
      startY = offsetY
      isDrawing.current = true
    }
    else if (type === "mousemove") {
      if (!isDrawing.current) {
        return
      }
      contextTempRef.current.clearRect(0, 0, canvasTempRef.current.width, canvasTempRef.current.height);

      contextTempRef.current.beginPath()
      contextTempRef.current.arc(startX, startY, Math.abs(offsetX - startX), 0, 2 * Math.PI);
      contextTempRef.current.stroke()
    }
    else if (type === "mouseup") {
      contextTempRef.current.clearRect(0, 0, canvasTempRef.current.width, canvasTempRef.current.height);
      contextRef.current.arc(startX, startY, Math.abs(offsetX - startX), 0, 2 * Math.PI);
      contextRef.current.stroke()

      isDrawing.current = false
    }
  }

  const drawLine = (offsetX, offsetY, type, receivedColor = color) => {
    contextRef.current.strokeStyle = receivedColor
    contextTempRef.current.strokeStyle = receivedColor

    if (type === "mousedown") {
      contextRef.current.beginPath()
      contextRef.current.moveTo(offsetX, offsetY)
      startX = offsetX
      startY = offsetY
      isDrawing.current = true
    }
    else if (type === "mousemove") {
      if (!isDrawing.current) {
        return
      }
      contextTempRef.current.clearRect(0, 0, canvasTempRef.current.width, canvasTempRef.current.height);

      contextTempRef.current.beginPath()
      contextTempRef.current.moveTo(startX, startY)
      contextTempRef.current.lineTo(offsetX, offsetY)
      contextTempRef.current.stroke()
    }
    else if (type === "mouseup") {
      contextTempRef.current.clearRect(0, 0, canvasTempRef.current.width, canvasTempRef.current.height);
      contextRef.current.lineTo(offsetX, offsetY)
      contextRef.current.stroke()
      contextRef.current.closePath()

      isDrawing.current = false
    }
  }

  const erase = (offsetX, offsetY, type, receivedColor = color) => {
    contextRef.current.strokeStyle = receivedColor
    contextTempRef.current.strokeStyle = receivedColor
    if (type === "mousedown") {
      isDrawing.current = true
    }
    else if (type === "mousemove") {
      if (!isDrawing.current) {
        return
      }
      contextRef.current.beginPath();
      contextRef.current.globalCompositeOperation = "destination-out";
      contextRef.current.arc(offsetX, offsetY, 8, 0, Math.PI * 2, false);
      contextRef.current.fill();
    }
    else if (type === "mouseup") {
      isDrawing.current = false
      contextRef.current.globalCompositeOperation = "source-over";
    }
  }

  const pasteImage = (offsetX, offsetY, type, receivedImage = imageSrc) => {
    if (!receivedImage) return
    console.log("Received image: " + receivedImage)

    var img = new Image;
    img.src = receivedImage;
    img.onload = () => {
      if (type === "mousemove") {
        contextTempRef.current.clearRect(0, 0, canvasImageRef.current.width, canvasImageRef.current.height);
        contextTempRef.current.drawImage(img, 0, 0, offsetX, offsetY)
      }
      if (type === "mouseup") {
        contextTempRef.current.clearRect(0, 0, canvasImageRef.current.width, canvasImageRef.current.height);
        contextRef.current.drawImage(img, 0, 0, offsetX, offsetY)
        setResetTools(true)
      }
    }
  }

  const pointer = (offsetX, offsetY) => {
    contextPointerRef.current.strokeStyle = 'orange';
    contextPointerRef.current.lineWidth = 3;
    contextPointerRef.current.clearRect(0, 0, canvasPointerRef.current.width, canvasPointerRef.current.height);
    contextPointerRef.current.beginPath();
    contextPointerRef.current.moveTo(offsetX, offsetY);
    contextPointerRef.current.arc(offsetX, offsetY, 2, 0, 2 * Math.PI);
    contextPointerRef.current.stroke();
    contextPointerRef.current.closePath();
  }

  const canvasActions = ({ nativeEvent, type }) => {
    const { offsetX, offsetY } = nativeEvent

    if (functionType === 'pencil') {
      drawWithPencil(offsetX, offsetY, type)
    }
    if (functionType === 'rectangle') {
      drawRectangle(offsetX, offsetY, type)
    }
    if (functionType === 'line') {
      drawLine(offsetX, offsetY, type)
    }
    if (functionType === 'circle') {
      drawCircle(offsetX, offsetY, type)
    }
    if (functionType === 'eraser') {
      erase(offsetX, offsetY, type)
    }
    if (functionType === 'image') {
      pasteImage(offsetX, offsetY, type)
    }
    else {
      pointer(offsetX, offsetY)
    }

    sendEvent(offsetX, offsetY, type, functionType, activeTab, imageSrc)
  }

  const sendEvent = (offsetX, offsetY, type, functionType, tab) => {
    socket.emit('drawClick', {
      tab: tab,
      functionType: functionType,
      x: offsetX,
      y: offsetY,
      type: type,
      color: color,
      room: room,
      isDrawing: isDrawing,
      imageSrc: imageSrc
    });
  }

  const getActiveTab = (activeTab) => {
    setActiveTab((prevValue) => {
      setPreviousTab(prevValue)
      return activeTab
    })
  }

  const getSelectedFunction = (selectedFunction) => {
    console.log(selectedFunction)
    setFunctionType(selectedFunction)
  }

  const getSelectedColor = (color) => {
    setColor(color)
  }

  const getImage = (img) => {
    setImageSrc(img.getAttribute('src'))
  }


  return (
    <>
      {/*  Page content */}
      <main className="grow flex flex-col m-5 mt-20">
        {/* canvas */}
        <div className='relative grow border-dashed border-2 border-indigo-600 bg-white'>
          <canvas className='absolute w-full h-full max-w-full max-h-full box-border z-20'
            ref={canvasRef}
            onMouseDown={canvasActions}
            onMouseMove={canvasActions}
            onMouseUp={canvasActions}
          />
          <canvas className='absolute w-full h-full max-w-full max-h-full box-border z-40'
            ref={canvasTempRef}
            onMouseDown={canvasActions}
            onMouseMove={canvasActions}
            onMouseUp={canvasActions}
          />
          <canvas className='absolute w-full h-full max-w-full max-h-full box-border z-40'
            ref={canvasImageRef}
            onMouseDown={canvasActions}
            onMouseMove={canvasActions}
            onMouseUp={canvasActions}
          />
          <canvas className='absolute w-full h-full max-w-full max-h-full box-border z-30'
            ref={canvasPointerRef}
            onMouseMove={pointer}
          />
          <ToolsSpeedDial getSelectedFunction={getSelectedFunction} getImage={getImage} resetTools={resetTools} />
          <ColorPaletteSpeedDial getSelectedColor={getSelectedColor} />
        </div>
        <Tabs socket={socket} getActiveTab={getActiveTab} funcType={functionType} />
      </main>


    </>
  );
}

export default Canvas;