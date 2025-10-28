
import React from 'react';
import type { SquareState } from '../types';
import { Piece } from './Piece';

interface SquareProps {
  squareState: SquareState;
  isLight: boolean;
  isPossibleMove: boolean;
  onClick: () => void;
}

export const Square: React.FC<SquareProps> = ({ squareState, isLight, isPossibleMove, onClick }) => {
  const bgColor = isLight ? 'bg-amber-200' : 'bg-amber-800';
  
  return (
    <div
      className={`w-full h-full flex items-center justify-center ${bgColor} relative`}
      onClick={onClick}
    >
      {squareState && <Piece player={squareState.player} isKing={squareState.isKing} />}
      {isPossibleMove && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500/50 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
};
