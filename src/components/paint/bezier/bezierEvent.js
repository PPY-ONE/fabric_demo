import {
  makebezierP
} from './bezier'

// 存放锚点的数组
let anchorArr = []
let currentP = {} // 当前鼠标的位置
let temAnchor = undefined

export function bezierMouseDown (options, canvas) {
  currentP.x = options.e.offsetX
  currentP.y = options.e.offsetY
  // 如果是第一个锚点
  if (!anchorArr.length) {
    let anchor = makebezierP(currentP.x, currentP.y, null)
    anchorArr.push(anchor)
    canvas.add(anchor)
  }
}

export function bezierMouseMove (options, canvas) {
  canvas.remove(temAnchor)
  if (anchorArr.length) {
    currentP.x = options.e.offsetX
    currentP.y = options.e.offsetY
    temAnchor = makebezierP(currentP.x, currentP.y)
    canvas.add(temAnchor)
    
  }
}
