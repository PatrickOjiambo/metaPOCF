import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface WalletAccount {
  publicKey: string;
  balance?: string;
}

interface CasperWalletContextType {
  isConnected: boolean;
  account: WalletAccount | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  signDeploy: (deploy: any) => Promise<string>;
}

const CasperWalletContext = createContext<CasperWalletContextType | undefined>(undefined);

// Timeout (in ms) for requests to the extension [DEFAULT: 30 min]
const REQUESTS_TIMEOUT_MS = 30 * 60 * 1000;

// Helper to get provider instance
const getProvider = () => {
  const providerConstructor = window.CasperWalletProvider;
  if (providerConstructor === undefined) {
    return null;
  }
  return providerConstructor({
    timeout: REQUESTS_TIMEOUT_MS
  });
};

export const useCasperWallet = () => {
  const context = useContext(CasperWalletContext);
  if (!context) {
    throw new Error('useCasperWallet must be used within CasperWalletProvider');
  }
  return context;
};

interface CasperWalletProviderProps {
  children: React.ReactNode;
}

export const CasperWalletProvider: React.FC<CasperWalletProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check for stored session on mount
  useEffect(() => {
    const storedAccount = localStorage.getItem('casper_account');
    if (storedAccount) {
      try {
        const parsedAccount = JSON.parse(storedAccount);
        setAccount(parsedAccount);
        setIsConnected(true);
      } catch (error) {
        console.error('Error parsing stored account:', error);
        localStorage.removeItem('casper_account');
      }
    }
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Get the Casper Wallet provider
      const provider = getProvider();
      
      if (!provider) {
        toast.error('Casper Wallet extension not detected. Please install it from the Chrome Web Store.');
        setIsConnecting(false);
        return;
      }

      // Request connection to the wallet
      const connected = await provider.requestConnection();
      
      if (!connected) {
        toast.error('Could not connect to Casper Wallet. Please try again.');
        setIsConnecting(false);
        return;
      }

      // Get active public key from the wallet
      const activeKey = await provider.getActivePublicKey();
      
      if (!activeKey) {
        toast.error('No active key found. Please unlock your Casper Wallet.');
        setIsConnecting(false);
        return;
      }

      const walletAccount: WalletAccount = {
        publicKey: activeKey,
      };

      setAccount(walletAccount);
      setIsConnected(true);
      
      // Store in localStorage for persistence
      localStorage.setItem('casper_account', JSON.stringify(walletAccount));
      
      toast.success('Wallet connected successfully!');
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast.error(`Failed to connect wallet: ${error.message || 'Unknown error'}`);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    try {
      const provider = getProvider();
      if (provider) {
        // Request disconnection from the wallet
        provider.disconnectFromSite().then((disconnected: boolean) => {
          if (disconnected) {
            setAccount(null);
            setIsConnected(false);
            localStorage.removeItem('casper_account');
            toast.info('Wallet disconnected');
          }
        }).catch((error: any) => {
          console.error('Error disconnecting:', error);
          // Still disconnect locally even if the wallet returns an error
          setAccount(null);
          setIsConnected(false);
          localStorage.removeItem('casper_account');
          toast.info('Wallet disconnected');
        });
      } else {
        // If provider is not available, just disconnect locally
        setAccount(null);
        setIsConnected(false);
        localStorage.removeItem('casper_account');
        toast.info('Wallet disconnected');
      }
    } catch (error) {
      console.error('Error during disconnect:', error);
      // Ensure we disconnect locally even if there's an error
      setAccount(null);
      setIsConnected(false);
      localStorage.removeItem('casper_account');
      toast.info('Wallet disconnected');
    }
  }, []);

  const signDeploy = useCallback(async (deploy: any): Promise<string> => {
    if (!isConnected || !account) {
      throw new Error('Wallet not connected');
    }

    try {
      const provider = getProvider();
      
      if (!provider) {
        throw new Error('Casper Wallet not available');
      }

      // Convert deploy to JSON string
      const deployJson = JSON.stringify(deploy);
      
      // Sign with Casper Wallet using the provider.sign method
      const signedDeployJson = await provider.sign(deployJson, account.publicKey);

      return signedDeployJson;
    } catch (error: any) {
      console.error('Error signing deploy:', error);
      toast.error(`Failed to sign transaction: ${error.message || 'Unknown error'}`);
      throw error;
    }
  }, [isConnected, account]);

  const value: CasperWalletContextType = {
    isConnected,
    account,
    isConnecting,
    connect,
    disconnect,
    signDeploy,
  };

  return (
    <CasperWalletContext.Provider value={value}>
      {children}
    </CasperWalletContext.Provider>
  );
};

// Type declaration for Casper Wallet
declare global {
  interface Window {
    CasperWalletProvider?: (config: { timeout: number }) => {
      requestConnection: () => Promise<boolean>;
      getActivePublicKey: () => Promise<string>;
      sign: (deploy: string, publicKey: string) => Promise<string>;
      disconnectFromSite: () => Promise<boolean>;
      isConnected: () => Promise<boolean>;
    };
    CasperWalletEventTypes?: any;
  }
}
