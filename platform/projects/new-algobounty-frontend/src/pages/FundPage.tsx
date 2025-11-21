import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, AlertCircle, Github, ShieldCheck, Lock } from 'lucide-react'
import IssueDisplay from '@/components/IssueDisplay'
import DonationForm, { type Currency } from '@/components/DonationForm'
import GitHubLinkModal from '@/components/GitHubLinkModal'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useWalletModal } from '@/context/WalletModalContext'
import { Button } from '@/components/ui/button'
import {
  buildBountyKey,
  claimBountyOnChain,
  fundBountyOnChain,
  microAlgosToAlgos,
  isDemoModeEnabled,
  fundBountyDemo,
  fetchBountyStateDemo,
  claimBountyDemo,
  type DemoBountyState,
} from '@/utils/bountyHelpers'
import { getAlgodConfigFromViteEnvironment } from '@/utils/network/getAlgoClientConfigs'
import algosdk from 'algosdk'

interface GitHubIssue {
  title: string
  body: string | null
  number: number
  state: string
  html_url: string
  user: {
    login: string
    avatar_url: string
    html_url: string
  }
  labels: Array<{
    name: string
    color: string
  }>
  created_at: string
  updated_at: string
}

interface Repository {
  full_name: string
  html_url: string
}

interface BountyState {
  key: string
  totalFundedMicroAlgos: string
  totalClaimedMicroAlgos: string
  isClosed: boolean
  isClaimed: boolean
  authorizedClaimer: string | null
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const FundPage = () => {
  const { owner, repoName, repoId: _repoId, issueNumber } = useParams<{
    owner: string
    repoName: string
    repoId: string
    issueNumber: string
  }>()
  const navigate = useNavigate()
  const isDemoMode = isDemoModeEnabled

  const [issue, setIssue] = useState<GitHubIssue | null>(null)
  const [repository, setRepository] = useState<Repository | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bountyState, setBountyState] = useState<BountyState | null>(null)
  const [bountyLoading, setBountyLoading] = useState(true)
  const [funding, setFunding] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [githubModalOpen, setGithubModalOpen] = useState(false)
  const [isGithubLinked, setIsGithubLinked] = useState(false)
  const [checkingGithubLink, setCheckingGithubLink] = useState(false)
  const [demoGithubUsername, setDemoGithubUsername] = useState<string | null>(null)
  const { activeAddress, signTransactions } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const { openModal } = useWalletModal()

  const bountyKey = useMemo(() => {
    if (!owner || !repoName || !issueNumber) {
      return ''
    }
    return buildBountyKey(owner, repoName, issueNumber)
  }, [owner, repoName, issueNumber])

  const convertDemoState = useCallback(
    (state: DemoBountyState): BountyState => ({
      key: state.bountyKey,
      totalFundedMicroAlgos: state.totalFundedMicroAlgos.toString(),
      totalClaimedMicroAlgos: state.totalClaimedMicroAlgos.toString(),
      isClosed: state.isClosed,
      isClaimed: state.isClaimed,
      authorizedClaimer: state.authorizedClaimer,
    }),
    []
  )

  const fetchBountyState = useCallback(async () => {
    if (!owner || !repoName || !issueNumber) {
      return
    }
    setBountyLoading(true)
    try {
      if (isDemoMode) {
        const data = await fetchBountyStateDemo(owner, repoName, issueNumber)
        setBountyState(convertDemoState(data))
      } else {
        const response = await fetch(
          `${API_BASE_URL}/api/bounties/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/${encodeURIComponent(issueNumber)}`,
        )
        if (!response.ok) {
          throw new Error('Failed to load on-chain bounty state')
        }
        const data: BountyState = await response.json()
        setBountyState(data)
      }
    } catch (err) {
      console.error('Error fetching bounty state:', err)
      setBountyState(null)
    } finally {
      setBountyLoading(false)
    }
  }, [convertDemoState, isDemoMode, owner, repoName, issueNumber])

