import Hero from './home/Hero'
import About from './home/About'
import Skills from './home/Skills'
import Project from './home/Project'
import Update from './home/Update'
import BackToTop from './components/BackToTop'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <About />
      <Skills />
      <Project />
      <Update />
      <BackToTop />
    </div>
  )
}