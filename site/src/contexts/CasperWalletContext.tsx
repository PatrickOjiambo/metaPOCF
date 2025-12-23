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
      // Check if CasperLabs Signer extension is available
      if (typeof window.casperlabsHelper === 'undefined') {
        toast.error('Casper Signer extension not detected. Please install it from the Chrome Web Store.');
        setIsConnecting(false);
        return;
      }

      // Request connection
      const isConnected = await window.casperlabsHelper.isConnected();
      
      if (!isConnected) {
        await window.casperlabsHelper.requestConnection();
      }

      // Get active public key
      const activeKey = await window.casperlabsHelper.getActivePublicKey();
      
      if (!activeKey) {
        toast.error('No active key found. Please unlock your Casper Signer.');
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
    setAccount(null);
    setIsConnected(false);
    localStorage.removeItem('casper_account');
    toast.info('Wallet disconnected');
  }, []);

  const signDeploy = useCallback(async (deploy: any): Promise<string> => {
    if (!isConnected || !account) {
      throw new Error('Wallet not connected');
    }

    try {
      if (!window.casperlabsHelper) {
        throw new Error('Casper Signer not available');
      }

      // Convert deploy to JSON (would use DeployUtil in production)
      const deployJson = JSON.stringify(deploy);
      
      // Sign with Casper Signer
      const signedDeployJson = await window.casperlabsHelper.sign(
        deployJson,
        account.publicKey
      );

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

// Type declaration for Casper Signer
declare global {
  interface Window {
    casperlabsHelper?: {
      isConnected: () => Promise<boolean>;
      requestConnection: () => Promise<void>;
      getActivePublicKey: () => Promise<string>;
      sign: (deploy: any, publicKey: string) => Promise<string>;
      disconnectFromSite: () => Promise<void>;
    };
  }
}
