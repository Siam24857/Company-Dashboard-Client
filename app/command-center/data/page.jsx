'use client'

import DataTable from '@/components/data/DataTable'
import useDashboardStore from '@/store/dashboard.store'

export default function DataPage() {
  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-lg font-bold text-pri">Data Intelligence</h1>
          <p className="text-[11px] text-tri">
            windowed 12k-row store · pinned identities · inline edits are optimistic & background-synced
          </p>
        </div>
        <button className="btn" onClick={() => useDashboardStore.getState().setCommandOpen(true)}>
          <span className="text-[10px] uppercase tracking-widest">Search ↑ ⌘K</span>
        </button>
      </div>

      <DataTable />

      <p className="text-center text-[10px] text-tri" role="note">
        Inline editing uses optimistic UI: the change appears instantly and syncs in the background. Double-click any
        cell to edit; drag column headers to pin is coming in the roadmap.
      </p>
    </div>
  )
}