  useEffect(() => {
    const fetchIssueData = async () => {
      if (!owner || !repoName || !issueNumber) {
        setError('Missing required parameters')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Fetch issue from GitHub API
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repoName}/issues/${issueNumber}`,
          {
            headers: {
              Accept: 'application/vnd.github.v3+json',
              'User-Agent': 'AlgoBounty/1.0',
            },
          }
        )

        if (!response.ok) {
          if (response.status === 404) {
            setError('Issue not found or repository is private')
          } else if (response.status === 403) {
            setError('GitHub API rate limit exceeded. Please try again later.')
          } else {
            setError('Failed to fetch issue data')
          }
          setLoading(false)
          return
        }

        const issueData = await response.json()

        // Check if it's actually a pull request
        if (issueData.pull_request) {
          setError('This is a pull request, not an issue')
          setLoading(false)
          return
        }

        setIssue(issueData)
        setRepository({
          full_name: `${owner}/${repoName}`,
          html_url: `https://github.com/${owner}/${repoName}`,
        })
      } catch (err) {
        console.error('Error fetching issue:', err)
        setError('Failed to fetch issue data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchIssueData()
  }, [owner, repoName, issueNumber])

  useEffect(() => {
    void fetchBountyState()
  }, [fetchBountyState])

  const fetchWalletBalance = useCallback(async () => {
    if (!activeAddress) {
      setWalletBalance(null)
      return
    }

    setBalanceLoading(true)
    try {
      const algodConfig = getAlgodConfigFromViteEnvironment()
      const algodClient = new algosdk.Algodv2(
        String(algodConfig.token),
        algodConfig.server,
        String(algodConfig.port)
      )

      const accountInfo = await algodClient.accountInformation(activeAddress).do()
      const balanceInAlgos = microAlgosToAlgos(accountInfo.amount)
      setWalletBalance(balanceInAlgos)
    } catch (err) {
      console.error('Error fetching wallet balance:', err)
      setWalletBalance(null)
    } finally {
      setBalanceLoading(false)
    }
  }, [activeAddress])

  useEffect(() => {
    void fetchWalletBalance()
  }, [fetchWalletBalance])

