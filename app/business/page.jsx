import MissionControl from '@/components/dashboard/MissionControl'

export const metadata = { title: 'Business Hub — IDEON' }

export default function BusinessPage() {
  return (
    <MissionControl
      hub="Business Management"
      subtitle="Track attendance, projects and tasks across the business management unit."
    />
  )
}