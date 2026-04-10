import type { Direction, Grid } from "../types/game";

const DIRECTIONS: Direction[] = ['left', 'right', 'up', 'down'];
interface SimulationState {
  gird: Grid,
  score: number
}
interface SimulationResult extends SimulationState {
  moved: boolean
}