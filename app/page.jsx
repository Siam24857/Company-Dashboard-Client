import Navbar from '@/components/home/Navbar'
import Hero from '@/components/home/Hero'
import Company from '@/components/home/Company'
import Technology from '@/components/home/Technology'
import Services from '@/components/home/Services'
import Projects from '@/components/home/Projects'
import Footer from '@/components/home/Footer'

export const metadata = {
  title: 'IDEON — Enterprise Technology & Command Center',
  description:
    'Precision-engineered software, AI and cloud systems. From mission command center to deployment.',
}

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--bg-0)] text-[var(--text-0)]">
      <Navbar />
      <main>
        <Hero />
        <Company />
        <Technology />
        <Services />
        <Projects />
      </main>
      <Footer />
    </div>
  )
}