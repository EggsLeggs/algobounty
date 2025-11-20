import { useState } from 'react'
import { Wallet, Copy, Check, Loader2 } from 'lucide-react'
import { useWallet } from '@txnlab/use-wallet-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSnackbar } from 'notistack'
import { useWalletModal } from '@/context/WalletModalContext'

export type Currency = 'ALGO' | 'USDC'

interface DonationFormProps {
  totalFunded: number
  onDonate?: (amount: number, currency: Currency) => Promise<void> | void
  isFunding?: boolean
}

const DonationForm = ({ totalFunded, onDonate, isFunding = false }: DonationFormProps) => {
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<Currency>('ALGO')
  const [copied, setCopied] = useState(false)
  const { activeAddress } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const { openModal } = useWalletModal()

  const platformFeePercent = 5
  const numericAmount = parseFloat(amount) || 0
  const platformFee = numericAmount * (platformFeePercent / 100)
  const netAmount = numericAmount - platformFee

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      enqueueSnackbar('Link copied to clipboard!', { variant: 'success' })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      enqueueSnackbar('Failed to copy link', { variant: 'error' })
    }
  }

  const handleDonate = async () => {
    if (!activeAddress) {
      openModal()
      enqueueSnackbar('Please connect your wallet first', { variant: 'warning' })
      return
    }
    if (numericAmount <= 0) {
      enqueueSnackbar('Please enter a valid amount', { variant: 'warning' })
      return
    }
    try {
      await onDonate?.(numericAmount, currency)
      setAmount('')
    } catch {
      // Parent handles errors/toasts; keep input for user to retry.
    }
  }

  const isDonateDisabled = (!!activeAddress && numericAmount <= 0) || isFunding

  return (
    <div className="space-y-6">
      {/* Total Funded Display */}
      <div className="bg-background/50 backdrop-blur-sm rounded-3xl p-8 border-2 border-foreground/20">
        <div className="text-center">
          <p className="text-sm font-medium text-foreground/60 mb-2">Total Funded</p>
          <p className="text-4xl md:text-5xl font-bold text-foreground mb-2 wonky-text">
            <span className="font-mono tabular-nums">{totalFunded.toLocaleString()}</span> ALGO
          </p>
          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
            className="mt-4 gap-2 border-primary/20 hover:bg-primary/10 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Share</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Donation Form */}
      <div className="bg-background/50 backdrop-blur-sm rounded-3xl p-8 border-2 border-foreground/20">
        <h2 className="text-2xl font-bold text-foreground mb-6 wonky-text">Fund This Bounty</h2>

        {/* Currency Selector */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setCurrency('ALGO')}
            className={cn(
              'flex-1 px-6 py-3 rounded-xl font-medium transition-all border-2 cursor-pointer',
              currency === 'ALGO'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background/30 text-foreground/60 border-foreground/20 hover:border-foreground/40'
            )}
          >
            ALGO
          </button>
          <button
            onClick={() => setCurrency('USDC')}
            disabled
            className={cn(
              'flex-1 px-6 py-3 rounded-xl font-medium transition-all border-2 cursor-not-allowed opacity-50',
              'bg-background/30 text-foreground/60 border-foreground/20'
            )}
          >
            USDC
          </button>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Amount ({currency})
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.1"
            className="w-full px-4 py-3 rounded-xl bg-background/30 border-2 border-foreground/20 focus:border-primary focus:outline-none text-foreground placeholder:text-foreground/40 font-mono tabular-nums"
          />
        </div>

        {/* Fee Breakdown */}
        {numericAmount > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-foreground/5 border border-foreground/10 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-foreground/70">Amount</span>
              <span className="text-foreground font-medium font-mono tabular-nums">{numericAmount.toFixed(2)} {currency}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-foreground/70">Platform Fee ({platformFeePercent}%)</span>
              <span className="text-foreground font-medium font-mono tabular-nums">{platformFee.toFixed(2)} {currency}</span>
            </div>
            <div className="pt-2 border-t border-foreground/20 flex justify-between">
              <span className="text-foreground font-medium">Net Amount</span>
              <span className="text-foreground font-bold font-mono tabular-nums">{netAmount.toFixed(2)} {currency}</span>
            </div>
          </div>
        )}

        {/* Donate Button */}
        <Button
          onClick={handleDonate}
          className={cn(
            'w-full py-6 text-lg font-semibold gap-2',
            !isDonateDisabled ? 'cursor-pointer' : ''
          )}
          disabled={isDonateDisabled}
        >
          {isFunding ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wallet className="h-5 w-5" />}
          {activeAddress ? (isFunding ? 'Processing...' : 'Donate') : 'Connect Wallet to Donate'}
        </Button>
      </div>
    </div>
  )
}

export default DonationForm

