import * as fabric from 'fabric';
import { v4 as uuid } from 'uuid';
import { emitAdd, emitRemove } from '../../socket/socket.js';
import { EraserBrush } from '@erase2d/fabric';
import axios from 'axios'

const cleanEventHandlers = (canvas) => {
  canvas.isDrawingMode = false
  canvas.off('mouse:over')
}

export const addImage = async (url, canvas, x, y, imageCount) => {

  const filename = url.split('/').pop();

  const response = await axios.post('/api/copy-to-canvas-asset', {
    filename,
  });
 
  const newUrl = response.data.newPath;

  let object = await fabric.FabricImage.fromURL(newUrl);
  let scale;
  if (object.height > canvas.height) {
    scale = canvas.height / object.height;
  } else if (object.width > canvas.width / 4) {
    scale = canvas.width / 4 / object.width;
  } else {
    scale = 1;
  }

  console.log('scale', scale)
  let left;
  let top;
  //TODO: Jesli x i y sa undefined, to ustawiamy na poczatek canvasu
  if ((x === undefined || y === undefined) && (!imageCount)) {
    left = 0;
    top = 0;
  }
  else  if ((x === undefined || y === undefined) && (imageCount)) {
    left = imageCount * 20;
    top = imageCount * 20;
  }
  else {
    left = x - object.width * scale / 2;
    top = y - object.height * scale / 2;
  }

  object.set({
    left: left,
    top: top,
    scaleX: scale,
    scaleY: scale,
    id: uuid(),
    erasable: true
  })
  emitAdd({ obj: object, id: object.id })
  canvas.add(object)
  canvas.renderAll()
}

// export const addShapeOld = async (e, canvas, selectedColor) => {
//   cleanEventHandlers(canvas)
//   let type = e.target.getAttribute("name");
//   let object

//   if (type === 'Rect') {
//     object = new fabric.Rect({
//       fill: null,
//       stroke: selectedColor,
//       height: 75,
//       width: 150,
//       erasable: true
//     });
//   } else if (type === 'Circle') {
//     object = new fabric.Circle({
//       fill: null,
//       stroke: selectedColor,
//       radius: 50,
//       erasable: true
//     })
//   }
//   console.log(object)
//   object.set({ id: uuid() })
//   //object.set({ tab: tab })
//   emitAdd({ obj: object, id: object.id })
//   canvas.add(object)
//   canvas.renderAll()
// };

export const addTextboxAtPointer = (canvas, pointer, color) => {
  const height = 30;
  const left = pointer.x;
  const top = pointer.y - height / 2;

  const obj = new fabric.Textbox('', {
    left,
    top,
    width: 300,
    height,
    fontSize: 20,
    fill: color || '#000000',
    id: uuid(),
    erasable: true,
  });
  canvas.add(obj);
  canvas.setActiveObject(obj);
  obj.enterEditing();

  canvas.defaultCursor = 'default';
  emitAdd({ obj: obj, id: obj.id });
};

// Add shape
let obj
let mouseDown
let startX
let startY

// Store bound functions
let boundAddShapeMouseDown;
let boundAddShapeMouseMove;
let boundAddShapeMouseUp;

const handleAddShapeMouseDown = function (canvas, color, shape, o) {
  startAddingShape(canvas, color, shape, o);
};
const handleAddShapeMouseMove = function (canvas, shape, o) {
  drawShape(canvas, shape, o);
};
const handleAddShapeMouseUp = function (canvas, color, shape, o) {
  finishAddingShape(canvas, color, shape, o);
};

export const deactivateAllObjects = (canvas, cursor = 'auto') => {
  canvas.getObjects().forEach((object) => {
    object.selectable = false,
      object.hoverCursor = cursor
  })
}

export const activateAllObjects = (canvas) => {
  canvas.getObjects().forEach((object) => {
    object.selectable = true;
    object.hoverCursor = 'move';
  });
};

export const addShape = (canvas, color, shape) => {
  cleanEventHandlers(canvas)
  // Bind functions and store references
  boundAddShapeMouseDown = handleAddShapeMouseDown.bind(null, canvas, color, shape);
  boundAddShapeMouseMove = handleAddShapeMouseMove.bind(null, canvas, shape);
  boundAddShapeMouseUp = handleAddShapeMouseUp.bind(null, canvas, color, shape);

  // Add event listeners
  canvas.on('mouse:down', boundAddShapeMouseDown);
  canvas.on('mouse:move', boundAddShapeMouseMove);
  canvas.on('mouse:up', boundAddShapeMouseUp);

  canvas.discardActiveObject()
  deactivateAllObjects(canvas)
  canvas.isDrawingMode = false
  canvas.renderAll()
}

