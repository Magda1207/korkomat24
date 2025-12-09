import { useState, useEffect } from 'react';
import { addShape, stopAddingShapes, deactivateAllObjects, eraser, removeObject, saveTabContent } from './functions/canvasFuntions';
import icons from './icons';
import Tooltip from './Tooltip';
import { Dialog } from 'primereact/dialog'
import Gallery from './Gallery'
import * as fabric from 'fabric';

const Toolbox = ({ canvas, socket, tab, loggedIn, isTeacher, getImageSrc, getSelectedTool, tool, getSelectedColor, registerGlobalCanvasHandlers }) => {
  const [selectedTool, setSelectedTool] = useState('DrawingMode')
  const [selectedColor, setSelectedColor] = useState('black')
  const [previousTool, setPreviousTool] = useState()
  const [hideColors, setHideColors] = useState(true)
  const [hideShapes, setHideShapes] = useState(true)
  const [toolsHidden, setToolsHidden] = useState(false)
  const [showGalleryInfo, setShowGalleryInfo] = useState(!Number(isTeacher));
  const [addPhotoDialogVisible, setAddPhotoDialogVisible] = useState(false)
  const [accessCode, setAccessCode] = useState(localStorage.getItem('accessCode') || '');

  const colors = [
    { name: 'black', color: 'bg-stone-900' },
    { name: 'blue', color: 'bg-blue-500' },
    { name: 'green', color: 'bg-green-500' },
    { name: 'red', color: 'bg-red-500' },
    { name: 'yellow', color: 'bg-yellow-500' },
  ];

  const shapes = [
    { name: 'Circle', icon: icons.Circle },
    { name: 'Rect', icon: icons.Rectangle },
    { name: 'Triangle', icon: icons.Triangle },
    { name: 'RightTriangle', icon: icons.RightTriangle }
  ];

  // Determine which shape icon to show if a shape is selected
  const shapeNames = shapes.map(s => s.name);
  const selectedShape = shapes.find(s => s.name === selectedTool);
  const shapesButtonIcon = shapeNames.includes(selectedTool) && selectedShape ? selectedShape.icon : icons.Shapes;

  const buttons = [
    { name: 'DrawingMode', icon: icons.Pencil, label: 'Ołówek' },
    { name: 'Pointer', icon: icons.Pointer, label: 'Przenieś' },
    { name: 'Textbox', icon: icons.Text, label: 'Tekst' },
    { name: 'Eraser', icon: icons.Eraser, label: 'Gumka' },
    { name: 'Line', icon: icons.Line, label: 'Linia' },
    { name: 'Shapes', icon: shapesButtonIcon, label: 'Kształty', hideTooltip: !hideShapes },
    { name: 'Color Palette', icon: icons.ColorPalette, label: 'Kolory', hideTooltip: !hideColors },
    { name: 'Image', icon: icons.Images, label: 'Zdjęcie' }
  ];

  useEffect(() => {
    const accessCode = localStorage.getItem('accessCode');
    if (accessCode) {
      setAccessCode(accessCode);
    }
  }, []);

  useEffect(() => {
    if (tool === 'Pointer') setSelectedTool(tool); //allow only Pointer to be selected from outside
  }, [tool]);

  useEffect(() => {
    getSelectedTool(selectedTool)
    if (!canvas) return
    setHideColors(true)
    setHideShapes(true)
    if (selectedTool === 'Color Palette') setHideColors(false)
    else if (selectedTool === 'Shapes') setHideShapes(false)
    else if (selectedTool === 'Line') addShape(canvas, selectedColor, 'line')
    else if (selectedTool === 'Circle') addShape(canvas, selectedColor, 'circle')
    else if (selectedTool === 'Rect') addShape(canvas, selectedColor, 'rect')
    else if (selectedTool === 'Triangle') addShape(canvas, selectedColor, 'triangle')
    else if (selectedTool === 'RightTriangle') addShape(canvas, selectedColor, 'rightTriangle')
    else if (selectedTool === 'DrawingMode') {
      canvas.isDrawingMode = true
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = selectedColor;
    }
    else if (selectedTool === 'Textbox') {
      deactivateAllObjects(canvas, 'text')
      canvas.isDrawingMode = false;
      canvas.defaultCursor = 'text';
      //setTextToolActive(true);
    }
    else if (selectedTool === 'Pointer') canvas.isDrawingMode = false
    else if (selectedTool === 'Eraser') eraser(canvas, 30, socket)
    else if (selectedTool === 'Image') { setAddPhotoDialogVisible(true); setSelectedTool('Pointer') }
  }, [selectedTool])

  useEffect(() => {
    if (!canvas) return
    if (addPhotoDialogVisible) {
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    }
  }, [addPhotoDialogVisible])

   useEffect(() => {
    if (!canvas) return
    canvas.freeDrawingBrush.color = selectedColor
    getSelectedColor(selectedColor)
  }, [selectedColor])

  const selectTool = (tool, e) => {
    //if (selectedTool === 'Line' || selectedTool === 'Rect' || selectedTool === 'Circle') 
    stopAddingShapes(canvas, registerGlobalCanvasHandlers); // <-- callback przywracający globalne handlery
    if (tool === 'Shapes') setHideShapes(!hideShapes)
    if (tool === 'Color Palette') setHideColors(!hideColors)
    setPreviousTool(selectedTool)
    setSelectedTool(tool)
  }

  const selectColor = (color) => {
    setSelectedColor(color)
    setHideColors(true)
    setSelectedTool(previousTool)
  }

  const clearTab = () => {
    canvas.getObjects().forEach(obj => {
      removeObject(canvas, obj)
    });
    if (loggedIn) saveTabContent(canvas, tab)
  }

  const hideTools = () => {
    setToolsHidden(!toolsHidden)
  }

  useEffect(() => {
    if (toolsHidden) {
      setHideColors(true)
      setHideShapes(true)
    }
  }, [toolsHidden]);

  return (
    <div>
      <div id='toolbox-parent' className={`fixed left-0 top-1/2 -translate-y-1/2 grid grid-cols-2 content-center z-40`}>
        <div id='toolbox' className='bg-zumthor-100 rounded-r-lg shadow-md pt-1'>
          <div className={`${toolsHidden && 'hidden'} `}>
            {buttons.map((button, index) => (
              <Tooltip message={button.label} placeRight={true} key={index} hidden={button.hideTooltip}>
                <span
                  key={index}
                  name={button.name}
                  id={`toolbox-${button.name}`}
                  className={`block scale-75 rounded-lg p-1 ${button.name === selectedTool ||
                      (button.name === 'Shapes' && shapeNames.includes(selectedTool))
                      ? 'bg-zumthor-200'
                      : ''
                    }`}
                  onClick={(e) => selectTool(button.name, e)}
                >
                  {button.icon}
                </span>
              </Tooltip>
            ))}
            <span
              className='block py-2 px-1'
            >
              {icons.Separator}
            </span>
            <Tooltip message='Wyczyść kartę' placeRight={true}>
              <span
                className='block scale-75 p-1'
                onClick={() => clearTab()}
              >
                {icons.Trash}
              </span>
            </Tooltip>
            <span
              className='block py-2 px-1'
            >
              {icons.Separator}
            </span>
          </div>
          <Tooltip message={toolsHidden ? 'Pokaż narzędzia' : 'Schowaj narzędzia'} placeRight={true}>
            <span
              className='block scale-75 p-1'
              onClick={() => hideTools()}
            >
              {toolsHidden ? icons.Unhide : icons.Hide}
            </span>
          </Tooltip>
          <div className={`absolute bg-zumthor-100 top-1/2 -translate-y-1/2 right-0 rounded-r-lg shadow-md pt-1 ${hideColors && 'hidden'}`}>
            {colors.map((color, index) => (
              <span
                key={index}
                className={`block ${color.color} w-6 h-6 m-2 rounded-full`}
                onClick={() => selectColor(color.name)}
              >
              </span>
            ))}
          </div>
          <div className={`absolute bg-zumthor-100 top-1/2 -translate-y-1/2 right-0 rounded-r-lg shadow-md pt-1 ${hideShapes && 'hidden'}`}>
            {shapes.map((shape, index) => (
              <span
                key={index}
                className='block w-6 h-6 m-2 rounded-full flex items-center justify-center'
                style={{ padding: 0 }}
                onClick={(e) => selectTool(shape.name, e)}
              >
                {shape.icon && (
                  <span style={{ width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    {shape.icon}
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
      <Dialog resizable={false} className='custom-dialog no-top-left-right-padding gray-header-modal' contentStyle={{ overflow: 'visible' }} header="Moje obrazy" visible={addPhotoDialogVisible} onHide={() => setAddPhotoDialogVisible(false)}>
        {loggedIn
          ? (accessCode
            ? <Gallery socket={socket} getImageSrc={getImageSrc} showGalleryInfo={showGalleryInfo} setShowGalleryInfo={setShowGalleryInfo} />
            : <div className="p-12 m-auto">Nie możesz dodawać zdjęć</div>
          )
          : <div className="p-12 m-auto">
            <a href="/#/signin" className="text-blue-600 underline hover:text-blue-800">
              Zaloguj się,
            </a> aby dodać zdjęcia
          </div>
        }
      </Dialog >
    </div>
  );
}

export default Toolbox;