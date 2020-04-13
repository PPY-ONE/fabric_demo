import { makeCircle, makeLine } from './line'
import { fabric } from 'fabric'
import {
  bezierMouseDown,
  bezierMouseMove
} from './bezier/bezierEvent'

let startX, startY, endX, endY

// canvas 对象
let c = null
let temLine = undefined
// 长度文本设置  让它开始时不显示
let lenText = 0
let startCircle = null
let endCircle = null
let positionText = null

let color = '#fff'
// 鼠标移入时的 线 原本的颜色
let originColor

export function mouseDown (options, type, canvas) {
  c = canvas
  if (type === 'line' || type === 'changeColor') {
    drawLineMouseDown(options, type, canvas)
  }
  if (type === 'bezier') {
    bezierMouseDown(options, canvas)
  }
}

export function mouseMove (options, type, canvas) {
  showMovePosition (options, canvas)
  if (type === 'line' || type === 'changeColor') {
    drawLineMouseMove (options, canvas)
  }
  if (type === 'bezier') {
    bezierMouseMove(options, canvas)
  }
}

export function mouseUp (options, type, canvas) {
  if (type === 'line' || type === 'changeColor') {
    drawLineMouseUp(options, canvas)
  }
}

export function ObjMoving (e, type) {
  if (type === 'select') {
    let targetLine
    let modifyLine
    let anotherCircle

    let p = e.target
    p.line1 && p.line1.set({ 'x2': p.left, 'y2': p.top })
    p.line2 && p.line2.set({ 'x1': p.left, 'y1': p.top })

    if (p.line1) targetLine = p.line1
    if (p.line2) targetLine = p.line2
    if (p.line3) anotherCircle = p.line3
    if (p.line4) anotherCircle = p.line4

    modifyLine = Object.assign(targetLine, modifyLine)
    console.log(modifyLine)

    let x1 = p.left
    let y1 = p.top
    let x2 = anotherCircle.left
    let y2 = anotherCircle.top
    let coords = [x1, y1, x2, y2]
    let length = getLength(coords)
    p.line5 && p.line5.set({
      'left': p.left + 12,
      'top': p.top + 12,
      'text': '长度：' + length
    })
    c.remove(targetLine)
    c.add(modifyLine)

    c.renderAll()
  }
}

export function mouseOver (e, type) {
  let target = e.target
  if (type === 'select') {
    selectHoverHandler(target, '1', type)
  }
  if (type === 'delete') {
    deleteHoverHandler(target, 'over')
  }
}
export function mouseOut (e, type) {
  let target = e.target
  if (type === 'select') {
    selectHoverHandler(target, '0', type)
  }
  if (type === 'delete') {
    deleteHoverHandler(target, 'out')
  }
}

export function handleObjSelect (e, type) {
  let delObj = e.target
  if (type === 'delete' && delObj.name !== 'controlCircle') {
    c.remove(delObj, delObj.lConCircle, delObj.rConCircle, delObj.flenText)
  }
}

// 显示鼠标的坐标值
function showMovePosition (options, canvas) {
  canvas.remove(positionText)
  let e = options.e
  let x = e.offsetX
  let y = e.offsetY
  positionText = new fabric.Text(`x:${x},y:${y}`, {
    top: 0,
    left: 0,
    fontSize: 10,
    originX: 'left',
    originY: 'top',
    backgroundColor: '#fff',
    fontFamily: 'Arial',
    selectable: false,
    hasBorders: false
  })
  canvas.add(positionText)
}

// 选择时鼠标移入移出事件
function selectHoverHandler (target, opaVal, type) {
  if (target) {
    if (target.name === 'controlCircle') {
      let anotherCircle
      if (target.line3) anotherCircle = target.line3
      if (target.line4) anotherCircle = target.line4
      target.set({
        selectable: true
      })
      setOpacity(target, opaVal, c)
      if (anotherCircle && target.line5) {
        setOpacity(anotherCircle, opaVal, c)
        setOpacity(target.line5, opaVal, c)
      }
      c.renderAll()
    }
  }
}

// 删除时 鼠标移入移出事件
function deleteHoverHandler (target, type) {
  if (target) {
    if (type === 'over') {
      originColor = target.get('stroke')
      target.set({
        selectable: true,
        stroke: '#8e4483'
      })
    }
    if (type === 'out') {
      target.set({
        selectable: true,
        stroke: originColor
      })
    }
    c.renderAll()
  }
}

// 画线的鼠标点击事件
function drawLineMouseDown (options, type, canvas) {
  // console.log('鼠标点击时得到的color--- ' + color)
  startX = options.e.offsetX
  startY = options.e.offsetY
  // canvas.on('mouse:move', options => mouseMove(options, type, canvas))
}

// 画线的鼠标移动事件
function drawLineMouseMove (options, canvas) {
  // 未点击的时候不让长度显示
  if (!startX) {
    canvas.remove(lenText)
    return
  }
  canvas.remove(temLine, lenText, startCircle, endCircle)
  endX = options.e.offsetX
  endY = options.e.offsetY
  let coords = [startX, startY, endX, endY]
  // console.log(coords)
  temLine = makeLine(coords, color)

  // 开始点的小球
  startCircle = makeCircle(startX, startY, null, temLine, endCircle, lenText)
  // 终点坐标的小球
  endCircle = makeCircle(endX, endY, temLine, null, startCircle, lenText)

  let length = getLength(coords)
  lenText = new fabric.Text('长度：' + length, {
    top: endY + 12,
    left: endX + 12,
    fontSize: 12,
    stroke: '#fff',
    fill: '#fff',
    selectable: false
  })

  canvas.add(temLine, lenText, startCircle, endCircle)
}

// 画线的鼠标松开事件
function drawLineMouseUp (options, canvas) {
  if (!endX && !endY) {
    c.remove(temLine)
  }
  // c.off('mouse:move')
  c.remove(temLine, lenText, startCircle, endCircle)
  temLine = undefined
  let coords = [startX, startY, endX, endY]
  let line = makeLine(coords, color, null, null, null)
  let length = getLength(coords)
  let text = new fabric.Text('长度：' + length, {
    top: endY + 12,
    left: endX + 12,
    fontSize: 12,
    stroke: '#fff',
    fill: '#fff',
    selectable: false,
    evented: false
  })
  // 开始点的小球
  // let fStartCircle = makeCircle(startX, startY, null, line, null, text)
  let fStartCircle = makeCircle(startX, startY, null, line, null, null, text)
  // 终点坐标的小球
  let fEndCircle = makeCircle(endX, endY, line, null, fStartCircle, null, text)
  fStartCircle.line4 = fEndCircle
  line.lConCircle = fStartCircle
  line.rConCircle = fEndCircle
  line.flenText = text
  c.add(line, text, fStartCircle, fEndCircle)
  setOpacity(text, '0', c)
  setOpacity(fStartCircle, '0', c)
  setOpacity(fEndCircle, 0, c)
  endY = startY = endX = startX = undefined
}

// 获得长度
function getLength (coords) {
  let [
    startX,
    startY,
    endX,
    endY
  ] = coords
  let w = startX - endX
  let h = startY - endY
  let length = Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2))
  return length
}
// 获得颜色
export function getColor (newColor) {
  // console.log('get color得到的---' + newColor)
  if (!getColor) {
    color = 'white'
  }
  color = newColor
}

// 设置透明度
function setOpacity (obj, val, canvas) {
  obj.animate('opacity', val, {
    duration: 200,
    onChange: canvas.renderAll.bind(canvas)
  })
}
