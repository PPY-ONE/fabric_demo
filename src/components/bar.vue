<template>
  <v-app-bar app>
    <div class="btnContainer">
      <v-btn class="barBtn" @click="barBtnClick('line')" color="#333">line</v-btn>
      <v-btn class="barBtn" @click="barBtnClick('bezier')" color="#999">bezier</v-btn>
      <v-btn class="barBtn" @click="barBtnClick('select')" color="#666">select</v-btn>
      <v-btn class="barBtn" @click="barBtnClick('delete')" color="#f00">delete</v-btn>
      <!-- 颜色选择按钮 -->
      <v-menu offset-y open-on-hover>
      <template v-slot:activator="{ on }">
        <v-btn
          color="primary"
          dark
          v-on="on"
        >
          COLOR
        </v-btn>
      </template>
      <v-list>
        <v-list-item
          v-for="(item, index) in items"
          :key="index"
          @click="selectColor(item)"
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    </div>
  </v-app-bar>
</template>

<script>
export default {
  data () {
    return {
      items: [
        { title: 'white' },
        { title: 'red' },
        { title: 'blue' },
        { title: 'yellow' },
      ]
    }
  },
  methods: {
    barBtnClick (type) {
      // console.log(type)
      this.$emit('sendClickType', type)
    },
    selectColor (item) {
      let color = item.title
      let clickType = 'changeColor'
      this.$emit('sendColor', color, clickType)
    }
  }
}
</script>

<style lang="less" scoped>
.btnContainer{
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.barBtn{
  color: white !important;
}
.colorBtn{
  display: block;
}
</style>