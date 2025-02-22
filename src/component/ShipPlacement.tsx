import { useState, useEffect } from 'react';

const ShipPlacement = ({ playerBoard, setPlayerBoard }) => {
    const [draggedShip, setDraggedShip] = useState(null);
    const [placedShips, setPlacedShips] = useState([]);
    const [hoveredCells, setHoveredCells] = useState([]);
    const [isVertical, setIsVertical] = useState(false);
    const [isOverlap, setIsOverlap] = useState(false);

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key.toLowerCase() === 'r') {
                setIsVertical(prev => !prev);
                if (draggedShip) {
                    updateHoveredCells(draggedShip);
                }
            }
        };

        document.addEventListener('keydown', handleKeyPress);

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [draggedShip]);

    const handleDragStart = (ship) => {
        setDraggedShip(ship);

        const handleDragEnd = () => {
            setHoveredCells([]);
            setIsOverlap(false);
        };

        document.addEventListener('dragend', handleDragEnd, { once: true });
    };

    const updateHoveredCells = (ship) => {
        if (!ship) return;

        const newHoveredCells = [];
        let isValidPlacement = true;

        for (let i = 0; i < ship.size; i++) {
            const r = isVertical ? ship.row + i : ship.row;
            const c = isVertical ? ship.col : ship.col + i;

            if (r >= 10 || c >= 10 || playerBoard[r][c]) {
                isValidPlacement = false;
                break;
            }

            newHoveredCells.push([r, c]);
        }

        setIsOverlap(!isValidPlacement);
        setHoveredCells(newHoveredCells);
    };

    const handleDragOver = (row, col) => {
        if (draggedShip) {
            updateHoveredCells({ ...draggedShip, row, col });
        }
    };

    const handleDrop = (row, col) => {
        if (draggedShip && hoveredCells.length === draggedShip.size && !isOverlap) {
            const newBoard = playerBoard.map((r, rIndex) =>
                r.map((c, cIndex) => {
                    if (hoveredCells.some(([hr, hc]) => hr === rIndex && hc === cIndex)) {
                        return draggedShip.type;
                    }
                    return c;
                })
            );
            setPlayerBoard(newBoard);
            setPlacedShips([...placedShips, { ...draggedShip, isVertical }]);
            setDraggedShip(null);
            setHoveredCells([]);
            setIsOverlap(false);
        }
    };

    const handleShipClick = (ship) => {
        const newBoard = playerBoard.map((r, rIndex) =>
            r.map((c, cIndex) => (c === ship.type ? null : c))
        );
        setPlayerBoard(newBoard);

        setPlacedShips(placedShips.filter(s => s.type !== ship.type));
        setDraggedShip({ ...ship, isVertical: !ship.isVertical });
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
                                onClick={() => cell && handleShipClick({ type: cell, size: placedShips.find(s => s.type === cell).size, isVertical: placedShips.find(s => s.type === cell).isVertical })}
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
        </div>
    );
};

export default ShipPlacement;