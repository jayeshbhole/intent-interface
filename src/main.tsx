import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Web3AuthContextProvider } from "./Web3AuthContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Web3AuthContextProvider>
      <App />
    </Web3AuthContextProvider>
  </React.StrictMode>
);
