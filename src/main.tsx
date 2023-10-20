import React from "react";
import ReactDOM from "react-dom/client";
import { createPublicClient, http } from "viem";
import { WagmiConfig, createConfig, mainnet } from "wagmi";
import App from "./App";
import { Web3AuthContextProvider } from "./Web3AuthContext";
import "./index.css";

const config = createConfig({
  autoConnect: true,
  publicClient: createPublicClient({
    chain: mainnet,
    transport: http(),
  }),
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiConfig config={config}>
      <Web3AuthContextProvider>
        <App />
      </Web3AuthContextProvider>
    </WagmiConfig>
  </React.StrictMode>
);
