<template>
  <v-content>
    <div class="canvasContainer">
      <canvas id="c"></canvas>
    </div>
  </v-content>
</template>

<script>
import { fabric } from 'fabric'
import {
  mouseDown,
  mouseMove,
  mouseUp,
  getColor,
  ObjMoving,
  mouseOver,
  mouseOut,
  handleObjSelect
} from './mouseEvent'
// import { makeLine, makeCircle } from './line'

export default {
  data () {
    return {
      canvas: null,
      objArr: []
    }
  },
  props: {
    barClickType: String,
    selectedColor: String
  },
  mounted () {
    this.initFabric()
  },
  methods: {
    // 初始化fabric
    initFabric () {
      this.setCanvasSize()
      window.onresize = () => {
        this.canvas.forEachObject(obj => {
          this.objArr.push(obj);
        })
        this.setCanvasSize()
        // TODO: resize重复画图
        this.objArr.forEach(obj => {
          this.canvas.add(obj);
        })
        this.canvas.renderAll();
      }
      let that = this
      fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center'
      this.canvas.on({
        'mouse:down': options => mouseDown(options, that.barClickType, that.canvas),
        'mouse:move': options => mouseMove(options, that.barClickType, that.canvas),
        'mouse:up': options => mouseUp(options, that.barClickType, that.canvas),
        'object:moving': e => ObjMoving(e, that.barClickType),
        'mouse:over': e => mouseOver(e, that.barClickType),
        'mouse:out': e => mouseOut(e, that.barClickType),
        'selection:created': e => handleObjSelect(e, that.barClickType),
        'selection:updated': e => handleObjSelect(e, that.barClickType)
      })
    },
    // 设置canvas元素的大小
    setCanvasSize () {
      var Ccanvas = document.getElementById('c')
      var container = document.querySelector('.canvasContainer')
      let w = container.clientWidth - 20
      let h = container.clientHeight - 20
      Ccanvas.setAttribute('width', w)
      Ccanvas.setAttribute('height', h)

      var canvas = new fabric.Canvas('c', {
        width: w,
        height: h,
        selection: false,
        backgroundColor: '#555'
      })
      this.canvas = canvas
    }
  },
  watch: {
    selectedColor: function (newVal) {
      // console.log(newVal)
      getColor(newVal)
    }
  }
}
</script>

<style lang="less" scoped>
.canvasContainer{
  width: 100%;
  height: 100%;
  padding: 10px;
  #c{
    box-shadow: 0 0 10px #ccc;
  }
}
</style>
