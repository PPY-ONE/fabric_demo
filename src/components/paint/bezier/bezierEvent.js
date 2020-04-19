import { makeBezierP, makePreConP, makeNextConP } from './bezier';
import { fabric } from 'fabric';
import { setOpacity, getLength } from '../tools';

let c;
let bezierArr = []; // 存放 贝兹曲线对象（bezierId + anchorArr）的数组
let bezierObj = {}; // 存放当前的贝兹曲线的对象
let anchorArr = []; // 存放锚点的数组
let currentP = {}; // 当前鼠标的坐标
let isMouseDown = false; // 鼠标是否按下
let isMouseMove = false; // 鼠标是否移动
let cAnchor; // 当前锚点
let preAnpreConp; // 上一个锚点的上一条线的控制点
let preAnNextConp; // 上一个锚点的下一条线的控制点
let temAnchor;
let temPath;
let temBezier;
let singleBezierArr = []; // 存放每一次生成的三阶贝兹曲线的数组
let isAlt = false;
let isMoving = false;
let isAnMove = false;
let controlL; // 同一个锚点的两个控制点连成的线
let visiableArr = []; // 鼠标移入时显示的对象数组
let visiableAnchor = []; // 鼠标移入时变色的锚点数组
let noEventAn = []; // 没有按下alt时让锚点不能进行编辑

export function bezierMouseDown (options, color, canvas) {
  if (isMoving || isAlt || isAnMove) return;
  c = canvas;
  window.c = c;
  if (temBezier) canvas.add(temBezier);
  isMouseDown = true;
  isMouseMove = false;
  currentP.x = options.e.offsetX;
  currentP.y = options.e.offsetY;
  // 默认 两个控制点 与 锚点重合
  let preCon = makePreConP(currentP.x, currentP.y, null);
  let nextCon = makeNextConP(currentP.x, currentP.y, null);
  cAnchor = makeBezierP(currentP.x, currentP.y, preCon, nextCon, null);
  preCon.anchor = cAnchor;
  nextCon.anchor = cAnchor;
  // 给每个加入的锚点添加id
  cAnchor.id = 'an' + anchorArr.length;
  anchorArr.push(cAnchor);
  canvas.add(cAnchor);
}

export function bezierMouseMove (options, color, canvas) {
  // 如果是锚点移动 控制点移动状态 则退出
  if (isMoving || isAnMove) return;
  if (options.e.altKey) {
  }
  c = canvas;
  isMouseMove = true;
  // 如果只有一个锚点 退出
  if (!anchorArr.length) return;
  // 不止一个锚点的时候
  canvas.remove(temPath, temAnchor);
  currentP.x = options.e.offsetX;
  currentP.y = options.e.offsetY;
  let preP = makePreConP(currentP.x, currentP.y, null);
  let nextP = makeNextConP(currentP.x, currentP.y, null);
  temAnchor = makeBezierP(currentP.x, currentP.y, preP, nextP, null);
  preP.anchor = temAnchor;
  nextP.anchor = temAnchor;
  // 获取上一个锚点
  let preAnchor = anchorArr[anchorArr.length - 1];
  let conX1 = preAnchor.nextConP.left;
  let conY1 = preAnchor.nextConP.top;
  let conX2 = currentP.x;
  let conY2 = currentP.y;
  temPath = new fabric.Path(`M ${preAnchor.left} ${preAnchor.top} C ${conX1}, ${conY1}, ${conX2}, ${conY2}, ${currentP.x}, ${currentP.y}`, {
    fill: '',
    stroke: color,
    selectable: false,
    hasBorders: false,
    hasControls: false,
    evented: false
  });
  canvas.add(temPath, temAnchor);
  // 如果鼠标按下 不松开
  if (isMouseDown && anchorArr.length > 1) {
    canvas.remove(temBezier, controlL, preAnpreConp, preAnNextConp);
    let preTAn = anchorArr[anchorArr.length - 2]; // 上一条线的开始锚点
    let preAn = anchorArr[anchorArr.length - 1]; // 上一条线的结束锚点
    let conX1 = preTAn.nextConP.left;
    let conY1 = preTAn.nextConP.top;
    let conX2 = preAn.left * 2 - currentP.x;
    let conY2 = preAn.top * 2 - currentP.y;
    preAnpreConp = makePreConP(conX2, conY2, preAn);
    preAn.preConP = preAnpreConp;
    preAn.nextConP.set({
      left: currentP.x,
      top: currentP.y
    });
    preAnNextConp = preAn.nextConP;
    // console.log(preAn);
    temBezier = new fabric.Path(`M ${preTAn.left} ${preTAn.top} C ${conX1}, ${conY1}, ${conX2}, ${conY2}, ${preAn.left}, ${preAn.top}`, {
      fill: '',
      stroke: color,
      selectable: false,
      hasControls: false,
      hasBorders: false,
      evented: false
    });
    // console.log(preAn);
    controlL = new fabric.Line([
      preAn.preConP.left,
      preAn.preConP.top,
      preAn.nextConP.left,
      preAn.nextConP.top
    ], {
      stroke: '#fff',
      hasControls: false,
      hasBorders: false,
      evented: false,
      selectable: false
    });
    preAn.conLine = controlL;
    canvas.add(temBezier, controlL, preAnpreConp, preAnNextConp);
  }
}

