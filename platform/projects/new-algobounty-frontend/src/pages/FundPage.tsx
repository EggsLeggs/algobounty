import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, AlertCircle, Github } from 'lucide-react'
import IssueDisplay from '@/components/IssueDisplay'
import DonationForm from '@/components/DonationForm'
import { cn } from '@/lib/utils'

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

const FundPage = () => {
  const { owner, repoName, repoId, issueNumber } = useParams<{
    owner: string
    repoName: string
    repoId: string
    issueNumber: string
  }>()
  const navigate = useNavigate()

  const [issue, setIssue] = useState<GitHubIssue | null>(null)
  const [repository, setRepository] = useState<Repository | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalFunded, setTotalFunded] = useState(0)

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

        // TODO: Fetch total funded from backend API
        // For now, using placeholder
        // const fundedResponse = await fetch(
        //   `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/bounties?repoId=${repoId}&issueNumber=${issueNumber}`
        // )
        // if (fundedResponse.ok) {
        //   const fundedData = await fundedResponse.json()
        //   setTotalFunded(fundedData.totalFunded || 0)
        // }
      } catch (err) {
        console.error('Error fetching issue:', err)
        setError('Failed to fetch issue data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchIssueData()
  }, [owner, repoName, repoId, issueNumber])

  const handleDonate = (amount: number, currency: 'ALGO' | 'USDC') => {
    // TODO: Implement donation logic
    console.log('Donate:', amount, currency)
    // This will connect to smart contract or backend API
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

  return (
    <div className="min-h-screen pt-28 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Issue Details */}
          <div className="lg:col-span-2 space-y-6">
            <IssueDisplay issue={issue} repository={repository} />
          </div>

          {/* Right Column - Donation Form */}
          <div className="lg:col-span-1 space-y-6">
            <DonationForm totalFunded={totalFunded} onDonate={handleDonate} />
            
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
  )
}

export default FundPage

