import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Wallet, Github, Menu, X } from 'lucide-react'
import { useWallet } from '@txnlab/use-wallet-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import starIcon from '@/assets/star.svg'
import { ellipseAddress } from '@/utils/ellipseAddress'
import { useWalletModal } from '@/context/WalletModalContext'

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { activeAddress } = useWallet()
  const { openModal } = useWalletModal()

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 20)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleWalletConnect = () => {
    openModal()
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

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-lg py-3'
            : 'bg-background/80 backdrop-blur-sm py-4'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Branding */}
            <Link to="/" className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity">
              <img
                src={starIcon}
                alt="AlgoBounty"
                className="h-8 w-8 transition-transform duration-300 hover:rotate-12"
              />
              <span className="text-xl font-bold bg-linear-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
                AlgoBounty
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-3 flex-1 justify-end">
              <Button
                onClick={handleWalletConnect}
                variant="outline"
                className="gap-2 border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all cursor-pointer"
              >
                <Wallet className="h-4 w-4" />
                <span>{activeAddress ? ellipseAddress(activeAddress) : 'Connect Wallet'}</span>
              </Button>
              <Button
                onClick={handleGitHubIntegration}
                variant="outline"
                className="gap-2 border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all cursor-pointer"
              >
                <Github className="h-4 w-4" />
                <span>Add to GitHub</span>
              </Button>
              {/* TODO: Add explore bounties button */}
              {/* <Button
                onClick={handleExploreBounties}
                variant="default"
                className="gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <Search className="h-4 w-4" />
                <span>Explore Bounties</span>
              </Button> */}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="relative z-50 cursor-pointer"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            className={cn(
              'md:hidden fixed inset-x-0 top-16 bg-background/98 backdrop-blur-lg border-b border-border shadow-xl transition-all duration-300 ease-in-out',
              isMobileMenuOpen
                ? 'opacity-100 visible translate-y-0'
                : 'opacity-0 invisible -translate-y-4 pointer-events-none'
            )}
          >
            <div className="px-4 py-6 space-y-3">
              <Button
                onClick={() => {
                  handleWalletConnect()
                  setIsMobileMenuOpen(false)
                }}
                variant="outline"
                className="w-full justify-start gap-2 border-primary/20 hover:bg-primary/10 cursor-pointer"
              >
                <Wallet className="h-4 w-4" />
                <span>{activeAddress ? ellipseAddress(activeAddress) : 'Connect Wallet'}</span>
              </Button>
              <Button
                onClick={() => {
                  handleGitHubIntegration()
                  setIsMobileMenuOpen(false)
                }}
                variant="outline"
                className="w-full justify-start gap-2 border-primary/20 hover:bg-primary/10 cursor-pointer"
              >
                <Github className="h-4 w-4" />
                <span>Add to GitHub</span>
              </Button>
              {/* TODO: Add explore bounties button */}
              {/* <Button
                onClick={() => {
                  handleExploreBounties()
                  setIsMobileMenuOpen(false)
                }}
                variant="default"
                className="w-full justify-start gap-2 shadow-md"
              >
                <Search className="h-4 w-4" />
                <span>Explore Bounties</span>
              </Button> */}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navigation
