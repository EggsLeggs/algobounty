import { useEffect, useRef } from 'react'
import { PlusCircle, Wallet, Code, Trophy } from '@phosphor-icons/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger)

const HowItWorks = () => {
  // Refs for each card
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const sectionRef = useRef<HTMLElement>(null)

  // Define unique wonky transforms for each card
  // Reduced intensity: Rotations: -4° to 4°, Translations: -10px to 10px
  const wonkyTransforms = [
    { rotation: -3.5, x: -8, y: 6 }, // Card 1
    { rotation: 3, x: 7, y: -8 },    // Card 2
    { rotation: -2.5, x: -6, y: 9 },  // Card 3
    { rotation: 4, x: 10, y: -7 },    // Card 4
  ]

  // Final slightly wonky state (about 30% of initial wonkiness)
  const finalWonkyTransforms = [
    { rotation: -1, x: -2.5, y: 1.8 }, // Card 1
    { rotation: 0.9, x: 2, y: -2.4 },   // Card 2
    { rotation: -0.75, x: -1.8, y: 2.7 }, // Card 3
    { rotation: 1.2, x: 3, y: -2.1 },   // Card 4
  ]

  const cards = [
    {
      number: '01',
      title: 'CREATE',
      description: 'Create a bounty for any GitHub issue and set the reward amount.',
      icon: (
        <div className="w-20 h-20 rounded-full bg-[#D77FD1] flex items-center justify-center border-2 border-[#2d2d2d]">
          <PlusCircle size={40} weight="fill" color="#2d2d2d" />
        </div>
      ),
    },
    {
      number: '02',
      title: 'FUND',
      description: 'Fund your bounty with Algorand tokens locked in a smart contract.',
      icon: (
        <div className="w-20 h-20 rounded-full bg-[#94A159] flex items-center justify-center border-2 border-[#2d2d2d]">
          <Wallet size={40} weight="fill" color="#2d2d2d" />
        </div>
      ),
    },
    {
      number: '03',
      title: 'CONTRIBUTE',
      description: 'Developers work on the issue and submit pull requests to solve it.',
      icon: (
        <div className="w-20 h-20 rounded-full bg-[#E93827] flex items-center justify-center border-2 border-[#2d2d2d]">
          <Code size={40} weight="fill" color="#2d2d2d" />
        </div>
      ),
    },
    {
      number: '04',
      title: 'CLAIM',
      description: 'Claim your reward automatically when the pull request is merged.',
      icon: (
        <div className="w-20 h-20 rounded-full bg-[#94A159] flex items-center justify-center border-2 border-[#2d2d2d]">
          <Trophy size={40} weight="fill" color="#2d2d2d" />
        </div>
      ),
    },
  ]

  useEffect(() => {
    // Set initial wonky state for all cards
    cardRefs.current.forEach((card, index) => {
      if (card) {
        const transform = wonkyTransforms[index]
        gsap.set(card, {
          rotation: transform.rotation,
          x: transform.x,
          y: transform.y,
          scale: 1,
        })
      }
    })

    // Create ScrollTrigger animation with reversible scrub
    const triggers = cardRefs.current.map((card, index) => {
      if (!card) return null

      const finalTransform = finalWonkyTransforms[index]
      return ScrollTrigger.create({
        trigger: card,
        start: 'top 85%',
        end: 'top 30%',
        animation: gsap.to(card, {
          rotation: finalTransform.rotation,
          x: finalTransform.x,
          y: finalTransform.y,
          duration: 1,
          ease: 'power2.out',
        }),
        scrub: true,
      })
    }).filter(Boolean)

    // Add hover animations
    const hoverAnimations = cardRefs.current.map((card) => {
      if (!card) return null

      let hoverTween: gsap.core.Tween | null = null

      const handleMouseEnter = () => {
        if (hoverTween) hoverTween.kill()
        const currentY = gsap.getProperty(card, 'y') as number
        hoverTween = gsap.to(card, {
          scale: 1.05,
          y: currentY - 8,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      }

      const handleMouseLeave = () => {
        if (hoverTween) hoverTween.kill()
        const currentY = gsap.getProperty(card, 'y') as number
        hoverTween = gsap.to(card, {
          scale: 1,
          y: currentY + 8,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      }

      card.addEventListener('mouseenter', handleMouseEnter)
      card.addEventListener('mouseleave', handleMouseLeave)

      return { card, handleMouseEnter, handleMouseLeave }
    }).filter(Boolean)

    // Cleanup function
    return () => {
      triggers.forEach((trigger) => {
        if (trigger) trigger.kill()
      })
      hoverAnimations.forEach((anim) => {
        if (anim) {
          anim.card.removeEventListener('mouseenter', anim.handleMouseEnter)
          anim.card.removeEventListener('mouseleave', anim.handleMouseLeave)
        }
      })
    }
  }, [])

  return (
    <section ref={sectionRef} className="relative py-20 px-4 bg-[#2d2d2d] overflow-hidden rounded-4xl ">
      <div className="max-w-7xl mx-auto">
        {/* Title Section */}
        <div className="relative mb-16 text-center">
          {/* Services Label */}
          <div className="text-sm font-medium text-[#f9f2e9]/80 mb-4 tracking-wider">
            HOW IT WORKS
          </div>

          {/* Main Title */}
          <div className="relative inline-block">
            {/* Purple Triangle (Left) - Fragmented */}
            <svg
              className="absolute -left-16 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 animate-float"
              viewBox="0 0 60 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M30 5L45 40L20 45L30 5Z"
                fill="#D77FD1"
                stroke="#D77FD1"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M25 35L40 48L15 50L25 35Z"
                fill="#D77FD1"
                opacity="0.7"
                stroke="#D77FD1"
                strokeWidth="1"
                strokeLinejoin="round"
              />
              <path
                d="M30 15L38 30L22 32L30 15Z"
                fill="#D77FD1"
                opacity="0.5"
              />
            </svg>

            {/* Title Text */}
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#f9f2e9] leading-tight">
              <span className="block wonky-text" style={{ transform: 'rotate(-0.5deg) translateX(-2px)' }}>
                SIMPLE.
              </span>
              <span className="block wonky-text" style={{ transform: 'rotate(0.8deg) translateX(3px)' }}>
                FOUR STEPS
              </span>
              <span className="block flex items-center justify-center gap-3 mt-2 wonky-text" style={{ transform: 'rotate(-0.3deg)' }}>
                <span className="w-3 h-3 rounded-full bg-[#94A159]"></span>
                <span>TO GET STARTED</span>
              </span>
            </h2>

            {/* Red Starburst (Right) */}
            <svg
              className="absolute -right-16 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 animate-float"
              style={{ animationDelay: '1s' }}
              viewBox="0 0 60 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M30 5L35 20L50 25L35 30L30 45L25 30L10 25L25 20L30 5Z"
                fill="#E93827"
                stroke="#E93827"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M30 15L33 25L43 27L33 29L30 39L27 29L17 27L27 25L30 15Z"
                fill="#E93827"
                opacity="0.7"
                stroke="#E93827"
                strokeWidth="1"
                strokeLinejoin="round"
              />
              <path
                d="M30 20L32 28L38 29L32 30L30 38L28 30L22 29L28 28L30 20Z"
                fill="#E93827"
                opacity="0.5"
              />
            </svg>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {cards.map((card, index) => (
            <div
              key={index}
              ref={(el) => {
                cardRefs.current[index] = el
              }}
              className="relative bg-[#f9f2e9] rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-[#2d2d2d]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")`,
              }}
            >
              {/* Number */}
              <div className="text-sm font-medium text-[#2d2d2d]/60 mb-4 text-center">
                {card.number}
              </div>

              {/* Title */}
              <h3 className="text-xl md:text-2xl font-bold text-[#2d2d2d] mb-6 text-center tracking-tight wonky-text">
                {card.title}
              </h3>

              {/* Icon */}
              <div className="flex justify-center mb-6 relative">
                {card.icon}
                {/* Sparkle lines */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <svg width="80" height="80" viewBox="0 0 80 80" className="opacity-30">
                    <path
                      d="M40 10L42 20L50 22L42 24L40 34L38 24L30 22L38 20L40 10Z"
                      stroke="#ffffff"
                      strokeWidth="1"
                      fill="none"
                    />
                    <path
                      d="M10 40L20 38L22 30L24 38L34 40L24 42L22 50L20 42L10 40Z"
                      stroke="#ffffff"
                      strokeWidth="1"
                      fill="none"
                    />
                    <path
                      d="M40 70L42 60L50 58L42 56L40 46L38 56L30 58L38 60L40 70Z"
                      stroke="#ffffff"
                      strokeWidth="1"
                      fill="none"
                    />
                    <path
                      d="M70 40L60 42L58 50L56 42L46 40L56 38L58 30L60 38L70 40Z"
                      stroke="#ffffff"
                      strokeWidth="1"
                      fill="none"
                    />
                  </svg>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm md:text-base text-[#2d2d2d]/80 leading-relaxed text-center">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks

