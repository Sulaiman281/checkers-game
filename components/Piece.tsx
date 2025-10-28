
import React from 'react';
import type { Player } from '../types';

interface PieceProps {
  player: Player;
  isKing: boolean;
}

const KingIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 2a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L10 13.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.192L2.869 8.124a.75.75 0 01.416-1.28l4.21-.612L9.327 2.42A.75.75 0 0110 2z" />
    </svg>
);


export const Piece: React.FC<PieceProps> = ({ player, isKing }) => {
  const pieceColor = player === 'red' ? 'bg-red-600 border-red-800' : 'bg-gray-800 border-gray-900';
  const shadowColor = player === 'red' ? 'shadow-red-900/50' : 'shadow-black/50';

  return (
    <div className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center cursor-pointer transform hover:scale-110 transition-transform duration-200 ${pieceColor} border-4 shadow-lg ${shadowColor}`}>
      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${player === 'red' ? 'bg-red-500' : 'bg-gray-700'}`}></div>
      {isKing && (
        <div className="absolute inset-0 flex items-center justify-center">
            <KingIcon />
        </div>
      )}
    </div>
  );
};
