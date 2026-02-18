import { useLenis } from './hooks/useLenis'
import Cursor from './components/Cursor'
import Header from './components/Header'
import Hero from './components/Hero'
import TransitionSection from './components/TransitionSection'
import JourneySection from './sections/JourneySection'
import StorySection from './sections/StorySection'
import Benefits from './sections/Benefits'
import Technology from './sections/Technology'
import CTA from './sections/CTA'
import Footer from './components/Footer'

function App() {
  useLenis()

  return (
    <>
      <Cursor />
      <div className="noise-overlay" aria-hidden />
      <Header />
      <main>
        <Hero />
        <TransitionSection />
        <JourneySection />
        <StorySection />
        <Benefits />
        <Technology />
        <CTA />
      </main>
      <Footer />
    </>
  )
}

export default App
