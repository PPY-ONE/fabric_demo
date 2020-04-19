import { fabric } from 'fabric';

export function makeDetectCircle (left, top) {
  return new fabric.Circle({
    left: left,
    top: top,
    radius: 4,
    stroke: '#fff',
    fill: '',
    selectable: false,
    hasBorders: false,
    hasControls: false,
    evented: false
  });
}