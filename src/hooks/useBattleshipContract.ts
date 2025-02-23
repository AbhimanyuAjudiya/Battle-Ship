import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import PolygonBattleshipABI from '../abis/PolygonBattleship.json';

interface BattleshipHook {
  contract: ethers.Contract | null;
  account: string | null;
  provider: ethers.Provider | null;
}

const useBattleshipContract = (): BattleshipHook => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.Provider | null>(null);

  useEffect(() => {
    const init = async () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          await provider.send("eth_requestAccounts", []);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          
          const abi = PolygonBattleshipABI.abi || PolygonBattleshipABI;

          const contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            abi,
            signer
          );

          setProvider(provider);
          setAccount(address);
          setContract(contract);
        } catch (error) {
          console.error('Wallet connection failed:', error);
        }
      }
    };

    init();
  }, []);

  return { contract, account, provider };
};

export default useBattleshipContract;