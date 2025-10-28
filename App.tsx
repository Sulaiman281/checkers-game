
import React, { useState, useEffect, useCallback } from 'react';
import type { Player, SquareState, Position, Move, Piece } from './types';
import { Board } from './components/Board';

const createInitialBoard = (): SquareState[][] => {
  const board: SquareState[][] = Array(8).fill(null).map(() => Array(8).fill(null));

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 !== 0) {
        board[row][col] = { player: 'red', isKing: false };
      }
    }
  }

  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 !== 0) {
        board[row][col] = { player: 'black', isKing: false };
      }
    }
  }

  return board;
};

const App: React.FC = () => {
  const [board, setBoard] = useState<SquareState[][]>(createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>('black');
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [redPieces, setRedPieces] = useState(12);
  const [blackPieces, setBlackPieces] = useState(12);

  const resetGame = () => {
    setBoard(createInitialBoard());
    setCurrentPlayer('black');
    setSelectedPiece(null);
    setValidMoves([]);
    setWinner(null);
    setRedPieces(12);
    setBlackPieces(12);
  };

  const calculateAllMovesForPlayer = useCallback((player: Player, currentBoard: SquareState[][]): Move[] => {
    const allMoves: Move[] = [];
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = currentBoard[row][col];
            if (piece && piece.player === player) {
                const moves = calculateValidMovesForPiece({row, col}, piece, currentBoard);
                allMoves.push(...moves);
            }
        }
    }
    return allMoves;
  }, []);

  const checkForWinner = useCallback((currentBoard: SquareState[][], nextPlayer: Player) => {
    const opponent = nextPlayer === 'red' ? 'black' : 'red';
    if ((nextPlayer === 'red' && redPieces === 0) || (nextPlayer === 'black' && blackPieces === 0)) {
        setWinner(opponent);
        return;
    }

    const opponentMoves = calculateAllMovesForPlayer(nextPlayer, currentBoard);
    if (opponentMoves.length === 0) {
        setWinner(opponent);
    }
  }, [redPieces, blackPieces, calculateAllMovesForPlayer]);


  const calculateValidMovesForPiece = (position: Position, piece: Piece, currentBoard: SquareState[][]): Move[] => {
    const { row, col } = position;
    const { player, isKing } = piece;
    const moves: Move[] = [];
    const jumps: Move[] = [];

    const directions = isKing 
        ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] 
        : (player === 'red' ? [[1, -1], [1, 1]] : [[-1, -1], [-1, 1]]);

    for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;

        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            // Simple move
            if (currentBoard[newRow][newCol] === null) {
                moves.push({ to: { row: newRow, col: newCol } });
            } 
            // Jump move
            else if (currentBoard[newRow][newCol]?.player !== player) {
                const jumpRow = newRow + dr;
                const jumpCol = newCol + dc;
                if (jumpRow >= 0 && jumpRow < 8 && jumpCol >= 0 && jumpCol < 8 && currentBoard[jumpRow][jumpCol] === null) {
                    jumps.push({ to: { row: jumpRow, col: jumpCol }, jumped: { row: newRow, col: newCol } });
                }
            }
        }
    }

    return jumps.length > 0 ? jumps : moves;
  };

  const movePiece = (move: Move) => {
    if (!selectedPiece) return;

    const newBoard = board.map(r => [...r]);
    const pieceToMove = newBoard[selectedPiece.row][selectedPiece.col];

    if (!pieceToMove) return;

    // Move piece
    newBoard[move.to.row][move.to.col] = pieceToMove;
    newBoard[selectedPiece.row][selectedPiece.col] = null;

    // Handle jump
    if (move.jumped) {
      newBoard[move.jumped.row][move.jumped.col] = null;
      if (currentPlayer === 'black') {
          setRedPieces(r => r-1);
      } else {
          setBlackPieces(b => b-1);
      }
    }

    // King piece
    if ((move.to.row === 7 && pieceToMove.player === 'red') || (move.to.row === 0 && pieceToMove.player === 'black')) {
        pieceToMove.isKing = true;
    }
    
    // Check for multi-jump
    if (move.jumped) {
        const furtherJumps = calculateValidMovesForPiece(move.to, pieceToMove, newBoard)
            .filter(m => m.jumped);

        if (furtherJumps.length > 0) {
            setBoard(newBoard);
            setSelectedPiece(move.to);
            setValidMoves(furtherJumps);
            return;
        }
    }

    const nextPlayer = currentPlayer === 'red' ? 'black' : 'red';
    setCurrentPlayer(nextPlayer);
    setSelectedPiece(null);
    setValidMoves([]);
    setBoard(newBoard);
    checkForWinner(newBoard, nextPlayer);
  };
  
  const handleSquareClick = (position: Position) => {
    if (winner) return;

    const { row, col } = position;
    const clickedPiece = board[row][col];
    
    // If a piece is selected, try to move
    if (selectedPiece) {
        const move = validMoves.find(m => m.to.row === row && m.to.col === col);
        if (move) {
            movePiece(move);
        } else if (clickedPiece && clickedPiece.player === currentPlayer) {
            // Select another of your own pieces
            const newValidMoves = calculateValidMovesForPiece(position, clickedPiece, board);
            setSelectedPiece(position);
            setValidMoves(newValidMoves);
        } else {
            // Deselect
            setSelectedPiece(null);
            setValidMoves([]);
        }
    } 
    // If no piece is selected, try to select one
    else if (clickedPiece && clickedPiece.player === currentPlayer) {
        const newValidMoves = calculateValidMovesForPiece(position, clickedPiece, board);
        setSelectedPiece(position);
        setValidMoves(newValidMoves);
    }
  };

  useEffect(() => {
    if(!winner) {
        // If current player has no moves, they lose.
        const allPlayerMoves = calculateAllMovesForPlayer(currentPlayer, board);
        if(allPlayerMoves.length === 0) {
            setWinner(currentPlayer === 'red' ? 'black' : 'red');
        }
    }
  }, [currentPlayer, board, winner, calculateAllMovesForPlayer]);

  return (
    <div className="min-h-screen bg-gray-200 dark:bg-gray-800 flex flex-col items-center justify-center p-4 font-sans text-gray-800 dark:text-gray-200">
      <div className="w-full max-w-lg mx-auto">
        <header className="text-center mb-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">React Checkers</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">A classic game for two</p>
        </header>

        <main className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-2xl shadow-xl flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-4 px-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-gray-800 border-2 border-gray-900"></div>
              <span className="font-bold text-lg">Black: {blackPieces}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg">Red: {redPieces}</span>
              <div className="w-5 h-5 rounded-full bg-red-600 border-2 border-red-800"></div>
            </div>
          </div>
          
          <Board board={board} onSquareClick={handleSquareClick} validMoves={validMoves} selectedPiece={selectedPiece} />
          
          <div className="w-full mt-4 text-center">
            {winner ? (
              <div className="p-4 bg-green-100 dark:bg-green-900 border-2 border-green-500 rounded-lg">
                <h2 className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {winner.charAt(0).toUpperCase() + winner.slice(1)} wins!
                </h2>
              </div>
            ) : (
              <div className="p-4 bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-400 dark:border-blue-600 rounded-lg">
                <h2 className="text-2xl font-semibold">
                  Turn: <span className={`font-bold ${currentPlayer === 'red' ? 'text-red-600' : 'text-gray-800 dark:text-gray-200'}`}>{currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}</span>
                </h2>
              </div>
            )}
            <button
              onClick={resetGame}
              className="mt-4 px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-all duration-200 ease-in-out transform hover:scale-105"
            >
              New Game
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
