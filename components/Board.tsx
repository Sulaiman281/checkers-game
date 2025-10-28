
import React from 'react';
import type { SquareState, Position, Move } from '../types';
import { Square } from './Square';

interface BoardProps {
  board: SquareState[][];
  onSquareClick: (position: Position) => void;
  validMoves: Move[];
  selectedPiece: Position | null;
}

export const Board: React.FC<BoardProps> = ({ board, onSquareClick, validMoves }) => {
  const isPossibleMove = (row: number, col: number) => {
    return validMoves.some(move => move.to.row === row && move.to.col === col);
  };

  return (
    <div className="w-full max-w-lg aspect-square grid grid-cols-8 grid-rows-8 border-4 border-amber-900 rounded-lg shadow-2xl overflow-hidden">
      {board.map((row, rowIndex) =>
        row.map((square, colIndex) => (
          <Square
            key={`${rowIndex}-${colIndex}`}
            squareState={square}
            isLight={(rowIndex + colIndex) % 2 === 0}
            isPossibleMove={isPossibleMove(rowIndex, colIndex)}
            onClick={() => onSquareClick({ row: rowIndex, col: colIndex })}
          />
        ))
      )}
    </div>
  );
};
