import { useMemo } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react'
import type { SupportedWallet } from '@txnlab/use-wallet-react'
import { SnackbarProvider } from 'notistack'
import Navigation from '@/components/Navigation'
import HomePage from '@/pages/HomePage'
import FundPage from '@/pages/FundPage'
import { WalletModalProvider } from '@/context/WalletModalContext'
import { getAlgodConfigFromViteEnvironment, getKmdConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'

function App() {
  const algodConfig = getAlgodConfigFromViteEnvironment()

  const supportedWallets: SupportedWallet[] = useMemo(() => {
    if (import.meta.env.VITE_ALGOD_NETWORK === 'localnet') {
      const kmdConfig = getKmdConfigFromViteEnvironment()
      return [
        {
          id: WalletId.KMD,
          options: {
            baseServer: kmdConfig.server,
            token: String(kmdConfig.token),
            port: String(kmdConfig.port),
          },
        },
      ]
    } else {
      // Pera Wallet - mobile-first wallet with robust dApp integration
      // See: https://txnlab.gitbook.io/use-wallet/getting-started/supported-wallets
      return [
        {
          id: WalletId.PERA,
          // Optional configuration available:
          // options: {
          //   shouldShowSignTxnToast?: boolean
          //   chainId?: number // Defaults to active network
          // }
        },
      ]
    }
  }, [])

  const walletManager = useMemo(() => {
    return new WalletManager({
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
  })
  }, [supportedWallets, algodConfig.network, algodConfig.server, algodConfig.port, algodConfig.token])

  return (
    <SnackbarProvider maxSnack={3}>
      <WalletProvider manager={walletManager}>
        <WalletModalProvider>
          <BrowserRouter>
            <Navigation />
            <div className="noise" />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/fund/:owner/:repoName/:repoId/issue/:issueNumber" element={<FundPage />} />
            </Routes>
          </BrowserRouter>
        </WalletModalProvider>
      </WalletProvider>
    </SnackbarProvider>
  )
}

export default App
