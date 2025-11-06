const HowItWorks = () => {
  const cards = [
    {
      number: '01',
      title: 'CREATE',
      description: 'Create a bounty for any GitHub issue and set the reward amount.',
      icon: (
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M30 5L35 20L50 25L35 30L30 45L25 30L10 25L25 20L30 5Z" fill="#D77FD1" stroke="#2d2d2d" strokeWidth="2"/>
          <circle cx="30" cy="25" r="3" fill="#2d2d2d"/>
          <path d="M20 15L25 20M40 15L35 20M20 35L25 30M40 35L35 30" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      number: '02',
      title: 'FUND',
      description: 'Fund your bounty with Algorand tokens locked in a smart contract.',
      icon: (
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="30" cy="30" r="20" fill="#94A159" stroke="#2d2d2d" strokeWidth="2"/>
          <circle cx="30" cy="30" r="12" fill="#2d2d2d"/>
          <path d="M30 18L30 42M18 30L42 30" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
          <path d="M25 25L35 35M35 25L25 35" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      number: '03',
      title: 'CONTRIBUTE',
      description: 'Developers work on the issue and submit pull requests to solve it.',
      icon: (
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="15" y="20" width="30" height="25" rx="2" fill="#E93827" stroke="#2d2d2d" strokeWidth="2"/>
          <rect x="20" y="25" width="20" height="15" fill="#2d2d2d"/>
          <path d="M15 20L30 10L45 20" stroke="#2d2d2d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M25 30L30 35L35 30" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M20 15L25 20M40 15L35 20" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      number: '04',
      title: 'CLAIM',
      description: 'Claim your reward automatically when the pull request is merged.',
      icon: (
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M30 10L35 20L45 22L35 24L30 34L25 24L15 22L25 20L30 10Z" fill="#94A159" stroke="#2d2d2d" strokeWidth="2"/>
          <rect x="20" y="38" width="20" height="8" rx="1" fill="#2d2d2d"/>
          <path d="M25 35L30 30L35 35" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M22 42L28 42M32 42L38 42" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
    },
  ]

  return (
    <section className="relative py-20 px-4 bg-[#2d2d2d] overflow-hidden rounded-4xl ">
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
              className="relative bg-[#f9f2e9] rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
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

