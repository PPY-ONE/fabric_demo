import { makeCircle, makeLine } from './line'

let startX, startY, endX, endY

// canvas 对象
let c = null
let temLine = null 
// 长度文本设置  让它开始时不显示
let lenText = 0
let startCircle = null
let endCircle = null

let color = '#fff'
// 鼠标移入时的 线 原本的颜色
let originColor

export function mouseDown (options, type, canvas) {
  if (type === 'line' || type === 'changeColor') {
    c = canvas
    drawLineMouseDown(options, type, canvas)
  }
}

export function mouseMove (options, type, canvas) {
  if(type === 'line' || type === 'changeColor') {
    drawLineMouseMove (options, canvas)
  }
}

export function mouseUp (options, type) {
  if(type === 'line' || type === 'changeColor') {
    drawLineMouseUp(options)
  }
}

export function ObjMoving (e) { 
  // console.log('objMoving')
  let p = e.target
  p.line1 && p.line1.set({ 'x2': p.left, 'y2': p.top })
  p.line2 && p.line2.set({ 'x1': p.left, 'y1': p.top })
  
  let x1 = p.left
  let y1 = p.top
  let x2 = p.line3.left
  let y2 = p.line3.top
  let coords = [x1, y1, x2, y2]
  let length = getLength(coords)
  p.line4 && p.line4.set({
    'left': p.left,
    'top': p.top,
    'text': '长度：' + length
  })
  c.renderAll()
}

export function mouseOver (e, type) {
  let target = e.target
  if (type === 'select') {
    selectHoverHandler(target, '1')
  }
  if (type === 'delete') {
    deleteHoverHandler(target, 'over')
  }
}
export function mouseOut (e, type) {
  let target = e.target
  if (type === 'select') {
    selectHoverHandler(target, '0')
  }
  if (type === 'delete') {
    deleteHoverHandler(target, 'out')
  }
}

export function handleObjSelect (e, type) {
  if (type === 'delete') {
    let delObj = e.target
    c.remove(delObj)
  }
}

// 选择时鼠标移入移出事件
function selectHoverHandler (target, opaVal) {
  if (target) {
    if (target.name === 'line') {
      target.set({
        evented: false
      })
    } else {
      target.set({
        selectable: true
      })
      setOpacity(target, opaVal, c)
      if (target.line3 && target.line4) {
        setOpacity(target.line3, opaVal, c)
        setOpacity(target.line4, opaVal, c)
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
  canvas.on('mouse:move', options => mouseMove(options, type, canvas))
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
function drawLineMouseUp () {
  if (!endX && !endY) {
    c.remove(temLine)
  }
  c.off('mouse:move')
  c.remove(temLine, lenText, startCircle, endCircle)
  let coords = [startX, startY, endX, endY]
  let line = makeLine(coords, color)
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
  let fStartCircle = makeCircle(startX, startY, null, line, null, text)
  // 终点坐标的小球
  let fEndCircle = makeCircle(endX, endY, line, null, fStartCircle, text)
  fStartCircle.line3 = fEndCircle
  c.add(line, text, fStartCircle, fEndCircle)
  setOpacity(text, '0', c)
  setOpacity(fStartCircle, '0', c)
  setOpacity(fEndCircle, 0, c)
  // 如果只是点击则让线连接上 上次的线的终点
  endY = startY
  endX = startX
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