export function bezierMouseUp (options, color, canvas) {
  if (isMoving || isAnMove) {
    isAnMove = false;
    isMoving = false;
    return;
  }
  c = canvas;
  isMouseDown = false;
  if (controlL) {
    canvas.add(preAnpreConp, preAnNextConp, controlL);
    setOpacity(preAnpreConp, '0', canvas);
    setOpacity(preAnNextConp, '0', canvas);
    setOpacity(controlL, '0', canvas);
  }
  // 把每一次的三阶贝兹曲线存进数组
  if (temBezier) {
    temBezier.singleId = 'bezier' + bezierArr.length + 'single' + singleBezierArr.length;
    singleBezierArr.push(temBezier);
  }
  if (!isMouseMove && temPath) {
    canvas.add(temPath);
    canvas.remove(temBezier);
  }
}
export function bezierMouseOver (target) {
  // if (target) console.log(target.name);
  if (!isAlt && target && target.id && target.name === 'anchor') {
    // 实际上 这里处理的是第一个锚点 没有被skipTargetFind的问题
    // 数组中只有第一个锚点
    target.set({
      selectable: false,
      evented: false
    });
    noEventAn.push(target);
  }
  if (isAlt) {
    if (target && target.name === 'anchor') {
      isAnMove = true;
      isMoving = true;
      target.set({
        stroke: '#efcc73',
        fill: '#efcc73'
        // selectable: false
      });
      if (!target.conLine) {
        visiableAnchor.push(target);
        return;
      }
      // 如果是最后一个锚点
      let modBezier;
      let modIndex;
      bezierArr.some(bezier => {
        if (bezier.id === target.bezierId) {
          modBezier = bezier;
          return true;
        }
      });
      modBezier.anchorArr.some((anchor, i) => {
        if (anchor.id === target.id) {
          modIndex = i;
          return true;
        }
      });
      if (modIndex === modBezier.anchorArr.length - 1) {
        // 处理最后一个锚点
        target.nextConP.set({
          left: target.left,
          top: target.top,
          stroke: '',
          fill: '',
          selectable: false,
          evented: false
        });
        target.conLine.set({
          x1: target.left,
          y1: target.top,
          x2: target.preConP.left,
          y2: target.preConP.top
        });
      }
      // console.log(target.conLine);
      // c.add(target.preConP, target.nextConP, target.conLine);
      setOpacity(target.preConP, '1', c);
      setOpacity(target.nextConP, '1', c);
      setOpacity(target.conLine, '1', c);
      visiableArr.push(target.preConP, target.nextConP, target.conLine);
      visiableAnchor.push(target);
    }
  }
}
// 没有按下alt 则把之前显示的全部隐藏
function isAltArrVisiable () {
  if (!isAlt) {
    if (c) c.skipTargetFind = true;
    visiableArr.forEach(obj => {
      setOpacity(obj, '0', c);
    });
    visiableAnchor.forEach(obj => {
      obj.set({
        stroke: '#666',
        fill: '#fff'
        // selectable: false
      });
    });
  } else {
    // 按下了alt
    c.skipTargetFind = false;
    visiableAnchor.forEach(obj => {
      obj.set({
        stroke: '#efcc73',
        fill: '#efcc73'
        // selectable: false
      });
    });
  }
}
// 物件移动处理函数
let isFirst = 1;
let clonePre = {};
let cloneNext = {};
// 调整锚点和控制点的函数
export function moveControlPoint (e) {
  let target = e.target;
  if (target.name === 'prePoint' || target.name === 'nextPoint') {
    // if (!isMoving) return;
    isMoving = true;
    controlPointHandle(e);
  }
  if (target.name === 'anchor') {
    if (!isAnMove) return;
    isAnMove = true;
    if (isFirst === 1) {
      isFirst++;
      clonePre.x = e.target.preConP.left;
      clonePre.y = e.target.preConP.top;
      cloneNext.x = e.target.nextConP.left;
      cloneNext.y = e.target.nextConP.top;
    }
    anchorMovingHandle(e, clonePre, cloneNext);
  }
}
// 重置初始值
export function bezierMouseOut (target) {
  if (target && target.name === 'anchor') {
    clonePre = {};
    cloneNext = {};
    isFirst = 1;
  }
}
// 监听键盘事件
window.onkeydown = function (e) {
  e = e || window.event;
  e.preventDefault();
  switch (e.key) {
    case 'Escape':
      escHandler();
      break;
    case 'Delete':
      console.log('Delete');
      break;
    case 'Alt':
      noEventAn.forEach(obj => {
        obj.set({
          selectable: true,
          evented: true
        });
      });
      if (!bezierArr.length) return;
      isAlt = true;
      isAltArrVisiable();
      break;
    default:
      break;
  }
};
window.onkeyup = function (e) {
  if (e.keyCode === 18) {
    isAlt = false;
    isAltArrVisiable();
    visiableAnchor = [];
    visiableArr = [];
  }
};
// 当同时按下 esc 和 alt的时候 系统会切换当其他窗口 手动将isAlt重置为false
window.onblur = function () {
  isAlt = false;
  isAltArrVisiable();
};
// ESC处理函数 重置所有状态
function escHandler () {
  if (anchorArr.length < 2) return;
  isAnMove = false;
  isMoving = false;
  isAlt = false;
  isMouseMove = false;
  isMouseDown = false;
  currentP = {};
  cAnchor = undefined;
  preAnNextConp = undefined;
  preAnpreConp = undefined;
  c.remove(temAnchor, temPath);
  temAnchor = undefined;
  temPath = undefined;
  temBezier = undefined;
  controlL = undefined;
  visiableAnchor = [];
  visiableArr = [];
  // 整条贝兹曲线的id
  bezierObj.id = bezierArr.length;
  // 为每个锚点绑定所在整条贝兹曲线的id
  anchorArr.forEach(obj => {
    obj.bezierId = bezierObj.id;
  });
  // 将锚点数 组存放到整条贝兹曲线对象上
  bezierObj.anchorArr = anchorArr;
  // 将单个贝兹曲线的数组放入整条贝兹曲线的对象上
  bezierObj.singleBezierArr = singleBezierArr;
  bezierArr.push(bezierObj);
  singleBezierArr = [];
  bezierObj = {};
  anchorArr = [];
}
// 调整 控制点 的处理函数
function controlPointHandle (e) {
  // 先调整锚点 不松开alt 继续调整控制点 这里是不触发的
  let target = e.target;
  let currentX = e.e.offsetX;
  let currentY = e.e.offsetY;
  let anchor = target.anchor;
  let modH = currentY - anchor.top;
  let modW = currentX - anchor.left;
  let coords = [anchor.left, anchor.top, currentX, currentY];
  let modL = getLength(coords);
  let anotherCP; // 另一个控制点
  let modBezier; // 被修改的贝兹曲线
  let modAnIndex; // 被选中的锚点的索引
  if (anchor.preConP.name === target.name) {
    anotherCP = anchor.nextConP;
  } else if (anchor.nextConP.name === target.name) {
    anotherCP = anchor.preConP;
  }
  coords = [anotherCP.left, anotherCP.top, anchor.left, anchor.top];
  let anotherL = getLength(coords); // 另一个点到锚点的距离  是固定的
  let HL = Math.abs(modH / modL); // H 和 L的比例
  let WL = Math.abs(modW / modL); // W 和 L的比例
  let anotherH = HL * anotherL;
  let anotherW = WL * anotherL;
  // console.log(anotherH, anotherW);
  if (modH > 0) {
    // 鼠标移动在 锚点的下边
    anotherCP.set({
      top: anchor.top - anotherH
    });
  } else if (modH < 0) {
    // 鼠标移动到 锚点的上边
    anotherCP.set({
      top: anchor.top + anotherH
    });
  }
  if (modW > 0) {
    // 鼠标移动 在锚点的 右边
    anotherCP.set({
      left: anchor.left - anotherW
    });
  } else if (modW < 0) {
    // 鼠标移动在 锚点的 左边
    anotherCP.set({
      left: anchor.left + anotherW
    });
  }
  // 更新控制线的位置
  anchor.conLine.set({
    x1: target.left,
    y1: target.top,
    x2: anotherCP.left,
    y2: anotherCP.top
  });
  let newAnotherCP = Object.assign(anotherCP, {});
  c.remove(anotherCP).add(newAnotherCP);
  // 更新贝兹曲线
  bezierArr.some(bezier => {
    if (bezier.id === anchor.bezierId) {
      modBezier = bezier;
      return true;
    }
  });
  modBezier.anchorArr.forEach((item, index) => {
    if (item.id === anchor.id) {
      modAnIndex = index;
    }
  });
  let preAn = modBezier.anchorArr[modAnIndex - 1]; // 当前锚点的 上一个锚点
  let nextAn = modBezier.anchorArr[modAnIndex + 1]; // 当前锚点的 下一个锚点
  let preBezier = modBezier.singleBezierArr[modAnIndex - 1];
  let nextBezier = modBezier.singleBezierArr[modAnIndex];
  // 移动最后一个锚点的控制点时
  if (modAnIndex === modBezier.anchorArr.length - 1) {
    if (target.name === 'prePoint') {
      let newPreBezier = new fabric.Path(`M ${preAn.left} ${preAn.top} C ${preAn.nextConP.left}, ${preAn.nextConP.top}, ${target.left}, ${target.top}, ${anchor.left}, ${anchor.top}`, {
        fill: '',
        stroke: '#fff',
        hasBorders: false,
        hasControls: false,
        selectable: false,
        evented: false
      });
      c.remove(preBezier);
      c.add(newPreBezier);
      modBezier.singleBezierArr[modAnIndex - 1] = newPreBezier;
    }
    if (target.name === 'nextPoint') return;
    return;
  }
  if (target.name === 'prePoint') {
    let newPreBezier = new fabric.Path(`M ${preAn.left} ${preAn.top} C ${preAn.nextConP.left}, ${preAn.nextConP.top}, ${target.left}, ${target.top}, ${anchor.left}, ${anchor.top}`, {
      fill: '',
      stroke: '#fff',
      hasBorders: false,
      hasControls: false,
      selectable: false,
      evented: false
    });
    let newNextBezier = new fabric.Path(`M ${anchor.left} ${anchor.top} C ${anotherCP.left}, ${anotherCP.top}, ${nextAn.preConP.left}, ${nextAn.preConP.top}, ${nextAn.left}, ${nextAn.top}`, {
      fill: '',
      stroke: '#fff',
      hasBorders: false,
      hasControls: false,
      selectable: false,
      evented: false
    });
    c.remove(preBezier, nextBezier);
    c.add(newNextBezier, newPreBezier);
    modBezier.singleBezierArr[modAnIndex - 1] = newPreBezier;
    modBezier.singleBezierArr[modAnIndex] = newNextBezier;
  } else if (target.name === 'nextPoint') {
    let newPreBezier = new fabric.Path(`M ${preAn.left} ${preAn.top} C ${preAn.nextConP.left}, ${preAn.nextConP.top}, ${anotherCP.left}, ${anotherCP.top}, ${anchor.left}, ${anchor.top}`, {
      fill: '',
      stroke: '#fff',
      hasBorders: false,
      hasControls: false,
      selectable: false,
      evented: false
    });
    let newNextBezier = new fabric.Path(`M ${anchor.left} ${anchor.top} C ${target.left}, ${target.top}, ${nextAn.preConP.left}, ${nextAn.preConP.top}, ${nextAn.left}, ${nextAn.top}`, {
      fill: '',
      stroke: '#fff',
      hasBorders: false,
      hasControls: false,
      selectable: false,
      evented: false
    });
    c.remove(preBezier, nextBezier);
    c.add(newNextBezier, newPreBezier);
    modBezier.singleBezierArr[modAnIndex - 1] = newPreBezier;
    modBezier.singleBezierArr[modAnIndex] = newNextBezier;
  }
}
// 调整 锚点 的处理函数
function anchorMovingHandle (e, clonePre, cloneNext) {
  // console.log(clonePre);
  let target = e.target;
  //  e的transform属性中有original对象记录原始信息
  let originX = e.transform.original.left;
  let originY = e.transform.original.top;
  let originPreW = clonePre.x - originX;
  let originPreH = clonePre.y - originY;
  let originNextW = cloneNext.x - originX;
  let originNextH = cloneNext.y - originY;
  target.preConP.set({
    left: target.left + originPreW,
    top: target.top + originPreH
  });
  target.nextConP.set({
    left: target.left + originNextW,
    top: target.top + originNextH
  });
  let newPreCP = Object.assign(target.preConP, {});
  let newNextCP = Object.assign(target.nextConP, {});
  c.remove(target.preConP, target.nextConP).add(newPreCP, newNextCP);
  target.nextConP = newNextCP;
  target.preConP = newPreCP;
  // console.log(prePX, target.preConP.left);
  if (target.conLine) {
    target.conLine.set({
      x1: target.preConP.left,
      y1: target.preConP.top,
      x2: target.nextConP.left,
      y2: target.nextConP.top
    });
  }
  // 更新贝兹曲线
  let modBezier; // 被修改的贝兹曲线
  let modAnIndex; // 被选中的锚点的索引
  bezierArr.some(bezier => {
    if (bezier.id === target.bezierId) {
      modBezier = bezier;
      return true;
    }
  });
  modBezier.anchorArr.forEach((item, index) => {
    if (item.id === target.id) {
      modAnIndex = index;
    }
  });
  let preAn = modBezier.anchorArr[modAnIndex - 1]; // 当前锚点的 上一个锚点
  let nextAn = modBezier.anchorArr[modAnIndex + 1]; // 当前锚点的 下一个锚点
  let preBezier = modBezier.singleBezierArr[modAnIndex - 1];
  let nextBezier = modBezier.singleBezierArr[modAnIndex];
  // 如果是移动第一个锚点
  if (modAnIndex === 0) {
    let newNextBezier = new fabric.Path(`M ${target.left} ${target.top} C ${target.nextConP.left}, ${target.nextConP.top}, ${nextAn.preConP.left}, ${nextAn.preConP.top}, ${nextAn.left}, ${nextAn.top}`, {
      stroke: '#fff',
      fill: '',
      hasBorders: false,
      hasControls: false,
      selectable: false,
      evented: false
    });
    // TODO: 注意 这里把第一个锚点的 控制点 remove了
    c.remove(target.nextConP, target.preConP, nextBezier);
    c.add(newNextBezier);
    modBezier.singleBezierArr[modAnIndex] = newNextBezier;
    return;
  }
  // 如果是移动最后一个锚点
  if (modAnIndex === modBezier.anchorArr.length - 1) {
    // 它的下一个控制点应该由下一个锚点拖动决定 但是这已经是最后一个锚点 所以默认重合
    target.nextConP.set({
      left: target.left,
      top: target.top
    });
    target.conLine.set({
      x1: target.preConP.left,
      y1: target.preConP.top,
      x2: target.nextConP.left,
      y2: target.nextConP.top
    });
    let newPreBezier = new fabric.Path(`M ${preAn.left} ${preAn.top} C ${preAn.nextConP.left}, ${preAn.nextConP.top}, ${target.preConP.left}, ${target.preConP.top}, ${target.left}, ${target.top}`, {
      stroke: '#fff',
      fill: '',
      hasBorders: false,
      hasControls: false,
      selectable: false,
      evented: false
    });
    c.remove(preBezier);
    c.add(newPreBezier);
    modBezier.singleBezierArr[modAnIndex - 1] = newPreBezier;
    return;
  }
  let newPreBezier = new fabric.Path(`M ${preAn.left} ${preAn.top} C ${preAn.nextConP.left}, ${preAn.nextConP.top}, ${target.preConP.left}, ${target.preConP.top}, ${target.left}, ${target.top}`, {
    stroke: '#fff',
    fill: '',
    hasBorders: false,
    hasControls: false,
    selectable: false,
    evented: false
  });
  let newNextBezier = new fabric.Path(`M ${target.left} ${target.top} C ${target.nextConP.left}, ${target.nextConP.top}, ${nextAn.preConP.left}, ${nextAn.preConP.top}, ${nextAn.left}, ${nextAn.top}`, {
    stroke: '#fff',
    fill: '',
    hasBorders: false,
    hasControls: false,
    selectable: false,
    evented: false
  });
  c.remove(preBezier, nextBezier);
  c.add(newNextBezier, newPreBezier);
  modBezier.singleBezierArr[modAnIndex - 1] = newPreBezier;
  modBezier.singleBezierArr[modAnIndex] = newNextBezier;
}
// 删除锚点
export function delAnchor (delAnchor) {
  let targetBezier;
  let delIndex;
  bezierArr.some(bezier => {
    if (delAnchor.bezierId === bezier.id) {
      targetBezier = bezier;
      return true;
    }
  });
  targetBezier.anchorArr.some((item, i) => {
    if (delAnchor.id === item.id) {
      delIndex = i;
      return true;
    }
  });
  targetBezier.anchorArr[0].set({
    selectable: true,
    evented: true
  });
  // 如果删除的是 第一个锚点
  if (delIndex === 0) {
    c.remove(delAnchor, targetBezier.singleBezierArr[0]);
    targetBezier.anchorArr.shift();
    targetBezier.singleBezierArr.shift();
    return;
  }
  // 如果删除的是最后一个锚点
  if (delIndex === targetBezier.anchorArr.length - 1) {
    c.remove(delAnchor, targetBezier.singleBezierArr[targetBezier.singleBezierArr.length - 1]);
    targetBezier.anchorArr.pop();
    targetBezier.singleBezierArr.pop();
    return;
  }
  let preAn = targetBezier.anchorArr[delIndex - 1];
  let nextAn = targetBezier.anchorArr[delIndex + 1];
  let preBezier = targetBezier.singleBezierArr[delIndex - 1];
  let nextBezier = targetBezier.singleBezierArr[delIndex];
  let newBezier = new fabric.Path(`M ${preAn.left} ${preAn.top} C ${preAn.nextConP.left}, ${preAn.nextConP.top}, ${nextAn.preConP.left}, ${nextAn.preConP.top}, ${nextAn.left}, ${nextAn.top}`, {
    fill: '',
    stroke: '#fff',
    hasBorders: false,
    hasControls: false,
    evented: false,
    selectable: false
  });
  c.remove(preBezier, nextBezier, delAnchor);
  c.add(newBezier);
  // 更新贝兹曲线数组 和 锚点数组
  targetBezier.singleBezierArr.splice(delIndex - 1, 2);
  targetBezier.singleBezierArr.splice(delIndex - 1, 0, newBezier);
  targetBezier.anchorArr.splice(delIndex, 1);
}
// TODO: 调整控制点和锚点的时候 不连续 会断开
// 这里把前后的两条贝兹曲线重画来解决。 感觉并不是最优解
// 可能是hasborder 的 影响 但是 hasborder已经设置为false了。

export { bezierArr };
