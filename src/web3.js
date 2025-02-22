import { ethers } from 'ethers';
import { sha256 } from 'js-sha256';
// import PolygonBattleship from './artifacts/contracts/PolygonBattleship.sol/PolygonBattleship.json';

const CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS_HERE';

const getProvider = () => {
    return new ethers.providers.Web3Provider(window.ethereum);
};

export const checkGameStatus = async () => {
    const contract = await getContract();
    return await contract.checkWinner();
  };
  

export const generateMerkleRoot = (board) => {
    const hashLeaf = (row, col) => sha256(`${row},${col}`);

    const hashNodes = (left, right) => sha256(left + right);

    let leaves = [];
    for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
        for (let colIndex = 0; colIndex < board[rowIndex].length; colIndex++) {
            if (board[rowIndex][colIndex]) {
                leaves.push(hashLeaf(rowIndex, colIndex));
            }
        }
    }

    while (leaves.length > 1) {
        let temp = [];
        for (let i = 0; i < leaves.length; i += 2) {
            if (i + 1 < leaves.length) {
                temp.push(hashNodes(leaves[i], leaves[i + 1]));
            } else {
                temp.push(leaves[i]);
            }
        }
        leaves = temp;
    }

    return leaves[0] || null;
};

export const createGame = async (boardRoot, opponent) => {
    const provider = getProvider();
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, PolygonBattleship.abi, signer);

    const depositAmount = ethers.utils.parseEther('10');
    const tx = await contract.createGame(boardRoot, opponent, { value: depositAmount });
    await tx.wait();
};

export const submitGuess = async (x, y, opponent) => {
    const provider = getProvider();
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, PolygonBattleship.abi, signer);

    const tx = await contract.submitGuess(x, y, opponent);
    await tx.wait();
};
