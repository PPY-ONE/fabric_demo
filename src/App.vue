<template>
  <v-app>
   <bar @sendClickType = "getClickType" @sendColor = "getColor"></bar>
   <paint :barClickType = "clickType" :selectedColor = "color"></paint>
  </v-app>
</template>

<script>
import bar from './components/bar'
import paint from './components/paint/paint'

export default {
  name: 'App',
  methods: {
    getClickType (type) {
      this.clickType = type
      // console.log(this.clickType)
    },
    getColor (color, clickType) {
      this.color = color
      this.clickType = clickType
      // console.log(clickType)
    }
  },
  components: {
    bar,
    paint
  },

  data: () => ({
    clickType: '',
    color: ''
  })
}
</script>
