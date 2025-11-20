import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import ConnectWallet from '@/components/ConnectWallet'

interface WalletModalContextValue {
  openModal: () => void
  closeModal: () => void
}

const WalletModalContext = createContext<WalletModalContextValue | undefined>(undefined)

export const WalletModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = useCallback(() => setIsOpen(true), [])
  const closeModal = useCallback(() => setIsOpen(false), [])

  return (
    <WalletModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <ConnectWallet openModal={isOpen} closeModal={closeModal} />
    </WalletModalContext.Provider>
  )
}

export const useWalletModal = () => {
  const context = useContext(WalletModalContext)

  if (!context) {
    throw new Error('useWalletModal must be used within a WalletModalProvider')
  }

  return context
}


