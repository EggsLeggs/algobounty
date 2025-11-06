import { useWallet, WalletId } from '@txnlab/use-wallet-react'
import type { Wallet } from '@txnlab/use-wallet-react'
import { Wallet as WalletIcon, CheckCircle2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Account from './Account'

interface ConnectWalletInterface {
  openModal: boolean
  closeModal: () => void
}

const ConnectWallet = ({ openModal, closeModal }: ConnectWalletInterface) => {
  const { wallets, activeAddress } = useWallet()

  // Detect KMD (LocalNet dev wallet) since it has no icon
  const isKmd = (wallet: Wallet) => wallet.id === WalletId.KMD

  if (!openModal) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeModal()
        }
      }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative z-50 w-full max-w-md mx-4 bg-card border border-border rounded-lg shadow-lg p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WalletIcon className="h-6 w-6 text-primary" />
            <h3 className="text-2xl font-bold text-foreground">
              Select wallet provider
            </h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeModal}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {activeAddress && (
            <>
              <Account />
              <div className="h-px bg-border my-4" />
            </>
          )}

          {!activeAddress &&
            wallets?.map((wallet) => (
              <button
                key={`provider-${wallet.id}`}
                data-test-id={`${wallet.id}-connect`}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-lg transition-all duration-200',
                  'bg-muted hover:bg-muted/80 border border-border',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                  'active:scale-[0.98]'
                )}
                onClick={() => {
                  wallet.connect()
                }}
              >
                {!isKmd(wallet) && wallet.metadata.icon && (
                  <img
                    alt={`wallet_icon_${wallet.id}`}
                    src={wallet.metadata.icon}
                    className="w-8 h-8 object-contain rounded-md"
                  />
                )}
                {isKmd(wallet) && (
                  <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center">
                    <WalletIcon className="h-5 w-5 text-primary" />
                  </div>
                )}
                <span className="font-semibold text-base flex-1 text-left text-foreground">
                  {isKmd(wallet) ? 'LocalNet Wallet' : wallet.metadata.name}
                </span>
                {wallet.isActive && (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                )}
              </button>
            ))}
        </div>

        {/* Footer */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            className="flex-1"
            onClick={closeModal}
            data-test-id="close-wallet-modal"
          >
            Close
          </Button>
          {activeAddress && (
            <Button
              variant="destructive"
              className="flex-1"
              data-test-id="logout"
              onClick={async () => {
                if (wallets) {
                  const activeWallet = wallets.find((w) => w.isActive)
                  if (activeWallet) {
                    await activeWallet.disconnect()
                  } else {
                    localStorage.removeItem('@txnlab/use-wallet:v3')
                    window.location.reload()
                  }
                }
                closeModal()
              }}
            >
              Disconnect
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConnectWallet

