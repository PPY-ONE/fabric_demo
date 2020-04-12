import { fabric } from 'fabric'

export function makeLine (coords, strokeColor, lConCircle, rConCircle, flenText) {
  let line = new fabric.Line(coords, {
    stroke: strokeColor,
    strokeWidth: 1,
    selectable: false,
    // evented: false,
    hasBorders: false,
    hasControls: false,
    name: 'line'
  })

  line.lConCircle = lConCircle
  line.rConCircle = rConCircle
  line.flenText = flenText

  return line
}

export function makeCircle (left, top, line1, line2, line3, line4, line5) {
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
  // line3保存左侧小球 line4保存右侧小球
  c.line3 = line3
  c.line4 = line4
  // line5保存长度文本框
  c.line5 = line5
  c.name = 'controlCircle'
  return c
}
