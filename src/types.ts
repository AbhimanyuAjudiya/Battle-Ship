import { ethers } from "ethers";

// types.ts
export type CellState = 'ship' | 'hit' | 'miss' | null;
export type ShipType = 'Carrier' | 'Battleship' | 'Cruiser' | 'Submarine' | 'Destroyer';

export interface Ship {
  salt: string;
  type: ShipType;
  size: number;
  row: number;
  col: number;
  isVertical: boolean;
}

export interface ShipPlacementProps {
  playerBoard: CellState[][];
  setPlayerBoard: React.Dispatch<React.SetStateAction<CellState[][]>>;
  onCommit: (merkleRoot: string, ships: Ship[]) => void;
}

export interface GameStatusProps {
  contract: ethers.Contract | null;
  account: string | null;
}