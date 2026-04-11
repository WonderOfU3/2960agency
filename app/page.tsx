'use client'

import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'

const Hero       = dynamic(() => import('@/components/Hero'),       { ssr: false })
const HowItWorks = dynamic(() => import('@/components/HowItWorks'), { ssr: false })

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <HowItWorks />
    </>
  )
}
