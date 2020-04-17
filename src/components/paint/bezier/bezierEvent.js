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
let isEsc = false;
let isAlt = false;
let isMoving = false;
let isAnMove = false;
let controlL; // 同一个锚点的两个控制点连成的线
let visiableArr = []; // 鼠标移入时显示的对象数组
let visiableAnchor = []; // 鼠标移入时变色的锚点数组
let noEventAn = [];

export function bezierMouseDown (options, color, canvas) {
  if (isMoving || isAlt || isAnMove) return;
  // console.log(options);
  isEsc = false;
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
  // 如果是退出状态 锚点移动 控制点移动状态 则退出
  if (isEsc || isMoving || isAnMove || isAlt) return;
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
  if (temBezier) singleBezierArr.push(temBezier);
  if (!isMouseMove && temPath) {
    canvas.add(temPath);
    canvas.remove(temBezier);
  }
}
export function bezierMouseOver (target) {
  // if (target) console.log(target.name);
  if (!isAlt && target && target.name === 'anchor') {
    target.set({
      selectable: false,
      evented: false
    });
    noEventAn.push(target);
  }
  if (isAlt) {
    if (target && target.name === 'anchor') {
      isAnMove = true;
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
      })
      modBezier.anchorArr.some((anchor, i) => {
        if (anchor.id === target.id) {
          modIndex = i;
          return true;
        }
      })
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
export function bezierMouseOut (target) {
}
// 物件移动处理函数
let isFirst = 1;
let clonePre = {};
let cloneNext = {};
let selectedAnId = '';
export function moveControlPoint (e) {
  let target = e.target;
  if (target.name === 'prePoint' || target.name === 'nextPoint') {
    isMoving = true;
    controlPointHandle(e);
  }
  if (target.name === 'anchor') {
    if (!isAnMove) return;
    isAnMove = true;
    if (selectedAnId !== target.id) {
      cloneNext = {};
      clonePre = {};
      selectedAnId = target.id;
      isFirst = 1;
    }
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
      })
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
}
// ESC处理函数
function escHandler () {
  if (anchorArr.length < 2) return;
  isAnMove = false;
  isEsc = true;
  isAlt = false;
  c.remove(temAnchor, temPath);
  temPath = undefined;
  temBezier = undefined;
  // 整条贝兹曲线的id
  bezierObj.id = bezierArr.length + 1;
  // 为每个锚点绑定所在整条贝兹曲线的id
  anchorArr.forEach(obj => {
    obj.bezierId = bezierObj.id;
  });
  // 将锚点数组存放到整条贝兹曲线对象上
  bezierObj.anchorArr = anchorArr;
  // 将单个贝兹曲线的数组放入整条贝兹曲线的对象上
  bezierObj.singleBezierArr = singleBezierArr; 
  bezierArr.push(bezierObj);
  singleBezierArr = [];
  bezierObj = {};
  anchorArr = [];
}
// 调整控制点时 的处理函数
function controlPointHandle (e) {
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
  // TODO: 另一个控制点的位置更新并不及时 虽然显示的位置变了
  // 但是还是要在原来的位置才可以选中 （renderAll并没有效果）
  // 可以使用之前画直线的方式 拷贝一份重画 但是感觉并不是最优解
  // 这里直接在调整完后让它消失 但是这样 用户体验并不好
  isAlt = false;
  isAltArrVisiable();
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
      preBezier.set({
        path: [[
          'M',
          preAn.left,
          preAn.top
        ], [
          'C',
          preAn.nextConP.left,
          preAn.nextConP.top,
          target.left,
          target.top,
          anchor.left,
          anchor.top
        ]]
      });
    }
    if (target.name === 'nextPoint') return;
    return;
  }
  if (target.name === 'prePoint') {
    preBezier.set({
      path: [[
        'M',
        preAn.left,
        preAn.top
      ], [
        'C',
        preAn.nextConP.left,
        preAn.nextConP.top,
        target.left,
        target.top,
        anchor.left,
        anchor.top
      ]]
    });
    nextBezier.set({
      path: [[
        'M',
        anchor.left,
        anchor.top
      ], [
        'C',
        anotherCP.left,
        anotherCP.top,
        nextAn.preConP.left,
        nextAn.preConP.top,
        nextAn.left,
        nextAn.top
      ]]
    });
  } else if (target.name === 'nextPoint') {
    preBezier.set({
      path: [[
        'M',
        preAn.left,
        preAn.top
      ], [
        'C',
        preAn.nextConP.left,
        preAn.nextConP.top,
        anotherCP.left,
        anotherCP.top,
        anchor.left,
        anchor.top
      ]]
    });
    nextBezier.set({
      path: [[
        'M',
        anchor.left,
        anchor.top
      ], [
        'C',
        target.left,
        target.top,
        nextAn.preConP.left,
        nextAn.preConP.top,
        nextAn.left,
        nextAn.top
      ]]
    });
  }
}

// 调整锚点时 的处理函数
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
  // console.log(target.nextConP.left, target.nextConP.top);
  // console.log(originPreW, originPreH, originNextW, originNextH);
  // console.log(target.left, target.top);
  target.preConP.set({
    left: target.left + originPreW,
    top: target.top + originPreH
  });
  target.nextConP.set({
    left: target.left + originNextW,
    top: target.top + originNextH
  });
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
    nextBezier.set({
      path: [[
        'M',
        target.left,
        target.top
      ], [
        'C',
        target.nextConP.left,
        target.nextConP.top,
        nextAn.preConP.left,
        nextAn.preConP.top,
        nextAn.left,
        nextAn.top
      ]]
    });
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
    preBezier.set({
      path: [[
        'M',
        preAn.left,
        preAn.top
      ], [
        'C',
        preAn.nextConP.left,
        preAn.nextConP.top,
        target.preConP.left,
        target.preConP.top,
        target.left,
        target.top
      ]]
    });
    return;
  }
  preBezier.set({
    path: [[
      'M',
      preAn.left,
      preAn.top
    ], [
      'C',
      preAn.nextConP.left,
      preAn.nextConP.top,
      target.preConP.left,
      target.preConP.top,
      target.left,
      target.top
    ]]
  });
  nextBezier.set({
    path: [[
      'M',
      target.left,
      target.top
    ], [
      'C',
      target.nextConP.left,
      target.nextConP.top,
      nextAn.preConP.left,
      nextAn.preConP.top,
      nextAn.left,
      nextAn.top
    ]]
  });
  // TODO: 和调整控制点时的情况一样
  isAlt = false;
  isAltArrVisiable();
}
