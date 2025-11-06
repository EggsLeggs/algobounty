import { useMemo } from 'react'
import { WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react'
import type { SupportedWallet } from '@txnlab/use-wallet-react'
import { SnackbarProvider } from 'notistack'
import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import SustainabilitySection from '@/components/SustainabilitySection'
import { getAlgodConfigFromViteEnvironment, getKmdConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'

let supportedWallets: SupportedWallet[]
if (import.meta.env.VITE_ALGOD_NETWORK === 'localnet') {
  const kmdConfig = getKmdConfigFromViteEnvironment()
  supportedWallets = [
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
  supportedWallets = [
    { id: WalletId.DEFLY },
    { id: WalletId.PERA },
    { id: WalletId.EXODUS },
    // If you are interested in WalletConnect v2 provider
    // refer to https://github.com/TxnLab/use-wallet for detailed integration instructions
  ]
}

function App() {
  const algodConfig = getAlgodConfigFromViteEnvironment()

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
  }, [algodConfig.network, algodConfig.server, algodConfig.port, algodConfig.token])

  return (
    <SnackbarProvider maxSnack={3}>
      <WalletProvider manager={walletManager}>
        <Navigation />
        <div className="noise" />
        <Hero />
        <HowItWorks />
        <SustainabilitySection />
      </WalletProvider>
    </SnackbarProvider>
  )
}

export default App
