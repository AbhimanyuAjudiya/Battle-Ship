import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

interface GameStatusProps {
  contract: ethers.Contract | null;
  account: string | null;
}

interface GameState {
  player1: string;
  player2: string;
  boardRoot1: string;
  boardRoot2: string;
  hits1: number;
  hits2: number;
  turnDeadline: number;
  deposit: ethers.BigNumberish;
}

const GameStatus = ({ contract, account }: GameStatusProps) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [opponent, setOpponent] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('--:--');

  useEffect(() => {
    const loadGameState = async () => {
      if (!contract || !account) return;

      try {
        const game = await contract.games(account);
        const formattedState: GameState = {
          player1: game.player1,
          player2: game.player2,
          boardRoot1: game.boardRoot1,
          boardRoot2: game.boardRoot2,
          hits1: game.hits1.toNumber(),
          hits2: game.hits2.toNumber(),
          turnDeadline: game.turnDeadline.toNumber(),
          deposit: game.deposit
        };

        setGameState(formattedState);
        setOpponent(game.player1 === account ? game.player2 : game.player1);
        
        // Update time remaining calculation
        if (game.turnDeadline.gt(0)) {
          const provider = contract.provider as unknown as ethers.Provider;
          const currentBlock = await provider.getBlockNumber();
          const blocksRemaining = game.turnDeadline.sub(currentBlock).toNumber();
          const minutes = Math.floor(blocksRemaining * 2 / 60);
          const seconds = (blocksRemaining * 2) % 60;
          setTimeRemaining(
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
          );
        }
      } catch (error) {
        console.error('Error loading game state:', error);
        setGameState(null);
        setOpponent(null);
      }
    };

    loadGameState();
    
    const onResponseSubmitted = () => loadGameState();
    const onGameWon = () => loadGameState();

    contract?.on(contract.filters.ResponseSubmitted(), onResponseSubmitted);
    contract?.on(contract.filters.GameWon(), onGameWon);

    return () => {
      contract?.off(contract.filters.ResponseSubmitted(), onResponseSubmitted);
      contract?.off(contract.filters.GameWon(), onGameWon);
    };
  }, [contract, account]);

  if (!gameState || !opponent) {
    return (
      <div className="text-white p-4 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Game Status</h2>
        <p>No active game found</p>
      </div>
    );
  }

  return (
    <div className="text-white p-4 bg-gray-800 rounded-lg space-y-3 min-w-[300px]">
      <h2 className="text-xl font-bold border-b border-gray-700 pb-2">Game Status</h2>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Your Hits:</span>
          <span className="font-mono">{gameState.hits1}/17</span>
        </div>
        
        <div className="flex justify-between">
          <span>Opponent Hits:</span>
          <span className="font-mono">{gameState.hits2}/17</span>
        </div>

        <div className="flex justify-between">
          <span>Deposit:</span>
          <span className="font-mono">
            {ethers.formatEther(gameState.deposit)} MATIC
          </span>
        </div>

        <div className="flex justify-between">
          <span>Turn Timeout:</span>
          <span className="font-mono">
            {gameState.turnDeadline > 0 ? timeRemaining : 'Not Active'}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Opponent:</span>
          <span className="font-mono text-blue-400 truncate" title={opponent}>
            {opponent.slice(0, 6)}...{opponent.slice(-4)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GameStatus;