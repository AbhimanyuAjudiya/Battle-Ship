import useBattleshipContract from '../hooks/useBattleshipContract';

const WalletConnector = () => {
  const { account } = useBattleshipContract();

  return (
    <div className="absolute top-4 right-4 text-white">
      {account ? (
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>{`${account.slice(0, 6)}...${account.slice(-4)}`}</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>Not Connected</span>
        </div>
      )}
    </div>
  );
};

export default WalletConnector;