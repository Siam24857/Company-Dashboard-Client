import MissionControl from '@/components/dashboard/MissionControl'

export const metadata = { title: 'Operations Hub — IDEON' }

export default function OperationsPage() {
  return (
    <MissionControl
      hub="Operations"
      subtitle="Track attendance, projects, tasks and incident activity across operations."
    />
  )
}