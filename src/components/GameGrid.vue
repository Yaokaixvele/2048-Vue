<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import type { Move } from '../types/game';
import { ANIMATION_TIME, BLOCK_BACKGROUND_COLOR, BLOCK_GRP, BLOCK_SPACING, BLOCK_WIDTH, CANVAS_BACKGROUND_COLOR, CANVAS_SIZE, GRID_SIZE } from '../constants/game';

// 模块 2：Props / Emits 定义（组件参数）
interface GameGridProps{
  grid: (number | null) [][],
  moves: Move[],
  isAnimating: boolean
}
const props = defineProps<GameGridProps>();
const emit = defineEmits(['animationEnd']);

// 模块 3：静态方块计算（非动画时显示）
const staticTiles = computed(() => {
  if(props.isAnimating) return []
  const tiles: { row: number, col: number, value: number}[] = []
  for(let r = 0; r < GRID_SIZE; r++){
    for(let c = 0; c < GRID_SIZE; c++){
      if(props.grid[r][c]) tiles.push({row: r, col: c, value: props.grid[r][c] as number})
    }
  }
  return tiles
})

// 模块 4：动画方块类型 & 响应式数据
interface AnimatedBlock {
  value: number,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  isNew?: boolean,
  isMerged?: boolean
}
const animatedBlocks = ref<AnimatedBlock[]>([])

// 模块 8：生命周期（监听窗口大小变化）
const windowWidth = ref(window.innerWidth)
const updateWidth = () => windowWidth.value = windowWidth.value
onMounted(() => document.addEventListener('resize',updateWidth))
onUnmounted(() => document.removeEventListener('resize',updateWidth))

// 模块 5：布局计算（响应式宽高、间距）
const layout = computed(() => {
  const isMoblie = windowWidth.value <= 768
  if(isMoblie){
    const maxCanvasWidth = Math.min(windowWidth.value * 0.9, 500)
    const blockWidth = Math.floor((maxCanvasWidth - 60) / GRID_SIZE)
    const totalBlocksWidth = GRID_SIZE * blockWidth + (GRID_SIZE - 1) * BLOCK_GRP
    const spacing = (maxCanvasWidth - totalBlocksWidth) / 2
    return { blockWidth, canvasSize: totalBlocksWidth, spacing}
  }
  return { blockWidth: BLOCK_WIDTH, canvasSize: CANVAS_SIZE, spacing: BLOCK_SPACING }
})
// 模块 6：核心动画监听（你之前问的那段）
watch(() => [props.isAnimating, props.moves], ([newIsAnimating]) => {
  if(newIsAnimating && props.moves.length > 0){
    const newBlocks: AnimatedBlock[] = []
    props.moves.forEach(([[fromRow, fromCol], [toRow, toCol]]) => {
      if(fromRow >= 0 && fromRow < 4 && fromCol >= 0 && fromCol < 4){
        const value = props.grid[toRow][toCol]
        if(!value){
          const isMerged = fromRow >= 0 && fromRow < 4 && fromCol >= 0 && fromCol < 4 &&
                          props.grid[fromRow][fromCol] !== value
          const isNew = fromRow === toRow && fromCol === toCol
          newBlocks.push({ value: value as number, fromRow, fromCol, toRow, toCol, isMerged, isNew})
        }
      }
    })
    animatedBlocks.value = newBlocks
    setTimeout(() => {
      animatedBlocks.value = []
      emit('animationEnd')
    }, ANIMATION_TIME)
  }else if(!newIsAnimating) {
    animatedBlocks.value = []
  }
}, {deep: true})
// 模块 7：工具函数（位置、颜色）
const getPos = (row: number, col: number) => ({
  top: `${row * (layout.value.blockWidth + BLOCK_GRP) + layout.value.spacing}px`,
  left: `${col * (layout.value.blockWidth + BLOCK_GRP) + layout.value.spacing}px`
});

const getBlockColor = (value: number) => {
  const colors: Record<number, string> = {
    2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563', 32: '#f67c5f',
    64: '#f65e3b', 128: '#edcf72', 256: '#edcc61', 512: '#edc850', 
    1024: '#edc53f', 2048: '#edc22e',
  };
  return colors[value] || '#cdc1b4';
};

</script>
<template>
  <div class="game-container" :style="{
    width: layout.canvasSize + 'px',
    height: layout.canvasSize + 'px',
    backgroundColor: CANVAS_BACKGROUND_COLOR
  }">
    <div v-for="r in 4" :key="'bg-row-'+r">
      <div v-for="c in 4" :key="'bg-col-'+c" 
           class="grid-block background-block" 
           :style="getPos(r-1, c-1)">
      </div>
    </div>

    <div v-for="(block, index) in animatedBlocks" :key="'anim-'+index"
         class="grid-block tile"
         :class="{ 'is-merged': block.isMerged, 'is-new': block.isNew }"
         :style="{
           ...getPos(block.toRow, block.toCol),
           '--from-top': getPos(block.fromRow, block.fromCol).top,
           '--from-left': getPos(block.fromRow, block.fromCol).left,
           backgroundColor: getBlockColor(block.value),
           color: block.value <= 4 ? '#776e65' : '#f9f6f2',
           width: layout.blockWidth + 'px',
           height: layout.blockWidth + 'px',
           fontSize: layout.blockWidth >= 80 ? (layout.blockWidth >= 100 ? '50px' : '40px') : '30px'
         }">
      {{ block.value }}
    </div>

    <div v-for="t in staticTiles" :key="'static-' + t.row + '-' + t.col"
         class="grid-block tile-static"
         :style="{
           ...getPos(t.row, t.col),
           backgroundColor: getBlockColor(t.value),
           color: t.value <= 4 ? '#776e65' : '#f9f6f2',
           width: layout.blockWidth + 'px',
           height: layout.blockWidth + 'px',
           fontSize: layout.blockWidth >= 80 ? (layout.blockWidth >= 100 ? '50px' : '40px') : '30px'
         }">
      {{ t.value }}
    </div>
  </div>
</template>
<style lang="scss" scoped>
.game-container {
  position: relative;
  margin: 0 auto;
  border-radius: 20px;
  max-width: 90vw;
  max-height: 90vw;
}
.grid-block {
  position: absolute;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  box-shadow: 5px 5px 3px gray;
  font-family: 'Oswald', sans-serif;
}
.background-block {
  background-color: v-bind(BLOCK_BACKGROUND_COLOR);
  z-index: 3;
  width: v-bind('layout.blockWidth + "px"');
  height: v-bind('layout.blockWidth + "px"');
}
.tile {
  z-index: 6;
  animation: move 0.12s ease-out;
}
.tile-static {
  z-index: 5;
}
.is-new { animation: pop 0.15s ease-out; }
.is-merged { animation: move 0.12s ease-out, scaleUp 0.15s 0.08s ease-in-out; }

@keyframes move {
  from { top: var(--from-top); left: var(--from-left); }
}
@keyframes pop {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}
@keyframes scaleUp {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}
</style>