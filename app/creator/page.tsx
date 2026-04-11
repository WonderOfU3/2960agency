'use client'

import dynamic from 'next/dynamic'

const CreatorForm = dynamic(() => import('@/components/forms/CreatorForm'), { ssr: false })

export default function CreatorPage() {
  return <CreatorForm />
}
