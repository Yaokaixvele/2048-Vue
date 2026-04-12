<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useGame } from '../composables/useGame';
import type { Direction } from '../types/game';
import GameGrid from './GameGrid.vue';

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
const handleRestart = () => initializeGame();
</script>
<template>
  <div class="game-container">
    <header class="game-header">
      <h2>Vue 3 2048 Game</h2>
    </header>

    <div class="game-menu">
      <div class="menu-grid">
        <div class="stat-box">
          <span class="label">分数</span>
          <div class="score-wrapper">
            <strong>{{ gameState.score }}</strong>
            <Transition name="score-pop">
              <span 
                v-if="gameState.scoreAnimation" 
                :key="gameState.scoreAnimation.key" 
                class="score-plus"
              >
                +{{ gameState.scoreAnimation.points }}
              </span>
            </Transition>
          </div>
        </div>
        
        <div class="stat-box">
          <span class="label">最高分</span>
          <strong>{{ gameState.highestScore }}</strong>
        </div>
        
        <div class="stat-box">
          <span class="label">步数</span>
          <strong>{{ gameState.steps }}</strong>
        </div>

        <div class="btn action-btn" @click="handleRestart">
          <strong>再来一局</strong>
        </div>

        <!-- <div class="btn ai-btn" :class="{ 'ai-running': isAIRunning }" @click="handleAIClick">
          <strong>{{ isAIRunning ? '停止 AI' : 'AI 走 10 步' }}</strong>
          <small v-if="lastDecision" class="ai-hint">
            {{ lastDecision.move }} (≈{{ lastDecision.projectedScore }})
          </small>
        </div> -->
      </div>
    </div>

    <div ref="swiperAreaRef" class="grid-container">
      <GameGrid
        :grid="gameState.grid"
        :moves="gameState.moves"
        :isAnimating="gameState.isAnimating"
        @animation-end="setAnimating(false)"
      />
    </div>

    <footer class="game-info">
      <p><strong>游戏方法：</strong>使用上下左右箭头或滑动屏幕进行移动</p>
      <p>当相同的两个数字碰撞时，它们会合并成一个！</p>
    </footer>

    <Transition name="fade">
      <div v-if="gameState.gameOver" class="game-over-overlay">
        <div class="over-content">
          <h2>游戏结束！</h2>
          <p>最终得分: <span>{{ gameState.score }}</span></p>
          <button class="restart-button" @click="handleRestart">重新开始</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.game-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 20px;
  font-family: 'Oswald', sans-serif;
  color: #776e65;
}

.game-header h2 {
  text-align: center;
  margin: 20px 0;
}

/* 布局美化 */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
}

.stat-box, .btn {
  background: #a78d74;
  color: white;
  padding: 8px;
  border-radius: 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 5px 5px 3px gray;
  min-height: 60px;
}

.label { font-size: 14px; opacity: 0.9; }

.btn { 
  cursor: pointer; 
  transition: all 0.2s; 
}
.btn:hover { background: #bba188; transform: translateY(-2px); }
.ai-running { background: #8f7a66; }

.score-wrapper { position: relative; display: inline-block; }

.score-plus {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: -25px;
  color: #f65e3b;
  font-weight: bold;
  font-size: 24px;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.4);
  white-space: nowrap;
}

/* 核心动画：分数冒出 */
.score-pop-enter-active { animation: pop-up 1s ease-out; }
@keyframes pop-up {
  0% { opacity: 0; transform: translate(-50%, 0) scale(1); }
  30% { opacity: 1; transform: translate(-50%, -30px) scale(1.1); }
  100% { opacity: 0; transform: translate(-50%, -50px) scale(0.8); }
}

/* 游戏结束蒙层 */
.game-over-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.85);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.over-content { text-align: center; }

.restart-button {
  margin-top: 20px;
  padding: 10px 30px;
  background: #8f7a66;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.2rem;
  font-family: inherit;
}

/* 过渡效果 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>