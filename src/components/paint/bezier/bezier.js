import { fabric } from 'fabric'
// 创建锚点的方法
export function makebezierP (left, top, preConP, nextConP) {
  var c = new fabric.Circle({
    left: left,
    top: top,
    strokeWidth: 1,
    radius: 4,
    fill: '#fff',
    stroke: '#666'
  })

  c.hasBorders = c.hasControls = false
  // preConP 是上一条线的控制点 nextConP是下一条线的控制点
  c.preConP = preConP
  c.nextConP = nextConP
  return c
}
// 创建控制点的方法
export function makebezierConP (left, top) {
  var c = new fabric.Circle({
    left: left,
    top: top,
    strokeWidth: 1,
    radius: 4,
    fill: '#fff',
    stroke: '#666'
  })

  c.hasBorders = c.hasControls = false
  return c
}