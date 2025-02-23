import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
import { Ship } from '../types';
import { ethers } from 'ethers';

export const generateShipsHash = (ships: Ship[]): Buffer[] => {
  return ships.map(ship => {
    const data = ethers.AbiCoder.defaultAbiCoder().encode(
      ['bytes32', 'string', 'uint8[]', 'uint8[]'],
      [
        ship.salt,
        ship.type,
        Array.from({ length: ship.size }, (_, i) => 
          ship.isVertical ? ship.row + i : ship.row
        ),
        Array.from({ length: ship.size }, (_, i) => 
          ship.isVertical ? ship.col : ship.col + i
        )
      ]
    );
    return keccak256(data);
  });
};

export const generateMerkleRoot = (ships: Ship[]): string => {
  const leaves = generateShipsHash(ships);
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  return tree.getHexRoot();
};