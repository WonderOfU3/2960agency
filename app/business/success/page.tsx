'use client'

import dynamic from 'next/dynamic'

const SuccessPage = dynamic(() => import('@/components/SuccessPage'), { ssr: false })

export default function BusinessSuccessPage() {
  return <SuccessPage variant="business" />
}
