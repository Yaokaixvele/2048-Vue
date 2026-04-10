<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useGame } from '../composables/useGame';
import type { Direction } from '../types/game';

const { state: gameState, advance, initializeGame, setAnimating } = useGame()
const swiperAreaRef = ref<HTMLElement | null>(null)
// 键盘事件
const handleKeyDown = (event: KeyboardEvent) =>{
  if(gameState.value.isAnimating || gameState.value.gameOver) return
  const keyMap: Record<string, Direction> = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', s: 'down', a: 'left', d: 'right'
  }
  const dir = keyMap[event.key]
  if(dir){
    event.preventDefault()
    advance(dir)
  }
}
const handleTouchMove = (event: TouchEvent) => {
  event.preventDefault()
}
const handleTouchStart = (event: TouchEvent) => {
  // 滑动过短的话视为误触
  if(gameState.value.isAnimating || gameState.value.gameOver) return
  const startX = event.touches[0].clientX
  const startY = event.touches[0].clientY
  const handleTouchEnd = (e: TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - startX;
    const deltaY = e.changedTouches[0].clientY - startY;

    // 滑动阈值判断（防止误触）
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) return;

    let dir: Direction | null = null;
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      dir = deltaY < 0 ? 'up' : 'down';
    } else {
      dir = deltaX < 0 ? 'left' : 'right';
    }

    if (dir) advance(dir);
    window.removeEventListener('touchend', handleTouchEnd)
    window.removeEventListener('touchmove', handleTouchMove)    
  }
  window.addEventListener('touchend', handleTouchEnd)
  window.addEventListener('touchmove', handleTouchMove)
}
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  if(swiperAreaRef.value){
    swiperAreaRef.value.addEventListener('touchstart', handleTouchStart, {passive: false})
  }
})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  if(swiperAreaRef.value){
    swiperAreaRef.value.removeEventListener('touchstart', handleTouchStart)
  }
})
</script>
<template>


</template>
<style lang="scss" scoped>

</style>