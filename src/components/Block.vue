<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

import { BLOCK_FONT_SIZE, BLOCK_GRP, BLOCK_WIDTH, GRID_SIZE, NUMBER_COLORS, TEXT_COLORS } from '../constants/game'
import type { BlockProps } from '../types/game';

// 获取浏览器宽度  注意：ref是在windowWith变后视图变，而非让windowWith和window.innerWIdth一样，所以需要设立方法然后绑定事件
const windowWith = ref(window.innerWidth)
const updateWith = () =>{
  windowWith.value = window.innerWidth
}
onMounted(() => {
  document.addEventListener('resize',updateWith)
})
onUnmounted(() => {
  document.removeEventListener('resize',updateWith)
})

// 获取props值
const props = withDefaults(defineProps<BlockProps>(),{
  value: null,
  isNew: false,
  isMerged: false
})

const responsiveSize = computed(() => {
  const isMoblie = windowWith.value < 768
  if(isMoblie){
    const maxCanvasWidth = Math.min(windowWith.value * 0.9, 500)
    const width = Math.floor((maxCanvasWidth - 60) / GRID_SIZE)
    const fontSize = width > 100 ? 50 : width >= 80 ? 40 : 30
    return {
      width,
      fontSize
    }
  }
  return{
    width: BLOCK_WIDTH,
    fontSize: BLOCK_FONT_SIZE,
  }
})
const blockStyle = computed(() => {
  if(!props.value) return {}
  const { width, fontSize } = responsiveSize.value
  const top = props.row * ( width + BLOCK_GRP ) + 10
  const left = props.col * ( width + BLOCK_GRP ) + 10
  return {
    position: 'absolute' as const,
    width: `${width}`,
    height: `${width}`,
    top: `${top}`,
    left: `${left}`,
    fontSize: `${fontSize}px`,
    backgroundColor: NUMBER_COLORS[props.value] || '#cdc1b4',
    color: TEXT_COLORS[props.value] || '#776e65',
    borderRadius: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    zIndex: 10,
    boxShadow: '5px 5px 3px gray',
    fontFamily: "'oswald', sans-serif",
    transform: props.isNew ? 'scale(0.8)' : props.isMerged ? 'scale(1.1)' : 'scale(1)',
    transition: (props.isMerged || props.isNew) ? 'all 0.12 ease' : 'transform 0.1s ease, left 0.1s ease, top 0.1s ease'

  }
})
</script>

<template>
  <div v-if="props.value !== null" :style="blockStyle">
    {{ props.value }}
  </div>
</template>
<style lang="scss" scoped>

</style>