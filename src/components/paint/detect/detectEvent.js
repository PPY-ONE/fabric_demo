// 1、计算出所有的贝兹曲线的 x 轴坐标
//     1.1 记录 索引i 、对应的贝兹曲线的id 组织成对象 { x: xxx, t: xxx, id: singleId }
//         注：每一条贝兹曲线有一个 singleId 类似于"bezier0single0"、"bezier1single0"、"bezier2single0"
//             使用数组的split方法取得 对应的 整条曲线对象在它的singleBezierArr数组中找到对应的单个曲线
//     1.2 放入数组bezierXArr
// 2、判断当前鼠标的 x 轴坐标 在误差范围内是否可以在bezierXArr数组中找到（使用some）以找到的第一个点为准
// 3、如果找到了对应的x轴坐标， 就能得到对应的一条或者多条贝兹曲线
//    3.1 遍历objArr中对应的整条曲线对象上的singleBezierArr数组，能够得到得到贝兹曲线的索引
//    3.2 由单独贝兹曲线的索引值，可以得到整条贝兹曲线对象的anchorArr中对应的开始锚点和结束锚点，他们的索引值分别就是该单条贝兹曲线的索引值以及加一
//    3.3 每个锚点上存有控制点的信息，所以可以得到每个对应的单条贝兹曲线的方程
// 4、将 t 带入对用的贝兹曲线方程 计算出 y轴的坐标
// 5、对比鼠标当前的 y轴坐标，查看在误差范围内是否符合 在步骤4 中计算出的 y轴坐标
//    5.1 如果找到符合的，则鼠标靠近该贝兹曲线
//    5.1.1 如果找到多条，则默认第一条，之后根据新的鼠标坐标可以判断出具体在哪一条
//    5.2 如果没有找到则鼠标不靠近任何曲线 

// 这样计算 不如直接把x， y坐标都算出来在比较。
// 实际写下来 好像不行

// import { fabric } from 'fabric';
import { makeDetectCircle } from './detectObj';
let objArr = []; //存放贝兹曲线的数组
let num = 100; // 每条贝兹曲线上的点的个数
let pointArr = []; // 存放贝兹曲线上的点的数组
let range = 10;
let detectC;
export function getBezierData (bezierArr) {
  objArr = bezierArr;
  // 获取贝兹曲线的数据 并取得坐标信息存进数组
  objArr.forEach(obj => {
    obj.singleBezierArr.forEach(bezier => {
      let p1 = [], cp1 = [], cp2 = [], p2 = [];
      p1 = [bezier.path[0][1], bezier.path[0][2]];
      cp1 = [bezier.path[1][1], bezier.path[1][2]];
      cp2 = [bezier.path[1][3], bezier.path[1][4]];
      p2 = [bezier.path[1][5], bezier.path[1][6]];
      for (let i = 0; i < num; i++) {
        let pointObj = {
          posArr: getBezierPoints(i / num, p1, cp1, cp2, p2),
          t: (i / num),
          singleId: bezier.singleId
        };
        pointArr.push(pointObj);
      }
    })
  }); 
}
// 计算贝兹曲线上的点的方法
function getBezierPoints (t, p1, cp1, cp2, p2) {
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  const [cx1, cy1] = cp1;
  const [cx2, cy2] = cp2;
  let x = x1 * Math.pow((1 - t), 3) +
  3 * cx1 * t * Math.pow((1 - t), 2) +
  3 * cx2 * Math.pow(t, 2) * (1 - t) +
  x2 * Math.pow(t, 3);
  let y = y1 * Math.pow((1 - t), 3) +
  3 * cy1 * t * Math.pow((1 - t), 2) +
  3 * cy2 * Math.pow(t, 2) * (1 - t) +
  y2 * Math.pow(t, 3);
  return [x, y];
}

export function detectMouseMove (options, canvas) {
  canvas.remove(detectC);
  let currentP = {
    x: options.e.offsetX,
    y: options.e.offsetY
  };
  // TODO: 或者可以以鼠标为圆心画圆, 用圆与点做碰撞检测
  pointArr.some(pointObj => {
    if (
      currentP.x + range >= pointObj.posArr[0]
      &&
      currentP.x - range <= pointObj.posArr[0]
      &&
      currentP.y + range >= pointObj.posArr[1]
      &&
      currentP.y - range <= pointObj.posArr[1]
    ) {
      detectC = makeDetectCircle(pointObj.posArr[0], pointObj.posArr[1]);
      canvas.add(detectC);
      return true;
    }
  });
}

export function detectMouseOver (options) {
}