const startAddingShape = (canvas, color, shape, o) => {
  mouseDown = true
  const pointer = canvas.getPointer(o.e)
  const x = pointer.x
  const y = pointer.y

  if (shape === 'line') {
    obj = new fabric.Line([x, y, x, y], {
      strokeWidth: 1,
      stroke: color,
      selectable: false,
      erasable: true,
      hoverCursor: 'auto',
      padding: 10
    })
  }
  else if (shape === 'circle') {
    startX = x
    startY = y
    obj = new fabric.Circle({
      left: x,
      top: y,
      originX: 'center',
      originY: 'center',
      radius: 0,
      stroke: color,
      strokeWidth: 1,
      fill: 'transparent',
      selectable: false,
      erasable: true
    });
  } else if (shape === 'rect') {
    startX = x
    startY = y
    obj = new fabric.Rect({
      left: x,
      top: y,
      width: 0,
      height: 0,
      stroke: color,
      strokeWidth: 1,
      fill: 'transparent',
      selectable: false,
      erasable: true,
      originX: 'left',
      originY: 'top'
    });
  } else if (shape === 'triangle') {
    startX = x
    startY = y
    obj = new fabric.Triangle({
      left: x,
      top: y,
      width: 0,
      height: 0,
      stroke: color,
      strokeWidth: 1,
      fill: 'transparent',
      selectable: false,
      erasable: true,
      originX: 'left',
      originY: 'top'
    });
  } else if (shape === 'rightTriangle') {
    startX = x;
    startY = y;
    obj = new fabric.Polygon([
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 }
    ], {
      left: x,
      top: y,
      stroke: color,
      strokeWidth: 1,
      fill: 'transparent',
      selectable: false,
      erasable: true,
      originX: 'left',
      originY: 'top',
      objectCaching: false,
    });
  }
  canvas.add(obj)
  canvas.requestRenderAll()
}

const drawShape = (canvas, shape, o) => {
  if (mouseDown === true) {
    const pointer = canvas.getPointer(o.e)
    if (shape === 'line') {
      obj.set({ x2: pointer.x, y2: pointer.y })
    } else if (shape === 'circle') {
      const radius = Math.sqrt(Math.pow(pointer.x - startX, 2) + Math.pow(pointer.y - startY, 2)) / 2;
      obj.set({
        left: (startX + pointer.x) / 2,
        top: (startY + pointer.y) / 2,
        radius: radius,
      });
    } else if (shape === 'rect') {
      const width = pointer.x - startX;
      const height = pointer.y - startY;
      obj.set({
        left: startX,
        top: startY,
        width: width,
        height: height,
      });
    } else if (shape === 'triangle') {
      const width = pointer.x - startX;
      const height = pointer.y - startY;
      obj.set({
        left: startX,
        top: startY,
        width: width,
        height: height,
      });
    } else if (shape === 'rightTriangle') {
      const width = pointer.x - startX;
      const height = pointer.y - startY;
      obj.set({
        points: [
          { x: 0, y: 0 },
          { x: width, y: height },
          { x: 0, y: height }
        ],
        left: startX,
        top: startY,
        originX: 'center',
        originY: 'center',
        width: width,
        height: height
      });
      //obj.controls = fabric.controlsUtils.createPolyControls(3)

    }
    //obj.setCoords()
    canvas.requestRenderAll()
  }
}
const finishAddingShape = (canvas, color, shape, o) => {

  const id = uuid()

  //line.set({ tab: tab })
  //canvas.setViewportTransform(canvas.viewportTransform);
  const pointer = canvas.getPointer(o.e)
  if (shape === 'rightTriangle') {

    // For rightTriangle, we need to create a new polygon object with the correct points
    // otherwise controls won't work properly
    canvas.remove(obj);
    const width = pointer.x - startX;
    const height = pointer.y - startY;

    const minX = Math.min(0, width);
    const minY = Math.min(0, height);

    const points = [
      { x: 0 - minX, y: height - minY },         // lewy dolny
      { x: width - minX, y: height - minY },     // prawy dolny
      { x: 0 - minX, y: 0 - minY }               // lewy górny
    ];

    const objNew = new fabric.Polygon(points, {
      left: startX + minX,
      top: startY + minY,
      stroke: color,
      strokeWidth: 1,
      fill: 'transparent',
      selectable: false,
      erasable: true,
      originX: 'left',
      originY: 'top',
      objectCaching: false,
      hasControls: true,
    });

    canvas.add(objNew)
    canvas.requestRenderAll()
    objNew.setCoords()
    objNew.set({ id: id })
    emitAdd({ obj: objNew, id: objNew.id })
  }

  else {
    obj.setCoords()
    obj.set({ id: id })
    emitAdd({ obj: obj, id: obj.id })
  }
  mouseDown = false

}
export const stopAddingShapes = (canvas, onAfterStop) => {
  // Use stored references to remove event listeners
  canvas.off('mouse:down', boundAddShapeMouseDown);
  canvas.off('mouse:move', boundAddShapeMouseMove);
  canvas.off('mouse:up', boundAddShapeMouseUp);

  canvas.getObjects().forEach((object) => {
    object.selectable = true,
    object.hoverCursor = 'move'
  });

  // Dodaj: przywrócenie globalnych handlerów, jeśli przekazano callback
  if (typeof onAfterStop === 'function') {
    onAfterStop();
  }
}

