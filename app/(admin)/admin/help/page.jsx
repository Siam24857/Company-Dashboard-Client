'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Search, HelpCircle, BookOpen, Users, FolderOpen, Wallet, FileText, Printer, Shield, Lock, Wrench, LifeBuoy, ChevronDown, ChevronRight, MessageSquare } from 'lucide-react'

const HELP_ARTICLES = [
  {
    category: 'Getting Started',
    icon: BookOpen,
    color: 'var(--cyan)',
    items: [
      { title: 'Welcome to IDEONS', content: 'IDEONS is a comprehensive enterprise management system. This guide walks you through the core features: user management, projects, tasks, finance, and analytics. Start by exploring the Command Center for a high-level overview, then dive into the specific modules.' },
      { title: 'Navigating the Dashboard', content: 'Use the sidebar to navigate between modules. The Command Center shows KPIs, insights, and recent activity. Each analytics page provides detailed charts and data. Keyboard shortcut Ctrl+K opens global search.' },
      { title: 'Understanding Roles & Permissions', content: 'IDEONS has 4 roles: ADMIN, BUSINESS_MANAGEMENT, SALES_MANAGEMENT, and OPERATIONS_DEVELOPER. Each role has specific access levels. Admins have full access to all modules and can manage users, projects, tasks, finances, and security.' },
    ],
  },
  {
    category: 'User Management',
    icon: Users,
    color: 'var(--blue)',
    items: [
      { title: 'Creating Users', content: 'Navigate to User Management > Add User. Fill in the required fields (full name, email, role, department). New users receive an email notification. You can activate, suspend, or delete users from the user list.' },
      { title: 'Managing User Status', content: 'Users start in PENDING status. Approve them to ACTIVE, or suspend accounts as needed. Suspended users cannot log in. You can bulk-activate or bulk-suspend users using the selection checkboxes and bulk actions bar.' },
      { title: 'Assigning Roles & Departments', content: 'Edit a user to change their role or department. Roles control which dashboard hub they see and what actions they can perform. Departments determine team grouping and analytics.' },
    ],
  },
  {
    category: 'Team & Project Management',
    icon: FolderOpen,
    color: 'var(--purple)',
    items: [
      { title: 'Creating Projects', content: 'Go to Projects > New Project. Enter the title, description, department, priority, and start date. Add members from the project detail page. Project status flows: PLANNING → IN_PROGRESS → COMPLETED.' },
      { title: 'Managing Tasks', content: 'Tasks belong to projects. Create tasks with title, description, assignee, priority, and due date. Track status: TODO → IN_PROGRESS → IN_REVIEW → COMPLETED. Overdue tasks are highlighted in analytics.' },
      { title: 'Monitoring Project Health', content: 'Use the Project Analytics page to monitor completion rates, overdue tasks, and department distribution. The Workload Management page shows per-employee and per-team workload levels.' },
    ],
  },
  {
    category: 'Finance & Reports',
    icon: Wallet,
    color: 'var(--green)',
    items: [
      { title: 'Managing Transactions', content: 'The Transactions page shows all financial activity. Track income and expenses by category. Each transaction has a status (PENDING, COMPLETED, CANCELLED). Revenue analytics calculates growth rates and monthly breakdowns.' },
      { title: 'Generating Reports', content: 'The Report Generator produces professional PDF reports. Choose a report type (Executive, User, Employee, Team, Project, Task, Financial, etc.), configure the date range, preview, and download. Reports include IDEONS branding, tables, charts, and summaries.' },
      { title: 'Understanding Analytics', content: 'Analytics are calculated from real database records. Completion rates, growth percentages, and workload levels are computed server-side. Never fabricated - always derived from actual data.' },
    ],
  },
  {
    category: 'Security & Compliance',
    icon: Shield,
    color: 'var(--red)',
    items: [
      { title: 'Security Center', content: 'The Security Center shows login activity, failed attempts, active sessions, and security alerts. Review events by severity (INFO, WARNING, CRITICAL). All administrative actions are logged in the Audit Log.' },
      { title: 'Audit Logs', content: 'Every admin action (user changes, role changes, project changes, financial changes, settings changes) is recorded in the Audit Log. Filter by action type and search across records. This provides a complete trail for compliance.' },
      { title: 'System Health', content: 'The System Health page shows real operational status: API, database, authentication, storage, error counts, request counts, and response performance. Statuses reflect actual monitored state, never simulated.' },
    ],
  },
  {
    category: 'Troubleshooting',
    icon: Wrench,
    color: 'var(--amber)',
    items: [
      { title: 'Cannot Log In', content: 'Check your email and password. Ensure your account status is ACTIVE (not PENDING or SUSPENDED). Use the Forgot Password option to reset via OTP. Contact an admin if the issue persists.' },
      { title: 'Missing Data in Charts', content: 'Analytics charts are populated from database records. If no data exists for a period, charts will show an empty state. Ensure transactions and tasks have the correct status and date ranges.' },
      { title: 'Data Not Loading', content: 'Check that the backend server is running and the database is accessible. Review the System Health page for API and database status. Clear your browser cache and retry.' },
    ],
  },
]

