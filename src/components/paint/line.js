import { fabric } from 'fabric'

export function makeLine (coords, strokeColor) {
  return new fabric.Line(coords, {
    stroke: strokeColor,
    strokeWidth: 1,
    selectable: false,
    // evented: false,
    hasBorders: false,
    hasControls: false,
    name: 'line'
  })
}

export function makeCircle (left, top, line1, line2, line3, line4) {
  var c = new fabric.Circle({
    left: left,
    top: top,
    strokeWidth: 1,
    radius: 6,
    fill: '#fff',
    stroke: '#666',
    selectable: false
  })
  c.hasControls = c.hasBorders = false
  // line1 line2 是控制线的两端的
  c.line1 = line1
  c.line2 = line2
  // line3保存另一端的小球
  c.line3 = line3
  // line4保存长度文本框
  c.line4 = line4
  return c
}
