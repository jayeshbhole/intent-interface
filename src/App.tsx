import { Intents } from "@bytekode/intents";
import { useContext, useEffect, useState } from "react";
import { zeroAddress } from "viem";
import { useAccount, useNetwork } from "wagmi";
import Web3AuthContext from "./Web3AuthContext";

const intents = new Intents("test-api-key");

const handleExecute = async ({
  chainId,
  command,
  signerAddress,
}: {
  chainId: string;
  command: string;
  signerAddress: string;
}) => {
  const txObject = await intents.getTransaction(chainId, command, signerAddress);

  console.log(txObject);
};

function App() {
  const [command, setCommand] = useState("");
  const { address } = useAccount();
  const { chain } = useNetwork();

  return (
    <div className="flex gap-4 justify-center relative items-center w-full h-full flex-col">
      <div className="absolute top-8 right-8 flex gap-4">
        <Profile />
      </div>
      <h1 className="text-center">What do you intend to do?</h1>

      <input
        type="text"
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        placeholder="Bridge funds from... to..."
        className="w-[60ch] rounded-xl border-[1px] border-gray-600 p-4"
      />

      <button
        onClick={() =>
          handleExecute({
            command,
            chainId: chain?.id.toString() || "",
            signerAddress: address || zeroAddress,
          })
        }
      >
        Execute
      </button>
    </div>
  );
}

function Profile() {
  const [address, setAddress] = useState("");
  const [copied, setCopied] = useState(false);
  const { loggedIn, getAccounts, logout, login } = useContext(Web3AuthContext);

  useEffect(() => {
    const getAccount = async () => {
      const account = await getAccounts();
      // @ts-ignore
      setAddress(account);
    };
    getAccount();
  }, [getAccounts]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (copied) {
      timeout = setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
    return () => timeout && clearTimeout(timeout);
  }, [copied]);

  if (loggedIn)
    return (
      <>
        {/* onclick, copy to clipboard */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(address);
            setCopied(true);
          }}
        >
          {
            // if copied, show "copied"
            copied ? "Copied!" : `${address?.slice(0, 6)}...${address?.slice(-4)}`
          }
        </button>
        <button onClick={() => logout()}>Disconnect</button>
      </>
    );
  return <button onClick={() => login()}>Login</button>;
}

// function Profile() {
//   const { address, isConnected } = useAccount();
//   const { connect } = useConnect({
//     connector: new InjectedConnector(),
//   });
//   const { disconnect } = useDisconnect();

//   if (isConnected)
//     return (
//       <>
//         <button>
//           {address?.slice(0, 6)}...{address?.slice(-4)}
//         </button>
//         <button onClick={() => disconnect()}>Disconnect</button>
//       </>
//     );
//   return <button onClick={() => connect()}>Login</button>;
// }

export default App;
