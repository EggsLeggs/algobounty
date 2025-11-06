import { useEffect, useState } from 'react'

const Hero = () => {
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
    const timeouts: NodeJS.Timeout[] = []
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
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden px-4 py-16 pt-28">
      {/* Main Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Pill Badge */}
        <div className="mb-8 inline-block">
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-foreground/5 border-2 border-foreground/20 text-sm font-medium text-foreground/80 backdrop-blur-sm">
            Powered by Algorand.
          </span>
        </div>

        {/* Animated Slogan */}
        <div className="text-4xl md:text-6xl lg:text-7xl font-bold leading-none mb-8">
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
      </div>
    </section>
  )
}

export default Hero

