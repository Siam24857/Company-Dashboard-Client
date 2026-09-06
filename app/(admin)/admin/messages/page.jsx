import MessagesPanel from '@/components/dashboard/MessagesPanel'

export const metadata = { title: 'Messages — IDEON' }

export default function AdminMessagesPage() {
  return <MessagesPanel canBroadcast />
}