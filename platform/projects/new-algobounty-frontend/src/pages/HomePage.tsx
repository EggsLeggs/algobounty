import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import SustainabilitySection from '@/components/SustainabilitySection'
import WaitlistForm from '@/components/WaitlistForm'
import Footer from '@/components/Footer'

const HomePage = () => {
  return (
    <>
      <Hero />
      <HowItWorks />
      <WaitlistForm />
      <SustainabilitySection />
      <Footer />
    </>
  )
}

export default HomePage

