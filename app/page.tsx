import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import LatestContent from './components/LatestContent'
import SocialLinks from './components/SocialLinks'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <About />
      <Skills />
      <LatestContent />
      {/* <SocialLinks /> */}
    </div>
  )
} 