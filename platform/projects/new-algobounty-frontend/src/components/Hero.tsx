import { useEffect, useState } from 'react'
import easyaLogo from '../assets/easya.svg'
import algorandLogo from '../assets/algorand.svg'
import { Button } from '@/components/ui/button'

const Hero = () => {
  const handleScrollToWaitlist = () => {
    const waitlistElement = document.getElementById('waitlist')
    if (waitlistElement) {
      waitlistElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
  const line1 = ["Trustless", "Bounties"]
  const line2 = ["For", "Open-Source"]
  const line3 = ["Issues"]

  const allWords = [...line1, ...line2, ...line3]
  const [visibleWords, setVisibleWords] = useState<number[]>([])

  // Wonky transforms for each word to create hand-drawn effect
  const wonkyTransforms = [
    { rotate: '-1deg', x: -2, y: 1 }, // Trustless
    { rotate: '1.5deg', x: 3, y: -1 }, // Bounties
    { rotate: '0.5deg', x: 1, y: 2 }, // For
    { rotate: '-1.2deg', x: -1, y: -1 }, // Open-Source
    { rotate: '2deg', x: 5, y: 1 }, // Issues
  ]

  useEffect(() => {
    // Animate words one by one
    const timeouts: ReturnType<typeof setTimeout>[] = []
    allWords.forEach((_, index) => {
      const timeout = setTimeout(() => {
        setVisibleWords(prev => [...prev, index])
      }, index * 250) // 250ms delay between each word
      timeouts.push(timeout)
    })
    // Cleanup function to clear timeouts if component unmounts
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, [allWords.length])

  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden px-4 pt-28 pb-12">
      {/* Main Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Pill Badge */}
        <div className="mb-8 inline-block">
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-foreground/5 border-2 border-foreground/20 text-sm font-medium text-foreground/80 backdrop-blur-sm">
            Powered by Algorand.
          </span>
        </div>

        {/* Animated Slogan */}
        <div className="relative text-4xl md:text-6xl lg:text-7xl font-bold leading-none mb-8">
          {/* Clover Icon (Left) */}
          <svg
            className="absolute -left-12 md:-left-16 lg:-left-20 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 animate-float"
            viewBox="0 0 500 500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M337.6,87.6C337.6,136,250,250,250,250s-87.6-114-87.6-162.4S201.6,0,250,0S337.6,39.2,337.6,87.6z M500,250 c0-48.4-39.2-87.6-87.6-87.6S250,250,250,250s114,87.6,162.4,87.6S500,298.4,500,250z M250,500c48.4,0,87.6-39.2,87.6-87.6 S250,250,250,250s-87.6,114-87.6,162.4S201.6,500,250,500z M0,250c0,48.4,39.2,87.6,87.6,87.6S250,250,250,250s-114-87.6-162.4-87.6 S0,201.6,0,250z"
              fill="#D77FD1"
            />
          </svg>

          {/* Circle Icon (Right) */}
          <svg
            className="absolute -right-12 md:-right-16 lg:-right-20 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 animate-float"
            style={{ animationDelay: '1s' }}
            viewBox="-10.2 -10.2 520.4 520.4"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M308.8,30.5L308.8,30.5L308.8,30.5c45.2-20.9,97.4,9.3,101.9,58.8v0l0,0c49.6,4.5,79.7,56.7,58.8,101.9l0,0 l0,0c40.7,28.7,40.7,89,0,117.6l0,0l0,0c20.9,45.2-9.3,97.4-58.8,101.9h0v0c-4.5,49.6-56.7,79.7-101.9,58.8l0,0l0,0 c-28.7,40.7-89,40.7-117.6,0l0,0l0,0c-45.2,20.9-97.4-9.3-101.9-58.8l0,0h0C39.8,406.2,9.6,354,30.5,308.8l0,0l0,0 c-40.7-28.7-40.7-89,0-117.6l0,0l0,0C9.6,146,39.8,93.8,89.3,89.3l0,0l0,0C93.8,39.8,146,9.6,191.2,30.5l0,0l0,0 C219.8-10.2,280.2-10.2,308.8,30.5z"
              fill="#94A159"
            />
          </svg>
          {/* Line 1: Trustless Bounties */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            {line1.map((word, index) => (
              <span
                key={`line1-${index}`}
                className={`inline-block wonky-text ${
                  visibleWords.includes(index)
                    ? 'animate-word-in opacity-100'
                    : 'opacity-0'
                }`}
                style={{
                  transform: `rotate(${wonkyTransforms[index].rotate}) translate(${wonkyTransforms[index].x}px, ${wonkyTransforms[index].y}px)`,
                }}
              >
                {word}
              </span>
            ))}
          </div>

          {/* Line 2: For Open-Source */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            {line2.map((word, index) => (
              <span
                key={`line2-${index}`}
                className={`inline-block wonky-text ${
                  visibleWords.includes(line1.length + index)
                    ? 'animate-word-in opacity-100'
                    : 'opacity-0'
                }`}
                style={{
                  transform: `rotate(${wonkyTransforms[line1.length + index].rotate}) translate(${wonkyTransforms[line1.length + index].x}px, ${wonkyTransforms[line1.length + index].y}px)`,
                }}
              >
                {word}
              </span>
            ))}
          </div>

          {/* Line 3: Issues (right-aligned) */}
          <div className="flex justify-end pr-8 md:pr-16 lg:pr-24">
            {line3.map((word, index) => (
              <span
                key={`line3-${index}`}
                className={`inline-block wonky-text ${
                  visibleWords.includes(line1.length + line2.length + index)
                    ? 'animate-word-in opacity-100'
                    : 'opacity-0'
                }`}
                style={{
                  transform: `rotate(${wonkyTransforms[line1.length + line2.length + index].rotate}) translate(${wonkyTransforms[line1.length + line2.length + index].x}px, ${wonkyTransforms[line1.length + line2.length + index].y}px)`,
                }}
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 mt-16">
          {/* Badge 1: EasyA x Algorand Hackathon */}
          <div className="inline-flex items-center gap-3 px-4 py-3 rounded-lg bg-foreground/5 border-2 border-foreground/20 backdrop-blur-sm">
            <img
              src={easyaLogo}
              alt="EasyA"
              className="w-8 h-8 shrink-0"
            />
            <div className="flex flex-col text-left">
              <span className="text-xs font-medium text-foreground/60 leading-tight">EasyA x Algorand Hackathon</span>
              <span className="text-sm font-bold text-foreground leading-tight">#2 Place Pitch</span>
            </div>
          </div>

          {/* Badge 2: Algorand Startup Challenge */}
          <div className="inline-flex items-center gap-3 px-4 py-3 rounded-lg bg-foreground/5 border-2 border-foreground/20 backdrop-blur-sm">
            <img
              src={algorandLogo}
              alt="Algorand"
              className="w-8 h-8 shrink-0"
            />
            <div className="flex flex-col text-left">
              <span className="text-xs font-medium text-foreground/60 leading-tight">Algorand Startup Challenge</span>
              <span className="text-sm font-bold text-foreground leading-tight">2025 Participant</span>
            </div>
          </div>
        </div>

        {/* Join Waitlist Button */}
        <div className="mt-12">
          <Button
            onClick={handleScrollToWaitlist}
            className="px-8 py-6 text-lg font-semibold rounded-xl cursor-pointer"
          >
            Join the Waitlist
          </Button>
        </div>
      </div>
    </section>
  )
}

export default Hero

