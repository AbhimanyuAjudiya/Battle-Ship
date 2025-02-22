import { useEffect, useState } from "react";
import Boards from "./component/Boards";
import { createGame } from "../web3";

function App() {
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const connectWallet = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
      }
    };
    connectWallet();
  }, []);

  const handleCreateGame = async () => {
    const opponentAddress = prompt("Enter opponent's wallet address:");
    if (opponentAddress) {
      await createGame("DUMMY_HASH", opponentAddress);
    }
  };

  return (
    <div className="text-white flex flex-col w-full items-center">
      <button onClick={handleCreateGame} className="fixed bg-blue-500 p-2 rounded">
        Create Game
      </button>
      <Boards />
    </div>
  );
}

export default App;
