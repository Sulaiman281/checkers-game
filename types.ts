
export type Player = 'red' | 'black';

export interface Piece {
  player: Player;
  isKing: boolean;
}

export type SquareState = Piece | null;

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  to: Position;
  jumped?: Position;
}
