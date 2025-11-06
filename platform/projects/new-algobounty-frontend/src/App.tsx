import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import SustainabilitySection from '@/components/SustainabilitySection'

function App() {
  return (
    <>
      <Navigation />
      <div className="noise" />
      <Hero />
      <HowItWorks />
      <SustainabilitySection />
    </>
  )
}

export default App
