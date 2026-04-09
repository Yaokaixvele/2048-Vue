import type { GameState, Grid, GridValue } from "../types/game"

// 产生a~b的随机整数 // 数组中随机位置 // 创建空网格
// 检查游戏是否结束 // 检查是否有空格 // 检查是否有可以合并的相邻格子 // 检查右侧 // 检查下方
// 深拷贝网格 // 保存游戏状态到本地存储 // 从本地存储加载游戏状态 
// Basic validation to ensure the loaded state is somewhat correct
// 保存最高分到本地存储 从本地提取最高分

// 产生a~b的随机整数 // 数组中随机位置 // 创建空网格
export const randomInt = (a: number, b:number): number => {
  return a + Math.floor(Math.random() * (b + 1 - a))
}
// 数组中随机位置
export const randomChoice = <T>(arr: T[]): T =>{
  return arr[randomInt(0, arr.length - 1)]
}
// 创建空网格
export const createEmptyGrid = (): Grid =>{
  const grid: Grid = []
  for(let i = 0; i < 4; i++){
    const row: GridValue[] = []
    for(let j = 0; j < 4; j++){
      row.push(null)
    }
    grid.push(row)
  }
  return grid
}
// 检查游戏是否结束 // 检查是否有空格 // 检查是否有可以合并的相邻格子 // 检查右侧 // 检查下方
export const isGameOver = (grid: Grid): boolean => {
  const hasEmpty = grid.some(row => row.includes(null))
  if(hasEmpty) return false
  const hasMerged = grid.some((row, i) => {
    return row.some((item, j) => {
      if(j < 3 && item === grid[i][j+1]) return true
      if(i < 3 && item === grid[i+1][j]) return true
      return false 
    })
  })
  if(hasMerged) return false
  return true
}
// 深拷贝网格 // 保存游戏状态到本地存储 // 从本地存储加载游戏状态 
// Basic validation to ensure the loaded state is somewhat correct
// 保存最高分到本地存储
export const deepCloneGrid = (grid: Grid): Grid => {
  return JSON.parse(JSON.stringify(grid))
}
export const saveGameState = (state: GameState): void => {
  localStorage.setItem('gameState', JSON.stringify(state))
}
// 从本地存储获取游戏状态 
export const loadGameState = (): GameState | null =>{
  const savedState = localStorage.getItem('gameState')
  if(savedState){
    try {
      const prasedState = JSON.parse(savedState)
      if(prasedState && prasedState.grid && prasedState.score !== undefined) return prasedState
    } catch (e) {
      console.error('Can not prase localStorge gameState 无法解析本地存储的游戏状态', e)
    }
  }
  return null
}
export const savedHighScore = (score: number): void => {
  localStorage.setItem('highestScore', score.toString())
}
export const loadHighestScore = (): number => {
  const savedScore = localStorage.getItem('highestScore')
  return savedScore ? parseInt(savedScore, 10) : 0
}
