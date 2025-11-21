import { useCallback, useEffect, useMemo, useState } from 'react'
import { Github, X, Wallet, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface GitHubLinkModalProps {
  open: boolean
  algorandAddress: string | null
  onClose: () => void
  onLinked: () => void
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const POLL_INTERVAL_MS = 3000
const POLL_TIMEOUT_MS = 2 * 60 * 1000

const GitHubLinkModal = ({ open, algorandAddress, onClose, onLinked }: GitHubLinkModalProps) => {
  const [isStartingLink, setIsStartingLink] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pollStartedAt, setPollStartedAt] = useState<number | null>(null)

  useEffect(() => {
    if (!open) {
      setIsStartingLink(false)
      setIsPolling(false)
      setError(null)
      setPollStartedAt(null)
    }
  }, [open])

  const hasAddress = useMemo(() => Boolean(algorandAddress), [algorandAddress])

  const checkLinkStatus = useCallback(async () => {
    if (!algorandAddress) {
      return false
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/demo/attestations/check/${encodeURIComponent(algorandAddress)}`
      )
      if (!response.ok) {
        console.error('Failed to check attestation status')
        return false
      }
      const data = (await response.json()) as { linked: boolean }
      return data.linked
    } catch (err) {
      console.error('Error checking attestation status', err)
      return false
    }
  }, [algorandAddress])

  useEffect(() => {
    if (!open || !isPolling) {
      return
    }

    let cancelled = false
    const intervalId = window.setInterval(async () => {
      if (cancelled) return
      const linked = await checkLinkStatus()
      if (linked) {
        window.clearInterval(intervalId)
        window.clearTimeout(timeoutId)
        setIsPolling(false)
        onLinked()
        onClose()
      }
    }, POLL_INTERVAL_MS)

    const timeoutId = window.setTimeout(() => {
      setIsPolling(false)
      window.clearInterval(intervalId)
      setError('Linking timed out. Please try again.')
    }, POLL_TIMEOUT_MS)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
      window.clearTimeout(timeoutId)
    }
  }, [checkLinkStatus, isPolling, onClose, onLinked, open])

  const handleStartLink = async () => {
    if (!algorandAddress) {
      setError('Connect your wallet before linking GitHub')
      return
    }

    setError(null)
    setIsStartingLink(true)
    try {
      const startResponse = await fetch(`${API_BASE_URL}/api/demo/attestations/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ algorandAddress }),
      })

      if (!startResponse.ok) {
        const data = await startResponse.json()
        throw new Error(data.error || 'Failed to initiate GitHub linking')
      }

      const { state } = (await startResponse.json()) as { state: string }
      const authResponse = await fetch(
        `${API_BASE_URL}/api/auth/github?state=${encodeURIComponent(state)}`
      )
      if (!authResponse.ok) {
        throw new Error('Failed to get GitHub OAuth URL')
      }
      const { authUrl } = (await authResponse.json()) as { authUrl: string }
      window.open(authUrl, '_blank', 'noopener,noreferrer')
      setPollStartedAt(Date.now())
      setIsPolling(true)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Failed to start GitHub linking')
    } finally {
      setIsStartingLink(false)
    }
  }

  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isStartingLink) {
          onClose()
        }
      }}
    >
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />

      <div className="relative z-50 w-full max-w-lg mx-4 bg-card border border-border rounded-2xl shadow-xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Github className="h-6 w-6 text-primary" />
            <h3 className="text-2xl font-bold text-foreground">Link GitHub Account</h3>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4 text-foreground/80">
          <p>
            Link your GitHub identity to your Algorand wallet so we can verify who&apos;s claiming this
            bounty. In demo mode this creates a verifiable attestation stored off-chain.
          </p>
          <div
            className={cn(
              'flex items-center gap-3 rounded-xl border p-4',
              hasAddress ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-destructive/40 bg-destructive/5'
            )}
          >
            <Wallet className="h-5 w-5" />
            {hasAddress ? (
              <div className="flex-1">
                <p className="text-sm text-foreground/60">Wallet connected</p>
                <p className="font-mono text-sm break-all">{algorandAddress}</p>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-destructive">Connect a wallet to continue</p>
                <p className="text-sm">Funding & claiming require a wallet address.</p>
              </div>
            )}
            {hasAddress && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {isPolling && pollStartedAt && (
            <p className="text-sm text-primary">
              Waiting for GitHub confirmation... You can close the GitHub tab once you finish the OAuth
              flow.
            </p>
          )}
          <div className="rounded-xl border border-border/40 bg-background/60 p-3 space-y-1 text-sm text-foreground/70">
            <p className="text-xs uppercase font-semibold text-foreground/60">What happens next</p>
            <p>1. A GitHub OAuth window opens so you can authorize AlgoBounty.</p>
            <p>2. The backend signs an attestation linking your wallet to your GitHub account.</p>
            <p>3. The attestation is stored (off-chain in this demo) so the claim button can unlock.</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={isStartingLink}>
            Cancel
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={handleStartLink}
            disabled={!hasAddress || isStartingLink}
          >
            {isStartingLink ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Starting OAuth...
              </>
            ) : (
              <>
                <Github className="h-4 w-4" />
                Connect GitHub
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default GitHubLinkModal

