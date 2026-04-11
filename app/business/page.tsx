'use client'

import dynamic from 'next/dynamic'

const BusinessForm = dynamic(() => import('@/components/forms/BusinessForm'), { ssr: false })

export default function BusinessPage() {
  return <BusinessForm />
}
