import { useState, useEffect, useCallback } from 'react';
import { ShipPlacementProps, Ship, ShipType, CellState } from '../types';
import { generateMerkleRoot } from '../utils/gameLogic.tsx';
import { ethers } from 'ethers';

const ShipPlacement: React.FC<ShipPlacementProps> = ({ 
  playerBoard, 
  setPlayerBoard,
  onCommit
}) => {
  const [draggedShip, setDraggedShip] = useState<Ship | null>(null);
  const [placedShips, setPlacedShips] = useState<Ship[]>([]);
  const [hoveredCells, setHoveredCells] = useState<[number, number][]>([]);
  const [isVertical, setIsVertical] = useState(false);
  const [isOverlap, setIsOverlap] = useState(false);

  const updateHoveredCells = useCallback((ship: Ship) => {
    const newHoveredCells: [number, number][] = [];
    let isValidPlacement = true;

    for (let i = 0; i < ship.size; i++) {
      const r = ship.isVertical ? ship.row + i : ship.row;
      const c = ship.isVertical ? ship.col : ship.col + i;

      if (r >= 10 || c >= 10 || playerBoard[r][c]) {
        isValidPlacement = false;
        break;
      }
      newHoveredCells.push([r, c]);
    }

    setIsOverlap(!isValidPlacement);
    setHoveredCells(newHoveredCells);
  }, [playerBoard]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r') {
        setIsVertical(prev => !prev);
        if (draggedShip) {
          updateHoveredCells(draggedShip);
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [draggedShip, updateHoveredCells]);

  const handleDragStart = (ship: Omit<Ship, 'row' | 'col' | 'isVertical'>) => {
    setDraggedShip({
      ...ship,
      row: -1,
      col: -1,
      isVertical
    });

    const handleDragEnd = () => {
      setHoveredCells([]);
      setIsOverlap(false);
    };

    document.addEventListener('dragend', handleDragEnd, { once: true });
  };

  const handleDragOver = (row: number, col: number) => {
    if (draggedShip) {
      updateHoveredCells({ ...draggedShip, row, col });
    }
  };

  const handleDrop = (row: number, col: number) => {
    if (draggedShip && hoveredCells.length === draggedShip.size && !isOverlap) {
      const newBoard = playerBoard.map((r, rIndex) =>
        r.map((c, cIndex) => 
          hoveredCells.some(([hr, hc]) => hr === rIndex && hc === cIndex) 
            ? draggedShip.type 
            : c
        )
      );
      
      setPlayerBoard(newBoard);
      setPlacedShips([...placedShips, { ...draggedShip, row, col, isVertical }]);
      setDraggedShip(null);
      setHoveredCells([]);
      setIsOverlap(false);
    }
  };

  const handleShipClick = (shipType: ShipType) => {
    const ship = placedShips.find(s => s.type === shipType);
    if (!ship) return;

    const newBoard = playerBoard.map(row => 
      row.map(cell => cell === shipType ? null : cell)
    );
    
    setPlayerBoard(newBoard);
    setPlacedShips(placedShips.filter(s => s.type !== shipType));
    setDraggedShip({ ...ship, isVertical: !ship.isVertical });
  };

  const handleFinalizeSetup = () => {
    const ships = placedShips.map(ship => ({
      ...ship,
      salt: ethers.hexlify(ethers.randomBytes(32))
    }));
    
    const merkleRoot = generateMerkleRoot(ships);
    onCommit(merkleRoot, ships);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-10 gap-2 p-4 border-2 border-white mb-8">
        {playerBoard.map((row, rowIndex) => (
          <div key={rowIndex} className="contents">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className={`w-10 h-10 border border-white flex items-center justify-center cursor-pointer text-white font-mono
                  ${hoveredCells.some(([hr, hc]) => hr === rowIndex && hc === colIndex) ? (isOverlap ? 'bg-red-500' : 'bg-blue-500') : 'bg-gray-800'}
                  ${cell ? 'bg-green-500' : ''}`}
                onDrop={() => handleDrop(rowIndex, colIndex)}
                onDragOver={(e) => {
                  e.preventDefault();
                  handleDragOver(rowIndex, colIndex);
                }}
                onClick={() => {
                  if (!cell) return;
                  const ship = placedShips.find(s => s.type === cell);
                  if (!ship) return;
                  handleShipClick(ship);
                }}
              >
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="flex space-x-4">
        {[
          { type: 'Carrier', size: 5 },
          { type: 'Battleship', size: 4 },
          { type: 'Cruiser', size: 3 },
          { type: 'Submarine', size: 3 },
          { type: 'Destroyer', size: 2 }
        ].map((ship, index) => (
          !placedShips.some(s => s.type === ship.type) && (
            <div
              key={index}
              draggable
              onDragStart={() => handleDragStart({ type: ship.type, size: ship.size, isVertical })}
              className="w-20 h-10 bg-gray-700 text-white flex items-center justify-center cursor-pointer"
            >
              {ship.type}
            </div>
          )
        ))}
      </div>
      <button 
        onClick={handleFinalizeSetup}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Commit Board
      </button>
    </div>
  );
};

export default ShipPlacement;