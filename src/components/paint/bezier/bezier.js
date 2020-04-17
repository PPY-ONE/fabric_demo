import { fabric } from 'fabric';
// 创建锚点的方法
export function makeBezierP (left, top, preConP, nextConP, conLine) {
  var c = new fabric.Circle({
    left: left,
    top: top,
    strokeWidth: 1,
    radius: 4,
    fill: '#fff',
    stroke: '#666'
  });

  c.hasBorders = c.hasControls = false;
  // preConP 是上一条线的控制点 nextConP是下一条线的控制点
  c.preConP = preConP;
  c.nextConP = nextConP;
  // 两个控制点连成的线
  c.conLine = conLine;
  c.name = 'anchor';
  return c;
}
// 创建控制点的方法
export function makePreConP (left, top, anchor) {
  var c = new fabric.Circle({
    left: left,
    top: top,
    strokeWidth: 1,
    radius: 4,
    fill: '#1976d2',
    stroke: '#666'
  });

  c.hasBorders = c.hasControls = false;
  c.name = 'prePoint';
  c.anchor = anchor;
  return c;
}
export function makeNextConP (left, top, anchor) {
  var c = new fabric.Circle({
    left: left,
    top: top,
    strokeWidth: 1,
    radius: 4,
    fill: '#1976d2',
    stroke: '#666'
  });

  c.hasBorders = c.hasControls = false;
  c.name = 'nextPoint';
  c.anchor = anchor;
  return c;
}