// Erase
// let boundEraseMouseDown
// let boundEraseMouseOver
// const handleEraseMouseDown = function (canvas, o) {
//   if (o.target) removeObject(canvas, o.target)
//   mouseDown = true
// }
// const handleEraseMouseOver = function (canvas, o) {
//   if (o.target && mouseDown) {
//     removeObject(canvas, o.target)
//   }
// }

export const removeObject = (canvas, object) => {
  const id = object.id
  canvas.remove(object)
  canvas.renderAll()
  emitRemove({ id: id })
}

export const eraser = (canvas, width = 30, socket) => {
  cleanEventHandlers(canvas);

  if (EraserBrush) {
    const eraser = new EraserBrush(canvas);
    eraser.width = width;
    eraser.on('end', async (e) => {
      e.preventDefault();
      const { path, targets } = e.detail;
      socket.emit('remote-erase', {
        path: path.toObject(),
        targetIds: targets.map(obj => obj.id)
      });
      await eraser.commit({ path, targets });
      canvas.fire('mouse:up'); // Trigger mouse:up after commit to save the canvas state

      // Usuwanie obiektów całkowicie wymazanych
      setTimeout(() => {
        targets.forEach(obj => {
          if (obj._cacheCanvas) {
            const ctx = obj._cacheCanvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, obj._cacheCanvas.width, obj._cacheCanvas.height);
            if (isImageDataTransparent(imageData)) {
              canvas.remove(obj);
            }
          }
        });
        canvas.requestRenderAll();
      }, 0);
    });

    canvas.freeDrawingBrush = eraser;
    canvas.isDrawingMode = true;
  } else {
    alert('EraserBrush is not available in this Fabric.js build.');
  }
};

// Dodaj funkcję pomocniczą:
function isImageDataTransparent(imageData) {
  return imageData.data.every((x, i) => i % 4 !== 3 || x === 0);
}

export const saveTabContent = async (canvas, tab) => {
  let file = JSON.stringify(canvas.toObject(['id', 'tab', 'erasable']))

  const formData = new FormData();
  formData.append("canvasObject", file);
  formData.append("file", tab + '.json');
  await axios.post('/api/tab/save', {
    canvasObject: file,
    file: tab + '.json'
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

function readTextFile(canvas, file, callback) {
  var rawFile = new XMLHttpRequest();
  rawFile.overrideMimeType("application/json");
  rawFile.open("GET", file, true);

  rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4 && rawFile.status == "200") {
      callback(rawFile.responseText);
    }
    else if (rawFile.status == "404") {
      canvas.remove(...canvas.getObjects())
      callback('{"version":"6.0.0-manual","objects":[],"background":"#ffffff"}');
    }
  }
  rawFile.send(null);
}

export const loadTab = (room, canvas, tab) => {
  return new Promise((resolve, reject) => {
    canvas.clear();
    readTextFile(canvas, "/public/lessons/" + room + "/" + tab + ".json?v=" + Date.now(), function (text) {
      try {
        // if (!text) {
        //   console.log('Pusty plik, resolve!');
        //   canvas.requestRenderAll();
        //   resolve();
        //   return;
        // }
        var data = JSON.parse(text);
        if (!data.background) data.background = '#ffffff'
        console.log(data)
        if (
          data &&
          Array.isArray(data.objects) &&
          data.objects.length === 0
        ) {
          canvas.clear();
          if (data.background) {
            canvas.backgroundColor = data.background;
          }
          canvas.requestRenderAll();
          resolve();
          return;
        }

        canvas.clear();
        canvas.loadFromJSON(data, () => {
          canvas.requestRenderAll();
          resolve();
        });
      } catch (err) {
        console.log(err)
        reject(err);
      }
    });
  });
}