  const checkDemoLinkStatus = useCallback(async () => {
    if (!isDemoMode) {
      return
    }
    if (!activeAddress) {
      setIsGithubLinked(false)
      setDemoGithubUsername(null)
      return
    }

    setCheckingGithubLink(true)
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/demo/attestations/check/${encodeURIComponent(activeAddress)}`
      )
      if (!response.ok) {
        throw new Error('Failed to check GitHub link status')
      }
      const data = await response.json()
      setIsGithubLinked(Boolean(data.linked))
      setDemoGithubUsername(data.linked ? data.githubUsername ?? null : null)
    } catch (err) {
      console.error('Error checking GitHub link status:', err)
      setIsGithubLinked(false)
      setDemoGithubUsername(null)
    } finally {
      setCheckingGithubLink(false)
    }
  }, [activeAddress, isDemoMode])

  useEffect(() => {
    if (isDemoMode) {
      void checkDemoLinkStatus()
    }
  }, [checkDemoLinkStatus, isDemoMode])

  const handleDonate = async (amount: number, currency: Currency) => {
    if (currency !== 'ALGO') {
      enqueueSnackbar('Only ALGO donations are supported right now', { variant: 'warning' })
      throw new Error('Unsupported currency')
    }
    if (!owner || !repoName || !issueNumber) {
      enqueueSnackbar('Missing repository context', { variant: 'error' })
      throw new Error('Missing repository context')
    }
    if (!bountyKey) {
      enqueueSnackbar('Missing bounty identifier', { variant: 'error' })
      throw new Error('Invalid bounty key')
    }
    if (!activeAddress) {
      openModal()
      enqueueSnackbar('Connect your wallet to donate', { variant: 'warning' })
      throw new Error('Wallet not connected')
    }
    if (!isDemoMode && !signTransactions) {
      openModal()
      enqueueSnackbar('Connect your wallet to donate', { variant: 'warning' })
      throw new Error('Wallet not connected')
    }

    setFunding(true)
    try {
      if (isDemoMode) {
        const updatedState = await fundBountyDemo({
          owner,
          repo: repoName,
          issueNumber,
          amountAlgos: amount,
          funderAddress: activeAddress,
        })
        setBountyState(convertDemoState(updatedState))
        enqueueSnackbar('Donation recorded in demo mode 🎉', { variant: 'success' })
      } else {
        await fundBountyOnChain({
          bountyKey,
          amountAlgos: amount,
          sender: activeAddress,
          signTransactions,
        })
        enqueueSnackbar('Donation submitted on Algorand 🎉', { variant: 'success' })
      }
      await fetchBountyState()
      await fetchWalletBalance()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fund this bounty'
      enqueueSnackbar(message, { variant: 'error' })
      throw err
    } finally {
      setFunding(false)
    }
  }

  const handleClaim = async () => {
    if (!owner || !repoName || !issueNumber) {
      enqueueSnackbar('Missing repository context', { variant: 'error' })
      return
    }
    if (!bountyKey) {
      enqueueSnackbar('Missing bounty identifier', { variant: 'error' })
      return
    }
    if (!activeAddress) {
      openModal()
      enqueueSnackbar('Connect your wallet to claim', { variant: 'warning' })
      return
    }
    if (!bountyState?.isClosed || bountyState.isClaimed) {
      enqueueSnackbar('This bounty is not claimable yet', { variant: 'info' })
      return
    }

    if (isDemoMode) {
      if (!isGithubLinked) {
        enqueueSnackbar('Link your GitHub account before claiming', { variant: 'info' })
        setGithubModalOpen(true)
        return
      }
      setClaiming(true)
      try {
        const response = await claimBountyDemo({
          owner,
          repo: repoName,
          issueNumber,
          claimerAddress: activeAddress,
        })
        enqueueSnackbar(response.message || 'Claim recorded in demo mode 🎉', { variant: 'success' })
        await fetchBountyState()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to claim this bounty'
        enqueueSnackbar(message, { variant: 'error' })
      } finally {
        setClaiming(false)
      }
      return
    }

    if (!signTransactions) {
      openModal()
      enqueueSnackbar('Connect your wallet to claim', { variant: 'warning' })
      return
    }

    setClaiming(true)
    try {
      await claimBountyOnChain({
        bountyKey,
        sender: activeAddress,
        recipient: activeAddress,
        signTransactions,
      })
      enqueueSnackbar('Bounty claimed successfully 🎉', { variant: 'success' })
      await fetchBountyState()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to claim this bounty'
      enqueueSnackbar(message, { variant: 'error' })
    } finally {
      setClaiming(false)
    }
  }

  const handleGitHubIntegration = () => {
    // Get GitHub app installation URL from environment variables
    const installUrl = import.meta.env.VITE_GITHUB_APP_INSTALL_URL

    if (installUrl && installUrl !== '#') {
      // Open GitHub app installation page in new tab
      window.open(installUrl, '_blank', 'noopener,noreferrer')
    } else {
      // Fallback: show alert if URL is not configured
      alert('GitHub app installation URL is not configured. Please check your environment variables.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-28">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-foreground/70">Loading issue data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-28 px-4">
        <div className="max-w-2xl w-full bg-background/50 backdrop-blur-sm rounded-3xl p-8 border-2 border-destructive/20">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <h2 className="text-2xl font-bold text-foreground">Error</h2>
          </div>
          <p className="text-foreground/80 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  if (!issue || !repository) {
    return null
  }

  const totalFunded = microAlgosToAlgos(bountyState?.totalFundedMicroAlgos ?? '0')
  const totalClaimed = microAlgosToAlgos(bountyState?.totalClaimedMicroAlgos ?? '0')
  const isClaimable = Boolean(bountyState?.isClosed && !bountyState?.isClaimed)
  const authorizedClaimer = bountyState?.authorizedClaimer

  return (
    <>
      <div className="min-h-screen pt-28 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Issue Details */}
            <div className="lg:col-span-2 space-y-6">
              <IssueDisplay issue={issue} repository={repository} />
            </div>

            {/* Right Column - Donation Form */}
            <div className="lg:col-span-1 space-y-6">
              <DonationForm
                totalFunded={totalFunded}
                onDonate={handleDonate}
                isFunding={funding}
                walletBalance={walletBalance}
                balanceLoading={balanceLoading}
                demoMode={isDemoMode}
                demoIsClosed={Boolean(bountyState?.isClosed)}
              />

              <div className="bg-background/50 backdrop-blur-sm rounded-3xl p-6 border-2 border-foreground/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground/60">Bounty Status</p>
                    <p className="text-2xl font-bold text-foreground">
                      {bountyLoading ? (
                        <span className="flex items-center gap-2 text-sm font-medium text-foreground/70">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Syncing…
                        </span>
                      ) : bountyState?.isClaimed ? (
                        'Claimed'
                      ) : bountyState?.isClosed ? (
                        'Closed'
                      ) : (
                        'Open'
                      )}
                    </p>
                  </div>
                  {bountyState?.isClaimed ? (
                    <ShieldCheck className="h-10 w-10 text-emerald-500" />
                  ) : bountyState?.isClosed ? (
                    <Lock className="h-10 w-10 text-amber-500" />
                  ) : (
                    <Github className="h-10 w-10 text-primary" />
                  )}
                </div>

              <div className="space-y-1 text-sm font-mono tabular-nums">
                <p className="flex justify-between text-foreground/70">
                  <span>Total Funded</span>
                  <span>{totalFunded.toLocaleString(undefined, { maximumFractionDigits: 3 })} ALGO</span>
                </p>
                <p className="flex justify-between text-foreground/70">
                  <span>Total Claimed</span>
                  <span>{totalClaimed.toLocaleString(undefined, { maximumFractionDigits: 3 })} ALGO</span>
                </p>
              </div>

              {authorizedClaimer && (
                <div className="text-xs text-foreground/60 break-all">
                  Authorized claimer: <span className="font-mono">{authorizedClaimer}</span>
                </div>
              )}

                {isDemoMode && (
                  <div className="rounded-2xl border border-foreground/20 bg-background/40 p-3 text-sm text-foreground/70 space-y-1">
                    <p className="font-semibold text-foreground">Demo Mode</p>
                    <p>
                      {isGithubLinked
                        ? demoGithubUsername
                          ? `Linked to GitHub user @${demoGithubUsername}`
                          : 'GitHub account linked'
                        : 'Link your GitHub account before claiming this bounty.'}
                    </p>
                    {checkingGithubLink && (
                      <p className="text-xs text-foreground/60">Checking link status…</p>
                    )}
                  </div>
                )}

                <Button
                  className="w-full gap-2"
                  onClick={handleClaim}
                  disabled={!isClaimable || claiming || bountyLoading}
                >
                  {claiming ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  {isClaimable ? (claiming ? 'Claiming...' : isDemoMode ? 'Claim (Demo)' : 'Claim Bounty') : 'Waiting for closure'}
                </Button>

                {!bountyState?.isClosed && (
                  <p className="text-xs text-foreground/60">
                    Claims become available automatically once GitHub marks the issue as closed.
                  </p>
                )}
              </div>

              {/* Enable AlgoBounty Card */}
              <div className="bg-background/30 backdrop-blur-sm rounded-2xl p-5 border border-foreground/10 hover:border-foreground/20 transition-colors">
                <p className="text-sm text-foreground/60 mb-3 leading-relaxed">
                  Enable AlgoBounty on your own repos to start accepting bounties.
                </p>
                <button
                  onClick={handleGitHubIntegration}
                  className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors group cursor-pointer"
                >
                  <Github className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>Add to GitHub</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <GitHubLinkModal
        open={githubModalOpen}
        algorandAddress={activeAddress ?? null}
        onClose={() => setGithubModalOpen(false)}
        onLinked={() => {
          enqueueSnackbar('GitHub linked successfully!', { variant: 'success' })
          void checkDemoLinkStatus()
        }}
      />
    </>
  )
}

export default FundPage

