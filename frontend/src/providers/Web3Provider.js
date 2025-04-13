import { useState, useEffect, createContext } from 'react';
import { useWeb3React } from '@web3-react/core';

export const Web3Context = createContext();

export default function Web3Provider({ children }) {
  const { library, account, active, activate, deactivate } = useWeb3React();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, [account]);

  return (
    <Web3Context.Provider value={{
      web3: library,
      account,
      isActive: active,
      activateWallet: activate,
      deactivateWallet: deactivate,
      isLoading
    }}>
      {children}
    </Web3Context.Provider>
  );
}