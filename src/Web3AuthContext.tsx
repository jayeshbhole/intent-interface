import { createContext } from "react";
import { CHAIN_NAMESPACES, IProvider, WALLET_ADAPTERS } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { useEffect, useState } from "react";
import RPC from "./ethersRPC";

interface Web3AuthContextType {
  web3auth: Web3AuthNoModal | null;
  provider: IProvider | null;
  loggedIn: boolean | null;
  login: () => void;
  logout: () => void;
  getChainId: () => unknown;
  getAccounts: () => unknown;
  getBalance: () => unknown;
  sendTransaction: () => void;
  signMessage: () => void;
  getPrivateKey: () => unknown;
  authenticateUser: () => void;
  getUserInfo: () => void;
}
const Web3AuthContext = createContext<Web3AuthContextType>({
  web3auth: null as Web3AuthNoModal | null,
  provider: null as IProvider | null,
  loggedIn: false,
  login: () => {},
  logout: () => {},
  sendTransaction: () => {},
  signMessage: () => {},
  authenticateUser: () => {},
  getUserInfo: () => {},
  getChainId: () => "",
  getAccounts: () => "",
  getBalance: () => "",
  getPrivateKey: () => "",
});

const clientId = "BEglQSgt4cUWcj6SKRdu5QkOXTsePmMcusG5EAoyjyOYKlVRjIF1iCNnMOTfpzCiunHRrMui8TIwQPXdkQ8Yxuk"; // get from https://dashboard.web3auth.io

export const Web3AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [web3auth, setWeb3auth] = useState<Web3AuthNoModal | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(false);

  useEffect(() => {
    const init = async () => {
      try {
        const chainConfig = {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: "0x1",
          rpcTarget: "https://rpc.ankr.com/eth",
          displayName: "Ethereum Mainnet",
          blockExplorer: "https://goerli.etherscan.io",
          ticker: "ETH",
          tickerName: "Ethereum",
        };

        // eslint-disable-next-line @typescript-eslint/no-shadow
        const web3auth = new Web3AuthNoModal({
          clientId,
          chainConfig,
          web3AuthNetwork: "cyan",
        });

        const privateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig } });

        const openloginAdapter = new OpenloginAdapter({
          adapterSettings: {
            whiteLabel: {
              appName: "Your app Name",
              logoLight: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
              logoDark: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
              defaultLanguage: "en",
              mode: "dark", // whether to enable dark mode. defaultValue: false
            },
          },
          privateKeyProvider,
        });
        web3auth.configureAdapter(openloginAdapter);

        await web3auth.init();
        setWeb3auth(web3auth);
        setProvider(web3auth.provider);

        if (web3auth.connected) {
          setLoggedIn(true);
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  //   function console.log(...args: unknown[]): void {
  //     // const el = document.querySelector("#console>p");
  //     // if (el) {
  //     //   el.innerHTML = JSON.stringify(args || {}, null, 2);
  //     // }
  //   }

  const login = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
      loginProvider: "google",
    });
    setProvider(web3authProvider);
    setLoggedIn(true);
    console.log("Logged in Successfully!");
  };

  const authenticateUser = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const idToken = await web3auth.authenticateUser();
    console.log(idToken);
  };

  const getUserInfo = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const user = await web3auth.getUserInfo();
    console.log(user);
  };

  const logout = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
    setLoggedIn(false);
  };

  const getChainId = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const chainId = await rpc.getChainId();
    console.log(chainId);
    return chainId;
  };
  const getAccounts = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const address = await rpc.getAccounts();
    console.log(address);
    return address;
  };

  const getBalance = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const balance = await rpc.getBalance();
    console.log(balance);
  };

  const sendTransaction = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const receipt = await rpc.sendTransaction();
    console.log(receipt);
  };

  const signMessage = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const signedMessage = await rpc.signMessage();
    console.log(signedMessage);
  };

  const getPrivateKey = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const privateKey = await rpc.getPrivateKey();
    console.log(privateKey);
  };

  return (
    <Web3AuthContext.Provider
      value={{
        web3auth,
        provider,
        loggedIn,
        login,
        logout,
        getChainId,
        getAccounts,
        getBalance,
        sendTransaction,
        signMessage,
        getPrivateKey,
        authenticateUser,
        getUserInfo,
      }}
    >
      {children}
    </Web3AuthContext.Provider>
  );
};

export default Web3AuthContext;
