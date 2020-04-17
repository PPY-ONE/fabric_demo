// 获得长度
export function getLength (coords) {
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
// 设置透明度
export function setOpacity (obj, val, canvas) {
  obj.animate('opacity', val, {
    duration: 200,
    onChange: canvas.renderAll.bind(canvas)
  })
}