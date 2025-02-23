// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract PolygonBattleship {
    using MerkleProof for bytes32[];
    
    struct Game {
        address player1;
        address player2;
        bytes32 boardRoot1;
        bytes32 boardRoot2;
        uint32 hits1;
        uint32 hits2;
        uint64 turnDeadline;
        uint128 deposit;
    }

    struct ShipReveal {
        uint8[5] shipTypes;   
        bytes32[5] salts; 
        uint8[5][5] xCoords; 
        uint8[5][5] yCoords; 
    }

    mapping(address => Game) public games;
    mapping(bytes32 => bytes32) public responses;
    mapping(address => ShipReveal) internal shipReveals;
    mapping(address => uint256) public withdrawable;

    uint8 public constant MAX_HITS = 17;
    uint128 public constant DEPOSIT_AMOUNT = 10 ether;
    uint64 public constant TURN_TIMEOUT = 30;

    event GameCreated(address indexed player1, address indexed player2);
    event GuessMade(address indexed guesser, uint8 x, uint8 y);
    event ResponseSubmitted(address indexed responder, bool hit);
    event BoardChallenged(address indexed challenger, address indexed player);
    event GameWon(address indexed winner);
    event Withdrawal(address indexed receiver, uint256 amount);

    modifier onlyPlayers(address opponent) {
        require(msg.sender == games[opponent].player1 || 
                msg.sender == games[opponent].player2, "Not a player");
        _;
    }

    function createGame(bytes32 boardRoot, address opponent) external payable {
        require(msg.value == DEPOSIT_AMOUNT, "Incorrect deposit");
        require(games[msg.sender].player1 == address(0), "Game exists");

        games[msg.sender] = Game({
            player1: msg.sender,
            player2: opponent,
            boardRoot1: boardRoot,
            boardRoot2: bytes32(0),
            hits1: 0,
            hits2: 0,
            turnDeadline: 0,
            deposit: uint128(msg.value)
        });

        emit GameCreated(msg.sender, opponent);
    }

    function submitGuess(uint8 x, uint8 y, address opponent) external onlyPlayers(opponent) {
        Game storage game = games[opponent];
        require(game.turnDeadline == 0, "Turn pending");
        require(x < 10 && y < 10, "Invalid coordinates");

        responses[keccak256(abi.encodePacked(x, y))] = bytes32(0);
        game.turnDeadline = uint64(block.number + TURN_TIMEOUT);
        emit GuessMade(msg.sender, x, y);
    }

    function submitResponse(uint8 x, uint8 y, bool hit, bytes32 salt, bytes32[] calldata proof) external {
        Game storage game = games[msg.sender];
        require(game.turnDeadline > 0, "No pending turn");
        require(block.number <= game.turnDeadline, "Turn expired");

        bytes32 guessHash = keccak256(abi.encodePacked(x, y));
        bytes32 responseHash = keccak256(abi.encodePacked(hit, salt));
        require(responses[guessHash] == responseHash, "Invalid response");

        if (hit) {
            bytes32 leaf = keccak256(abi.encodePacked(salt, x, y));
            require(proof.verify(game.boardRoot1, leaf), "Invalid hit proof");
        }

        _updateHits(game, hit);
        game.turnDeadline = 0;
        emit ResponseSubmitted(msg.sender, hit);

        if (game.hits1 >= MAX_HITS || game.hits2 >= MAX_HITS) {
            _endGame(game);
        }
    }

    function challengeBoard(address player) external {
        Game storage game = games[player];
        require(game.deposit > 0, "No active game");
        
        ShipReveal storage reveal = shipReveals[player];
        require(reveal.shipTypes[0] == 0, "Already revealed");

        if (!_validateShips(reveal, game.boardRoot1)) {
            withdrawable[msg.sender] += game.deposit;
            game.deposit = 0;
        }

        emit BoardChallenged(msg.sender, player);
    }

    function withdraw() external {
        uint256 amount = withdrawable[msg.sender];
        require(amount > 0, "Nothing to withdraw");
        
        withdrawable[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
        emit Withdrawal(msg.sender, amount);
    }
    
    function getShipReveal(address player) external view returns (
        uint8[5] memory shipTypes,
        bytes32[5] memory salts,
        uint8[5][5] memory xCoords,
        uint8[5][5] memory yCoords
    ) {
        ShipReveal storage reveal = shipReveals[player];
        return (reveal.shipTypes, reveal.salts, reveal.xCoords, reveal.yCoords);
    }

    function _updateHits(Game storage game, bool hit) internal {
        if (msg.sender == game.player1) {
            game.hits2 += hit ? 1 : 0;
        } else {
            game.hits1 += hit ? 1 : 0;
        }
    }

    function _endGame(Game storage game) internal {
        address winner = game.hits1 >= MAX_HITS ? game.player1 : game.player2;
        uint256 prize = uint256(game.deposit) * 2;
        
        withdrawable[winner] += prize;
        delete games[winner];
        emit GameWon(winner);
    }

function _validateShips(ShipReveal storage reveal, bytes32 boardRoot) internal view returns (bool) {
    uint8[5] memory expectedLengths = [2, 3, 3, 4, 5];
    uint256[10] memory grid;
    for (uint i = 0; i < 5; i++) {
        if (reveal.shipTypes[i] != expectedLengths[i]) {
            return false;
        }
        
        uint8 length = expectedLengths[i];
        uint8 prevX = reveal.xCoords[i][0];
        uint8 prevY = reveal.yCoords[i][0];
        
        bool isVertical = false;
        bool isHorizontal = false;
        
        for (uint j = 1; j < length; j++) {
            uint8 x = reveal.xCoords[i][j];
            uint8 y = reveal.yCoords[i][j];
            
            if (x == prevX && y == prevY + 1) {
                isHorizontal = true;
            } else if (y == prevY && x == prevX + 1) {
                isVertical = true;
            } else {
                return false;
            }
            
            if (x >= 10 || y >= 10) {
                return false;
            }
            
            uint256 cellMask = 1 << (y * 10 + x);
            if (grid[y] & cellMask != 0) {
                return false;
            }
            grid[y] |= cellMask;
            
            prevX = x;
            prevY = y;
        }
        
        if (isVertical && isHorizontal) {
            return false; // Invalid orientation
        }
    }

    bytes32[] memory leaves = new bytes32[](5);
    for (uint i = 0; i < 5; i++) {
        bytes memory data;
        for (uint j = 0; j < reveal.shipTypes[i]; j++) {
            data = abi.encodePacked(
                data,
                reveal.xCoords[i][j],
                reveal.yCoords[i][j]
            );
        }
        leaves[i] = keccak256(abi.encodePacked(
            reveal.shipTypes[i],
            reveal.salts[i],
            data
        ));
    }

    return _computeMerkleRoot(leaves) == boardRoot;
}

function _computeMerkleRoot(bytes32[] memory leaves) internal pure returns (bytes32) {
    bytes32 h1 = keccak256(abi.encodePacked(leaves[0], leaves[1]));
    bytes32 h2 = keccak256(abi.encodePacked(leaves[2], leaves[3]));
    bytes32 h3 = keccak256(abi.encodePacked(h1, h2));
    return keccak256(abi.encodePacked(h3, leaves[4]));
}

    receive() external payable {}
}