export default function AdminHelpCenter() {
  const [search, setSearch] = useState('')
  const [openCategory, setOpenCategory] = useState(0)
  const [expanded, setExpanded] = useState({})

  const filtered = HELP_ARTICLES
    .map(cat => ({ ...cat, items: cat.items.filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase())) }))
    .filter(cat => cat.items.length > 0)

  return (
    <div className="space-y-6">
      <div>
        <p className="mono text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--text-2)' }}>System</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-0)' }}>Admin Help Center</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-2)' }}>Documentation, guides, and troubleshooting for the IDEONS platform.</p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-2)' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search help articles…"
          className="w-full rounded-xl border py-3 pl-10 pr-4 text-sm outline-none"
          style={{ borderColor: 'var(--stroke)', color: 'var(--text-0)', background: 'var(--card-hi)' }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center" style={{ borderColor: 'var(--stroke)' }}>
          <HelpCircle size={32} className="mx-auto" style={{ color: 'var(--text-2)' }} />
          <p className="mt-3 text-sm" style={{ color: 'var(--text-2)' }}>No help articles found for "{search}"</p>
        </div>
      ) : (
        filtered.map((cat, ci) => (
          <div key={ci} className="rounded-2xl border" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
            <button
              onClick={() => setOpenCategory(openCategory === ci ? -1 : ci)}
              className="flex w-full items-center justify-between rounded-2xl px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${cat.color}15`, color: cat.color }}>
                  <cat.icon size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>{cat.category}</h3>
                  <p className="text-[11px]" style={{ color: 'var(--text-2)' }}>{cat.items.length} articles</p>
                </div>
              </div>
              {openCategory === ci ? <ChevronDown size={16} style={{ color: 'var(--text-2)' }} /> : <ChevronRight size={16} style={{ color: 'var(--text-2)' }} />}
            </button>

            {openCategory === ci && (
              <div className="space-y-2 px-5 pb-5">
                {cat.items.map((article, ai) => (
                  <div key={ai} className="rounded-xl border" style={{ borderColor: 'var(--stroke)' }}>
                    <button
                      onClick={() => setExpanded(prev => ({ ...prev, [`${ci}-${ai}`]: !prev[`${ci}-${ai}`] }))}
                      className="flex w-full items-center justify-between rounded-xl px-4 py-3 hover:bg-[var(--glass-soft)]"
                    >
                      <span className="text-xs font-medium" style={{ color: 'var(--text-0)' }}>{article.title}</span>
                      {expanded[`${ci}-${ai}`] ? <ChevronDown size={14} style={{ color: 'var(--text-2)' }} /> : <ChevronRight size={14} style={{ color: 'var(--text-2)' }} />}
                    </button>
                    {expanded[`${ci}-${ai}`] && (
                      <p className="px-4 pb-4 text-xs leading-relaxed" style={{ color: 'var(--text-1)' }}>{article.content}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--stroke)', background: 'linear-gradient(to bottom, var(--card-hi), var(--card-lo))' }}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--cyan-soft)', color: 'var(--cyan)' }}>
            <LifeBuoy size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-0)' }}>Need more help?</h3>
            <p className="text-xs" style={{ color: 'var(--text-2)' }}>Contact the support team with your question.</p>
          </div>
          <button className="ml-auto flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold" style={{ background: 'var(--cyan)', color: 'var(--bg)' }}>
            <MessageSquare size={14} /> Contact Support
          </button>
        </div>
      </div>
    </div>
  )
}
