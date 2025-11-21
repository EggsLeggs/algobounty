import { Button } from '@/components/ui/button'

const SustainabilitySection = () => {
  const testimonials = [
    {
      persona: 'Companies',
      quote: 'The ability to directly fund issues impacting our delivery sounds like a game changer. We will definitely give it a try!',
      author: 'Anonymous',
      title: 'CTO',
      company: '',
      buttonText: 'Fund an Issue',
      color: '#7F9ED7',
      foregroundColor: '#ffffff',
    },
    {
      persona: 'Maintainers',
      quote: 'I\'m excited at the prospect of being able to entice contributors to work on issues that impact our projects but that we don\'t have the resources to fix ourselves.',
      author: 'Hayden Bradley',
      title: 'Founder',
      company: 'ThinkHuman',
      buttonText: 'Enable on Repo',
      color: '#94A159',
      foregroundColor: '#ffffff',
    },
    {
      persona: 'Contributors',
      quote: 'Being able to get paid to do work that I\'m passionate about sounds ideal. I\'d love to see bounty-hunting become a side hustle for me.',
      author: 'Anonymous',
      title: 'Student',
      company: 'King\'s College London',
      buttonText: 'Find Bounties',
      color: '#D77FD1',
      foregroundColor: '#ffffff',
    },
  ]

  return (
    <section className="relative py-20 px-4 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header and Benefits Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Left: Header */}
          <div className="flex items-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Making Open-Source
              <br />
              <span className="wonky-text" style={{ transform: 'rotate(0.5deg) translateX(2px)' }}>
                Sustainable
              </span>
            </h2>
          </div>

          {/* Right: Benefits Text */}
          <div className="flex items-center">
            <p className="lg:text-lg text-foreground/80 leading-relaxed">
              Our platform creates a sustainable ecosystem that benefits{' '}
              <span
                className="px-2 py-1 rounded-md font-semibold"
                style={{
                  backgroundColor: '#7F9ED7',
                  color: '#ffffff',
                }}
              >
                companies
              </span>
              ,{' '}
              <span
                className="px-2 py-1 rounded-md font-semibold"
                style={{
                  backgroundColor: '#94A159',
                  color: '#ffffff',
                }}
              >
                maintainers
              </span>
              , and{' '}
              <span
                className="px-2 py-1 rounded-md font-semibold"
                style={{
                  backgroundColor: '#D77FD1',
                  color: '#ffffff',
                }}
              >
                contributors
              </span>
              . By connecting funding directly to issues, we ensure that valuable work gets done while everyone involved is fairly compensated.
            </p>
          </div>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative bg-card rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")`,
              }}
            >
              {/* Persona Label */}
              <div className="text-sm font-medium text-foreground/60 mb-4">
                For {testimonial.persona}
              </div>

              {/* Quote */}
              <blockquote className="text-base md:text-lg text-foreground/90 mb-6 grow leading-relaxed">
                "{testimonial.quote}"
              </blockquote>

              {/* Author Info */}
              <div className="mb-6">
                <div className="font-semibold text-foreground">{testimonial.author}</div>
                <div className="text-sm text-foreground/70">
                  {testimonial.title}
                  {testimonial.company && `, ${testimonial.company}`}
                </div>
              </div>

              {/* Button */}
              <Button
                className="w-full"
                style={{
                  backgroundColor: testimonial.color,
                  color: testimonial.foregroundColor,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
              >
                {testimonial.buttonText}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SustainabilitySection

