'use client';

import { ReactNode, useMemo } from 'react';
import { SupportedWallet, WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react';

interface AlgoBountyWalletProviderProps {
  children: ReactNode;
}

export function AlgoBountyWalletProvider({ children }: AlgoBountyWalletProviderProps) {
  const algodConfig = useMemo(() => ({
    network: 'localnet' as const,
    server: process.env.NEXT_PUBLIC_ALGOD_SERVER || 'http://localhost',
    port: process.env.NEXT_PUBLIC_ALGOD_PORT || '4001',
    token: process.env.NEXT_PUBLIC_ALGOD_TOKEN || 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  }), []);

  const supportedWallets: SupportedWallet[] = useMemo(() => [
    {
      id: WalletId.PERA,
      name: 'Pera Wallet',
      icon: 'https://perawallet.app/favicon.ico',
    },
    {
      id: WalletId.DEFLY,
      name: 'Defly Wallet',
      icon: 'https://defly.app/favicon.ico',
    },
    {
      id: WalletId.LUTE,
      name: 'Lute Wallet',
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjMDA3Q0ZGIi8+Cjwvc3ZnPgo=',
    },
    {
      id: WalletId.KMD,
      name: 'LocalNet Wallet',
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjMDA3Q0ZGIi8+Cjwvc3ZnPgo=',
    }
  ], []);

  const walletManager = useMemo(() => new WalletManager({
    wallets: supportedWallets,
    defaultNetwork: algodConfig.network,
    networks: {
      [algodConfig.network]: {
        algod: {
          baseServer: algodConfig.server,
          port: algodConfig.port,
          token: String(algodConfig.token),
        },
      },
    },
    options: {
      resetNetwork: true,
    },
  }), [supportedWallets, algodConfig]);

  return (
    <WalletProvider manager={walletManager}>
      {children}
    </WalletProvider>
  );
}
