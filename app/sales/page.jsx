import MissionControl from '@/components/dashboard/MissionControl'

export const metadata = { title: 'Sales Hub — IDEON' }

export default function SalesPage() {
  return (
    <MissionControl
      hub="Sales Management"
      subtitle="Track attendance, projects, tasks and pipeline activity for the sales unit."
    />
  )
}