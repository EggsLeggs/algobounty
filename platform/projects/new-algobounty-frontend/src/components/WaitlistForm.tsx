import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useSnackbar } from 'notistack'
import { Loader2, Check, Github } from 'lucide-react'
import { cn } from '@/lib/utils'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const WaitlistForm = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !email.trim()) {
      enqueueSnackbar('Please fill in all fields', { variant: 'warning' })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/waitlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit form')
      }

      // Success
      setIsSuccess(true)
      enqueueSnackbar('Thanks for joining our waitlist!', { variant: 'success' })

      // Clear fields
      setName('')
      setEmail('')

      // Reset success state after 3 seconds
      setTimeout(() => {
        setIsSuccess(false)
      }, 3000)
    } catch (error) {
      console.error('Error submitting waitlist form:', error)
      enqueueSnackbar(
        error instanceof Error ? error.message : 'Failed to submit form. Please try again.',
        { variant: 'error' }
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInstallGitHubApp = () => {
    const installUrl = import.meta.env.VITE_GITHUB_APP_INSTALL_URL
    if (installUrl) {
      window.open(installUrl, '_blank', 'noopener,noreferrer')
    } else {
      enqueueSnackbar('GitHub app installation URL is not configured yet.', { variant: 'info' })
    }
  }

  return (
    <section id="waitlist" className="relative py-20 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Waitlist Form - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-background/50 backdrop-blur-sm rounded-3xl p-8 md:p-12 border-2 border-foreground/20">
              {/* Title Section */}
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 wonky-text">
                  Join Our Waitlist
                </h2>
                <p className="text-foreground/70 text-base md:text-lg">
                  Stay informed when we launch and be among the first to experience AlgoBounty's trustless bounty system.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Input */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground/80 mb-2">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    disabled={isSubmitting || isSuccess}
                    className="w-full px-4 py-3 rounded-xl bg-background/30 border-2 border-foreground/20 focus:border-primary focus:outline-none text-foreground placeholder:text-foreground/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    disabled={isSubmitting || isSuccess}
                    className="w-full px-4 py-3 rounded-xl bg-background/30 border-2 border-foreground/20 focus:border-primary focus:outline-none text-foreground placeholder:text-foreground/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting || isSuccess || !name.trim() || !email.trim()}
                  className={cn(
                    'w-full py-6 text-lg font-semibold gap-2',
                    isSuccess && 'bg-green-600 hover:bg-green-600'
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : isSuccess ? (
                    <>
                      <Check className="h-5 w-5" />
                      <span>Thanks for joining!</span>
                    </>
                  ) : (
                    <span>Join Waitlist</span>
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* GitHub App Card - Takes 1 column on large screens */}
          <div className="lg:col-span-1">
            <div className="bg-background/50 backdrop-blur-sm rounded-3xl p-6 md:p-8 border-2 border-foreground/20 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center">
                  <Github className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground wonky-text">
                  Install GitHub App
                </h3>
              </div>

              <p className="text-foreground/70 text-sm md:text-base mb-6 grow">
                Install the AlgoBounty GitHub app early to instantly gain access to bounties once we go live on mainnet - no additional setup needed!
              </p>

              <Button
                onClick={handleInstallGitHubApp}
                className="w-full py-4 font-semibold gap-2 cursor-pointer"
              >
                <Github className="h-4 w-4" />
                <span>Install App</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WaitlistForm

