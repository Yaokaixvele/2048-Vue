import { ref } from "vue"
import { createEmptyGrid, deepCloneGrid, isGameOver, loadGameState, loadHighestScore, randomChoice, savedHighScore } from "../utils/game"
import type { AdvanceResult, Direction, GameState, Grid, Move, ShiftResult } from "../types/game"
import { GRID_SIZE } from "../constants/game"

export const useGame = () => {
  const savedState = loadGameState()
  const highestScore = loadHighestScore()
  const initialState: GameState = savedState ? {
    ...savedState,
    gameOver: isGameOver(savedState.grid),
    isAnimating: false,
    moves: [],
    highestScore,
  } : {
    grid: createEmptyGrid(),
    score: 0,
    steps: 0,
    gameOver: false,
    isAnimating: false,
    moves: [],
    highestScore: 0,
  }
  const state = ref<GameState>(initialState)
  let scoreAnimationClearTimer: ReturnType<typeof setTimeout> | null = null
  // 如果没有存档，初始化两个方块 // 2. 生成新方块
  const generateNewBlock = (grid: Grid): void => {
    const possiblePositions: [number, number][] = []
    grid.forEach((row, i) => {
      row.forEach((item, j) => {
        if(item === null)possiblePositions.push([i, j])
      })
    })
    if(possiblePositions.length > 0){
      const position = randomChoice(possiblePositions)
      grid[position[0]][position[1]] = 2
    }
  }
  if(!savedState){
    generateNewBlock(state.value.grid)
    generateNewBlock(state.value.grid)
  }
  function shiftBlock(rowArr: (number | null)[], isReverse: boolean): ShiftResult {
    let head = 0
    let tail = 1
    let incr = 1
    let points = 0
    if(isReverse){
      head = rowArr.length - 1
      tail = head - 1
      incr = -1
    }
    const moves: [number,number][] = []
    while(tail > 0 && tail < rowArr.length){
      if(rowArr[tail] === null){
        tail += incr
      }else{
        if(rowArr[head] === null){
          rowArr[head] = rowArr[tail]
          rowArr[tail] = null
          moves.push([tail, head])
          tail += incr
        }else if(rowArr[head] === rowArr[tail]){
          rowArr[head] = (rowArr[head] as number) * 2
          rowArr[tail] = null
          points += rowArr[head] as number
          moves.push([tail, head])
          head += incr
          tail += incr
        }else{
          head += incr
          if(head === tail)tail += incr
        }
      }
    }
    return { rowArr, moves, points }
  }
  const advance = (command: Direction): AdvanceResult =>{
    if(state.value.isAnimating || state.value.gameOver) return { moves: [], points: state.value.score, steps: state.value.steps} 
    const gird = deepCloneGrid(state.value.grid)
    const moves: Move[] = []
    let points = 0
    const isReverse = command === 'right' || command === 'down'
    if(command === 'left' || command === 'right'){
      for(let i = 0; i < GRID_SIZE; i++){
        const rowMove = shiftBlock(gird[i], isReverse)
        for(const move of rowMove.moves) moves.push([[i, move[0]],[i, move[1]]])
        points += rowMove.points
      }
    }else{
      for(let i = 0; i < GRID_SIZE; i++){
        const tmp: (number | null)[] = []
        for(let j = 0; j < GRID_SIZE; j++) tmp.push(gird[j][i])
        const colMove = shiftBlock(tmp, isReverse)
        for(const move of colMove.moves) moves.push([[move[0],i],[move[1],i]])
        points += colMove.points
        for(let j = 0; j < GRID_SIZE; j++) gird[j][i] = tmp[j]
      }
    }
    if(moves.length){
      state.value.steps ++
      generateNewBlock(gird)
    }
    state.value.grid = gird
    state.value.score += points
    state.value.gameOver = isGameOver(state.value.grid)
    state.value.isAnimating = moves.length > 0;
    state.value.moves = moves;
    if (state.value.score > state.value.highestScore) {
      state.value.highestScore = state.value.score;
      savedHighScore(state.value.highestScore);
    }
  }
}