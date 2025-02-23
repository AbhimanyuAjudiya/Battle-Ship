import Boards from './components/Boards';
import WalletConnector from './components/WalletConnector';

function App() {
  return (
    <div className="relative">
      <WalletConnector />
      <Boards />
    </div>
  );
}

export default App;