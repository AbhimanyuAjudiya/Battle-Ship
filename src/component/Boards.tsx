import { useState } from 'react';
import ShipPlacement from './ShipPlacement';

function Boards() {
    const [playerBoard, setPlayerBoard] = useState(Array(10).fill(Array(10).fill(null)));
    const [opponentBoard, setOpponentBoard] = useState(Array(10).fill(Array(10).fill(null)));

    const handleOpponentCellClick = (row: number, col: number) => {
        setOpponentBoard(opponentBoard.map((r, rIndex) => r.map((c, cIndex) => rIndex === row && cIndex === col ? 'X' : c)));
    };

    return (
        <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center space-y-8">
            <h1 className="text-white text-2xl font-mono mb-6">Battleship</h1>
            <div className="flex flex-row space-x-8">
                <div>
                    <h2 className="text-white text-xl font-mono mb-4">Player's Board</h2>
                    <ShipPlacement playerBoard={playerBoard} setPlayerBoard={setPlayerBoard} />
                </div>
                <div>
                    <h2 className="text-white text-xl font-mono mb-4">Opponent's Board</h2>
                    <div className="grid grid-cols-10 gap-2 p-4 border-2 border-white">
                        {opponentBoard.map((row, rowIndex) => (
                            <div key={rowIndex} className="contents">
                                {row.map((cell, colIndex) => (
                                    <div
                                        key={colIndex}
                                        className="w-10 h-10 bg-gray-800 border border-white flex items-center justify-center cursor-pointer hover:bg-gray-700 text-white font-mono"
                                        onClick={() => handleOpponentCellClick(rowIndex, colIndex)}
                                    >
                                        {cell}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Boards;