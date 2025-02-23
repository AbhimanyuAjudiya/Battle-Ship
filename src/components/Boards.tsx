import { useState } from 'react';
import ShipPlacement from './ShipPlacement';
import GameStatus from './GameStatus';
import useBattleshipContract from '../hooks/useBattleshipContract';
import { CellState, Ship } from '../types';
import { ethers } from 'ethers';

const Boards: React.FC = () => {
  const { contract, account } = useBattleshipContract();
  const [gamePhase, setGamePhase] = useState<'setup' | 'battle'>('setup');
  const [playerBoard, setPlayerBoard] = useState<CellState[][]>(
    Array(10).fill(null).map(() => Array(10).fill(null))
  );
  const [opponentBoard, setOpponentBoard] = useState<CellState[][]>(
    Array(10).fill(null).map(() => Array(10).fill(null))
  );

  const handleCommit = async (merkleRoot: string, ships: Ship[]) => {
    if (!contract || !account) return;
    
    try {
      const tx = await contract.createGame(merkleRoot, "0x0000000000000000000000000000000000000000", {
        value: ethers.parseEther("10")
      });
      await tx.wait();
      setGamePhase('battle');
    } catch (error) {
      console.error('Commit failed:', error);
    }
  };

  const handleGuess = async (row: number, col: number) => {
    if (!contract) return;
    
    try {
      const tx = await contract.submitGuess(row, col, opponent);
      await tx.wait();
      
      contract.on("ResponseSubmitted", (responder: string, hit: boolean) => {
        const newBoard = [...opponentBoard];
        newBoard[row][col] = hit ? 'hit' : 'miss';
        setOpponentBoard(newBoard);
      });
    } catch (error) {
      console.error('Guess failed:', error);
    }
  };


  return (
    <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center space-y-8">
      <h1 className="text-white text-2xl font-mono mb-6">Polygon Battleship</h1>
      
      {/* {gamePhase === 'setup' ? ( */}
        <ShipPlacement 
          playerBoard={playerBoard}
          setPlayerBoard={setPlayerBoard}
          onCommit={handleCommit}
        />
      {/* ) : ( */}
        <div className="flex space-x-8">
          <div>
            <h2 className="text-white text-xl font-mono mb-4">Your Board</h2>
            {/* Player's board visualization */}
          </div>
          <div>
            <h2 className="text-white text-xl font-mono mb-4">Attack Board</h2>
            <div className="grid grid-cols-10 gap-2 p-4 border-2 border-white">
              {opponentBoard.map((row, rowIndex) => (
                <div key={rowIndex} className="contents">
                  {row.map((cell, colIndex) => (
                    <button
                      key={colIndex}
                      className={`w-10 h-10 border flex items-center justify-center 
                        ${cell ? 'bg-gray-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                      onClick={() => handleGuess(rowIndex, colIndex)}
                      disabled={!!cell}
                    >
                      {cell}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <GameStatus contract={contract} account={account} />
        </div>
      {/* )} */}
    </div>
  );
};

export default Boards;