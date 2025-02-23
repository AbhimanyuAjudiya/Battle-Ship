# Polygon Battleship

**Fully On-Chain Battleship Game with Crypto-Economic Enforcement**

Polygon Battleship is a decentralized, trustless implementation of the classic Battleship game, built on the Polygon blockchain. It uses **Merkle proofs** and **crypto-economic penalties** to ensure fair gameplay without relying on ZK proofs or encryption. Players can challenge invalid boards, and deposits are slashed for cheating.

---

## Features 

- **Fully On-Chain**: All game logic and state are stored on the Polygon blockchain.
- **No ZK/Encryption**: Uses Merkle proofs and deposits to enforce rules.
- **Trustless Gameplay**: Players can challenge invalid boards and earn rewards.
- **Gas-Efficient**: Optimized for Polygon’s low transaction fees.
- **Real-Time Interaction**: Sub-2s block times enable fast gameplay.
- **Withdrawal Pattern**: Secure fund management with pull payments.

---

## How It Works 🛠️

### Game Flow
1. **Board Setup**:
   - Players commit their ship placements as a Merkle root (`boardRoot`).
   - A deposit (10 MATIC) is required to prevent cheating.

2. **Gameplay**:
   - Players take turns guessing coordinates.
   - The opponent responds with a hit/miss, backed by a Merkle proof.

3. **Challenges**:
   - Anyone can challenge a player’s board for validity.
   - Invalid boards lose their deposit to the challenger.

4. **Winning**:
   - The first player to sink all 17 ship coordinates wins the game and claims the prize.

---

## Smart Contract Details 📜

### Key Components
- **Merkle Proofs**: Verify ship coordinates without revealing the entire board.
- **Deposit Slashing**: Penalizes players for invalid boards or dishonest responses.
- **Gas Optimization**: Uses packed structs, fixed-size arrays, and block-number timeouts.

### Contract Functions
- `createGame(bytes32 boardRoot, address opponent)`: Start a new game.
- `submitGuess(uint8 x, uint8 y, address opponent)`: Submit a guess coordinate.
- `submitResponse(uint8 x, uint8 y, bool hit, bytes32 salt, bytes32[] proof)`: Respond to a guess.
- `challengeBoard(address player)`: Challenge a player’s board validity.
- `withdraw()`: Withdraw earned funds securely.

---

## Setup and Deployment 🚀

### Prerequisites
- Node.js (v16+)
- Hardhat
- MetaMask (or another Web3 wallet)
- Polygon Mumbai Testnet MATIC (get it from [Polygon Faucet](https://faucet.polygon.technology/))

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/polygon-battleship.git
   cd polygon-battleship