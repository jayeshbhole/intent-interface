/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Intents } from "@bytekode/intents";
import { useContext, useEffect, useState } from "react";
import { zeroAddress } from "viem";
import Web3AuthContext from "./Web3AuthContext";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import { useEthersSigner } from "./ethers";

const intents = new Intents("test-api-key");

interface HistoryItem {
  command: string;
  transactions: {
    chainId: string;
    tx: string;
  }[];
}

function App() {
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>(JSON.parse(localStorage.getItem("history") || "[]"));
  const ethersSigner = useEthersSigner();
  const { chain } = useNetwork();
  const { address } = useAccount();

  useEffect(() => {
    console.log(chain);
  }, [chain]);

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
    const transactions = [];
    try {
      for (const tx of txObject) {
        console.log(tx);

        const rec = await ethersSigner?.sendTransaction(tx);
        const res = await rec?.wait();

        console.log(res);

        transactions.push({
          chainId,
          tx: res?.hash || "",
        });
      }

      setHistory([
        ...history,
        {
          command,
          transactions,
        },
      ]);
    } catch (e) {
      // setError(e);
      console.log(e);
    }
  };

  useEffect(() => {
    localStorage.setItem("history", JSON.stringify(history));
  }, [history]);

  return (
    <div className="flex overflow-auto gap-4 justify-end py-8 relative items-center w-full h-full flex-col">
      <div className="absolute top-8 right-8 flex gap-4">
        <NetworkSelector />
        <Profile />
      </div>

      <div className="flex gap-4 flex-col overflow-auto">
        {history.map((item, i) => (
          <div
            className="flex flex-col gap-2 p-4 bg-slate-500/10 rounded-lg"
            key={i}
          >
            <p>{item.command}</p>
            {item.transactions.map((tx) => (
              <a
                href={`https://mumbai.polygonscan.com/tx/${tx.tx}`}
                target="_blank"
                rel="noreferrer"
                key={tx.tx}
              >
                {tx.tx}
              </a>
            ))}
          </div>
        ))}
      </div>

      <h1 className="text-center text-xl">your intentions, ser 👀</h1>

      <div className="relative w-[70ch]">
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Bridge funds from... to..."
          className="w-full rounded-xl border-[1px] border-gray-600 p-4"
        />

        <button
          className="absolute right-1 rounded-lg top-1 text-white p-3"
          onClick={() =>
            handleExecute({
              command,
              chainId: "80001",
              signerAddress: address || zeroAddress,
            })
          }
        >
          Execute
        </button>
      </div>
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

const NetworkSelector = () => {
  const chains = [
    { name: "mumbai", id: 80001 },
    { name: "avalanche", id: 43113 },
  ];
  const { setNetwork, network } = useContext(Web3AuthContext);
  const [open, setOpen] = useState(false);
  const { switchNetwork } = useSwitchNetwork();

  // dropdown menu
  return (
    <div className="relative">
      <div className="relative capitalize cursor-pointer">
        <div
          className="bg-[#1a1a1a] rounded-lg text-[1em] p-[0.6em_1.2em]"
          onClick={() => setOpen(true)}
        >
          {network || "Select Network"}
        </div>

        {open && (
          <div className="flex flex-col absolute top-8 -left-3 gap-2 mt-4 capitalize">
            {chains.map((chain) => (
              <button
                className="capitalize"
                onClick={() => {
                  setNetwork(chain.name);
                  switchNetwork ? switchNetwork(chain.id) : null;
                  setOpen(false);
                }}
                key={chain.id}
              >
                {chain.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
