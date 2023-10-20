import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

function App() {
  return (
    <div className="flex gap-4 justify-center relative items-center w-full h-full flex-col">
      <div className="absolute top-8 right-8 flex gap-4">
        <Profile />
      </div>
      <h1 className="text-center">What do you intend to do?</h1>

      <input
        type="text"
        placeholder="Bridge funds from... to..."
        className="w-[60ch] rounded-xl border-[1px] border-gray-600 p-4"
      />
    </div>
  );
}

function Profile() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();

  if (isConnected)
    return (
      <>
        <button>
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </button>
        <button onClick={() => disconnect()}>Disconnect</button>
      </>
    );
  return <button onClick={() => connect()}>Connect Wallet</button>;
}

export default App;
