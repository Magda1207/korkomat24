import { io } from 'socket.io-client';
import * as fabric from 'fabric'
import { EraserBrush } from '@erase2d/fabric';

const URL = import.meta.env.VITE_SOCKET_URL;
const socket = io(URL, {
    autoConnect: true
},);

// emitters
export const emitAdd = obj => {
    socket.emit('object-added', obj)
}

export const emitModify = (obj) => {
    socket.emit('object-modified', obj)
}

export const emitPointer = (obj) => {
    socket.emit('pointer-coords', obj)
}

export const emitDrawing = (obj) => {
    socket.emit('drawing-coords', obj)
}

export const emitRemove = (id) => {
    socket.emit('object-remove', id)
}

// listeners
export const addObj = canvas => {
    socket.off('new-add')
    socket.on('new-add', async data => {
        const { obj, id } = data

        let object

        if (obj.type === 'Rect') {
            object = new fabric.Rect({
                fill: obj.fill,
                stroke: obj.stroke,
                height: obj.height,
                width: obj.width,
                left: obj.left,
                top: obj.top,
                originX: obj.originX || 'left',
                originY: obj.originY || 'top',
            })

        } else if (obj.type === 'Circle') {
            object = new fabric.Circle({
                fill: obj.fill,
                stroke: obj.stroke,
                radius: obj.radius,
                left: obj.left,
                top: obj.top,
                originX: obj.originX || 'center',
                originY: obj.originY || 'center',
            })
        } else if (obj.type === 'Textbox') {
            object = new fabric.Textbox(obj.text, {
                fontSize: obj.fontSize,
                left: obj.left,
                top: obj.top,
                width: obj.width,
                fill: obj.fill,
            })
        } else if (obj.type === 'Line') {
            object = new fabric.Line([obj.x1, obj.y1, obj.x2, obj.y2], {
                strokeWidth: obj.strokeWidth,
                left: obj.left,
                top: obj.top,
                fill: obj.fill,
                stroke: obj.stroke,
                padding: obj.padding
            })
        } else if (obj.type === 'Image') {
            object = await fabric.FabricImage.fromURL(obj.src);

            object.set({
                left: obj.left,
                top: obj.top,
                scaleX: obj.scaleX,
                scaleY: obj.scaleY,
            })
        } else if (obj.type === 'Path') {
            object = new fabric.Path(obj.path, {
                fill: obj.fill,
                stroke: obj.stroke,
                strokeWidth: obj.strokeWidth
            });
        } else if (obj.type === 'Triangle') {
            object = new fabric.Triangle({
                left: obj.left,
                top: obj.top,
                width: obj.width,
                height: obj.height,
                stroke: obj.stroke,
                strokeWidth: obj.strokeWidth,
                fill: obj.fill
            });
        } else if (obj.type === 'Polygon') {
            object = new fabric.Polygon(obj.points, {
                left: obj.left,
                top: obj.top,
                stroke: obj.stroke,
                strokeWidth: obj.strokeWidth,
                fill: obj.fill,
                selectable: obj.selectable ?? true,
                erasable: obj.erasable ?? true,
                objectCaching: false,
                originX: obj.originX || 'left',
                originY: obj.originY || 'top'
            });
        }



        object.set({ id: id, erasable: true })
        canvas.add(object)
        canvas.renderAll()
    })
}


export const removeObj = canvas => {
    socket.off('object-removed')
    socket.on('object-removed', data => {
        canvas.getObjects().forEach(object => {
            if (object.id === data.id) {
                canvas.remove(object)
                canvas.renderAll()
            }
        })
    })
}

export const modifyObj = canvas => {
    socket.off('new-modification')
    socket.on('new-modification', data => {
        const { obj, id } = data
        canvas.getObjects().forEach(object => {
            if (object.id === id) {
                object.set({ left: obj.left, top: obj.top, angle: obj.angle, scaleX: obj.scaleX, scaleY: obj.scaleY, text: obj.text, width: obj.width, height: obj.height, erasable: true })
                object.setCoords()
                canvas.requestRenderAll()
            }
        })

    })
}

export const remoteEraser = canvas => {
    socket.off('remote-erase');
    socket.on('remote-erase', async ({ path, targetIds }) => {
        // Find targets by id
        const targets = canvas.getObjects().filter(obj => targetIds.includes(obj.id));
        // Recreate the path object from its data
        const pathObj = new fabric.Path(path.path, path);
        // Use a local EraserBrush instance to commit the erasing
        const eraser = new EraserBrush(canvas);
        await eraser.commit({ path: pathObj, targets });
        canvas.requestRenderAll();
    });

}

export const remotePointer = canvas => {
    socket.off('remote-pointer')
    let pathCommand = ""
    const pointerLength = 10

    socket.on('remote-pointer', data => {
        const { x, y, drawingStart, drawing, drawingEnd, pointerStopped } = data

        var pointerPath = canvas.getObjects().find(obj => obj.remotePointerPath === true)
        var remotePath = canvas.getObjects().find(obj => obj.remotePath === true)
        if (!pointerPath) {
            pointerPath = new fabric.Path(pathCommand, { strokeWidth: 3, stroke: 'yellow', fill: null, remotePointerPath: true, objectCaching: false, excludeFromExport: 'true' });
            canvas.add(pointerPath);
            canvas.renderAll()
        }
        else {
            if (!drawing && !drawingStart && !drawingEnd) {
                pointerPath.path.push(['L', x, y]);
                let pathLength = pointerPath.path.length
                if (pathLength > pointerLength) pointerPath.path.splice(0, pathLength - pointerLength)
            }
            if (drawingStart) {
                if (!remotePath) {
                    remotePath = new fabric.Path(pathCommand, { strokeWidth: 3, stroke: 'black', fill: null, remotePath: true, objectCaching: false });
                    canvas.add(remotePath);
                    canvas.renderAll()
                }
                remotePath.path = [['M', x, y]];
                if (pointerPath) canvas.remove(pointerPath)
            }
            if (drawing) {
                remotePath.path.push(['L', x, y]);
            }
            if (drawingEnd) {
                canvas.remove(remotePath)
            }

            if (pointerStopped) {
                canvas.remove(pointerPath)
            }
            canvas.requestRenderAll();
        }
    })
}

export default socket