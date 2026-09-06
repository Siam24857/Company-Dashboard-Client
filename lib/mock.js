import { genSeries, mulberry32 } from './utils'

const rnd = mulberry32(1337)

/* Fixed epoch so SSR and client render identical data. */
const EPOCH = new Date('2026-08-10T00:00:00Z').getTime()
const day = 86400000

/* ============================================================
   The mock universe for the Command Center.
   Deterministic so SSR data matches client data.
   ============================================================ */

export const ENVS = [
  { id: 'dev', label: 'Dev', color: 'var(--yellow)' },
  { id: 'staging', label: 'Staging', color: 'var(--blue)' },
  { id: 'prod', label: 'Prod', color: 'var(--green)' },
]

export const WORKSPACES = [
  { id: 'executive', label: 'Executive', icon: 'Command' },
  { id: 'sales', label: 'Sales', icon: 'TrendingUp' },
  { id: 'marketing', label: 'Marketing', icon: 'Megaphone' },
  { id: 'dev', label: 'Engineering', icon: 'Cpu' },
  { id: 'ops', label: 'Operations', icon: 'Boxes' },
]

export const CURRENT_USER = {
  name: 'Ava Chen',
  initials: 'AC',
  role: 'EXECUTIVE · STAFF PM',
  title: 'Chief Strategy Officer',
  email: 'ava.chen@ideon.co',
}

/* ---------------- KPI cluster ---------------- */
export const KPI_DEFS = [
  {
    id: 'revenue',
    label: 'Revenue',
    icon: 'DollarSign',
    value: 1284000,
    unit: 'currency',
    goal: 1500000,
    change: 12.4,
    trend: 'up',
    tone: 'success',
    forecast: 'On pace to exceed target in 6 days.',
    benchmark: { label: 'vs industry', value: 8.1 },
    anomaly: null,
  },
  {
    id: 'users',
    label: 'Active Users',
    icon: 'Users',
    value: 48213,
    unit: 'number',
    goal: 50000,
    change: 4.8,
    trend: 'up',
    tone: 'success',
    forecast: 'Crossing 50K churn-adjusted next week.',
    benchmark: { label: 'vs last month', value: 3.2 },
    anomaly: null,
  },
  {
    id: 'churn',
    label: 'Churn Rate',
    icon: 'UserMinus',
    value: 3.6,
    unit: 'percent',
    goal: 2.5,
    inverse: true,
    change: 0.9,
    trend: 'up',
    tone: 'critical',
    forecast: 'Warning: trend diverging — address retention list.',
    benchmark: { label: 'vs industry avg', value: 4.8, lowerIsBetter: true },
    anomaly: { msg: '2.1σ above the 14-day moving norm', since: '09:40' },
  },
  {
    id: 'nps',
    label: 'NPS',
    icon: 'Heart',
    value: 61,
    unit: 'score',
    goal: 70,
    change: 6.2,
    trend: 'up',
    tone: 'success',
    forecast: 'Expected to hit target in 3 days.',
    benchmark: { label: 'vs last quarter', value: 55 },
    anomaly: null,
  },
]

export const kpiSeries = {
  revenue: genSeries(11, 40, 1120000, 0.022, 6200),
  users: genSeries(22, 40, 45800, 0.012, 160),
  churn: genSeries(33, 40, 3.4, 0.05, 0.004),
  nps: genSeries(44, 40, 57, 0.03, 0.12),
}

/* ---------------- Main analytics ---------------- */
export const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

export const quarterly = {
  labels: monthLabels,
  revenue: [980, 1120, 1185, 1240, 1215, 1284],
  costs: [640, 700, 692, 756, 741, 783],
  profit: [340, 420, 493, 484, 474, 501],
}

export const quarterlyPrev = {
  labels: monthLabels,
  revenue: [860, 940, 1010, 1065, 1090, 1142],
  costs: [590, 625, 618, 680, 705, 731],
  profit: [270, 315, 392, 385, 385, 411],
}

export const yearly = {
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  revenue: [3220, 3660, 4280, 5020],
  costs: [2032, 2148, 2389, 2672],
  profit: [1188, 1512, 1891, 2348],
}

/* ---------------- Geographic heatmap ---------------- */
export const geoPoints = [
  { id: 'nyc', name: 'New York', lat: 40.7, lng: -74.0, v: 92 },
  { id: 'lax', name: 'Los Angeles', lat: 34.0, lng: -118.2, v: 61 },
  { id: 'aus', name: 'Austin', lat: 30.26, lng: -97.74, v: 44 },
  { id: 'lon', name: 'London', lat: 51.5, lng: -0.12, v: 78 },
  { id: 'ber', name: 'Berlin', lat: 52.5, lng: 13.4, v: 52 },
  { id: 'blr', name: 'Bangalore', lat: 12.97, lng: 77.59, v: 88 },
  { id: 'sgp', name: 'Singapore', lat: 1.35, lng: 103.82, v: 71 },
  { id: 'syd', name: 'Sydney', lat: -33.87, lng: 151.2, v: 39 },
  { id: 'sao', name: 'São Paulo', lat: -23.55, lng: -46.63, v: 48 },
  { id: 'dub', name: 'Dubai', lat: 25.2, lng: 55.27, v: 56 },
  { id: 'tok', name: 'Tokyo', lat: 35.68, lng: 139.69, v: 66 },
  { id: 'rrj', name: 'Remote', lat: 38.9, lng: -97.0, v: 35 },
]

/* ---------------- Tasks / workflow ---------------- */
export const TASK_PRIORITIES = [
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
]

export const initialTasks = [
  { id: 't1', title: 'Migrate billing to versionless API', prio: 'high', status: 'doing', sla: 2200, slaTotal: 3600, dep: null, assignee: 'KM', tags: ['backend'], est: 14 },
  { id: 't2', title: 'Churn cohort analysis (Q3 funnel)', prio: 'high', status: 'doing', sla: 1150, slaTotal: 3600, dep: 't3', assignee: 'JC', tags: ['analytics'], est: 8 },
  { id: 't3', title: 'Stabilize event pipeline backpressure', prio: 'high', status: 'todo', sla: 3100, slaTotal: 3600, dep: null, assignee: 'RD', tags: ['infra'], est: 16 },
  { id: 't4', title: 'Launch self-serve onboarding kit', prio: 'high', status: 'done', sla: 0, slaTotal: 3600, dep: 't1', assignee: 'AC', tags: ['growth'], est: 20 },
  { id: 't5', title: 'NPS feedback theme clustering', prio: 'medium', status: 'todo', sla: 5200, slaTotal: 14400, dep: 't2', assignee: 'SK', tags: ['ml'], est: 12 },
  { id: 't6', title: 'Update SLA dashboards for Ops', prio: 'medium', status: 'doing', sla: 6800, slaTotal: 14400, dep: null, assignee: 'RD', tags: ['ops'], est: 6 },
  { id: 't7', title: 'Rework pricing page A/B variant B', prio: 'medium', status: 'todo', sla: 9200, slaTotal: 14400, dep: null, assignee: 'MV', tags: ['product'], est: 9 },
  { id: 't8', title: 'Quarterly security audit prep', prio: 'medium', status: 'done', sla: 0, slaTotal: 14400, dep: 't3', assignee: 'KM', tags: ['security'], est: 10 },
  { id: 't9', title: 'Refresh sales deck formulas', prio: 'low', status: 'todo', sla: 30000, slaTotal: 43200, dep: null, assignee: 'MV', tags: ['sales'], est: 4 },
  { id: 't10', title: 'Internal knowledge base index', prio: 'low', status: 'todo', sla: 40000, slaTotal: 43200, dep: null, assignee: 'AC', tags: ['docs'], est: 5 },
]

/* ---------------- System health ---------------- */
export const healthSeries = {
  cpu: genSeries(51, 60, 46, 0.16).map((v, i) => ({ t: i, v })),
  mem: genSeries(52, 60, 62, 0.05).map((v, i) => ({ t: i, v })),
  net: genSeries(53, 60, 71, 0.12).map((v, i) => ({ t: i, v })),
}

export const errorGroups = [
  { id: 'e1', name: 'ERR_POSTGRES_CONN_TIMEOUT', count: 1284, severity: 'critical', service: 'api-gateway', first: '2h ago', trend: 'up' },
  { id: 'e2', name: 'RATE_LIMIT_EXCEEDED', count: 940, severity: 'warn', service: 'auth-proxy', first: '5h ago', trend: 'flat' },
  { id: 'e3', name: 'PAYLOAD_SIZE_LIMIT', count: 331, severity: 'warn', service: 'uploads', first: '11h ago', trend: 'flat' },
  { id: 'e4', name: 'CACHE_MISS_THRESHOLD', count: 112, severity: 'info', service: 'edge-cache', first: '1d ago', trend: 'down' },
  { id: 'e5', name: 'OUTDATED_INDEX_HINT', count: 48, severity: 'info', service: 'search', first: '2d ago', trend: 'down' },
]

export const jobs = [
  { id: 'j1', name: 'daily-attribution-rollup', status: 'running', progress: 68, eta: '0:42' },
  { id: 'j2', name: 'geo-member-sync', status: 'running', progress: 41, eta: '1:15' },
  { id: 'j3', name: 'ml-churn-weekly', status: 'queued', progress: 0, eta: '—' },
  { id: 'j4', name: 'log-archive-compact', status: 'done', progress: 100, eta: 'done' },
]

/* ---------------- AI insights ---------------- */
export const dailyDigest =
  'Since your last visit: Revenue rose 12.4% driven by the EU enterprise cohort (Azra +41 bookings). Churn ticked up 0.9pts — correlated with onboarding dropoff at day 3 after the billing migration. NPS climbed 6 pts to 61, powered by the new self-serve portal. 3 tasks are at SLA risk; the event pipeline job is 68% complete.'

export const rootCauses = [
  {
    id: 'rc1',
    metric: 'Churn +0.9pt',
    cause: 'Drop-off correlated with day-3 activation cliff following billing migration.',
    confidence: 0.83,
    tone: 'critical',
  },
  {
    id: 'rc2',
    metric: 'NPS +6pt',
    cause: 'Self-serve onboarding portal shipped in week 22 — ticket deflection +18%.',
    confidence: 0.91,
    tone: 'success',
  },
]

export const recommendations = [
  {
    id: 'r1',
    title: 'Increase ad spend on Platform Y',
    body: 'ROAS is 4.2x with untapped budget in 3 tier-2 markets.',
    tone: 'success',
    impact: 'High',
  },
  {
    id: 'r2',
    title: 'Assign senior eng to event pipeline',
    body: 'Backpressure is the likely upstream of both latency and churn flags.',
    tone: 'warn',
    impact: 'Critical',
  },
  {
    id: 'r3',
    title: 'Pause EU expansion campaign',
    body: 'Conversion dipped 14% after GDPR copy change; re-run variant A.',
    tone: 'info',
    impact: 'Medium',
  },
]

export const feedbackSentiments = [
  { id: 'f1', author: '@mzuniga', text: 'Onboarding took under 4 minutes. Genuinely smooth.', tone: 'positive' },
  { id: 'f2', author: '@kellie', text: 'Billing portal keeps timing out around noon.', tone: 'negative' },
  { id: 'f3', author: '@davio', text: 'NPS survey before product tour feels oddly timed.', tone: 'neutral' },
  { id: 'f4', author: '@shell', text: 'Love the new export intelligence — CSV dropped right in.', tone: 'positive' },
]

export const sentimentScore = { label: 'Positive', value: 72, delta: 8 }

/* ---------------- Data table universe ---------------- */
export const tableColumns = [
  { key: 'id', label: 'Order ID', pinned: 'left' },
  { key: 'customer', label: 'Customer', pinned: 'left' },
  { key: 'region', label: 'Region' },
  { key: 'plan', label: 'Plan' },
  { key: 'mrr', label: 'MRR' },
  { key: 'status', label: 'Status' },
  { key: 'renewal', label: 'Renewal' },
  { key: 'health', label: 'Health' },
]

const REGIONS = ['NA', 'EU', 'APAC', 'LATAM', 'MEA']
const PLANS = ['Starter', 'Growth', 'Scale', 'Enterprise']
const STATI = ['active', 'trialing', 'past_due', 'canceled']

export const generateRows = (count = 12000) => {
  const rows = []
  for (let i = 0; i < count; i++) {
    rows.push({
      id: `ORD-${(108400 + i * 7).toString().padStart(6, '0')}`,
      customer: `Acme ${String.fromCharCode(65 + (rnd() * 26) | 0)}${Math.floor(rnd() * 90 + 10)}`,
      region: REGIONS[Math.floor(rnd() * REGIONS.length)],
      plan: PLANS[Math.floor(rnd() * PLANS.length)],
      mrr: Math.round(rnd() * 4800 + 90),
      status: STATI[Math.floor(rnd() * 4)],
      renewal: new Date(EPOCH + rnd() * 90 * day).toISOString().slice(0, 10),
      health: Math.round(rnd() * 100),
    })
  }
  return rows
}

/* ---------------- Admin universe ---------------- */
export const rolesTree = [
  {
    name: 'Administrator',
    count: 3,
    tone: 'critical',
    children: [
      { name: 'Platform Admin', count: 2, perms: ['iam.manage', 'billing.write', 'audit.read'] },
      { name: 'Security Admin', count: 1, perms: ['iam.manage', 'logs.read', 'policy.write'] },
    ],
  },
  {
    name: 'Management',
    count: 12,
    tone: 'info',
    children: [
      { name: 'Executive', count: 1, perms: ['kpi.read', 'forecast.read', 'export.read'] },
      { name: 'Sales Manager', count: 4, perms: ['pipeline.write', 'kpi.read'] },
      { name: 'Ops Manager', count: 3, perms: ['ops.write', 'sla.override'] },
      { name: 'Marketing', count: 4, perms: ['campaign.write', 'sentiment.read'] },
    ],
  },
  {
    name: 'Operators',
    count: 86,
    tone: 'warn',
    children: [
      { name: 'Analyst', count: 42, perms: ['dashboard.read', 'export.read'] },
      { name: 'Developer', count: 31, perms: ['deploy.write', 'logs.read'] },
      { name: 'Support', count: 13, perms: ['ticket.write', 'customer.read'] },
    ],
  },
]

export const auditEvents = [
  { at: '09:41:12', actor: 'ava.chen', action: 'role.grant', target: 'sales-manager', tone: 'warn' },
  { at: '09:38:44', actor: 'system', action: 'deploy.prod', target: 'api-gateway v2.4.1', tone: 'info' },
  { at: '09:12:07', actor: 'm.vazquez', action: 'environment.switch', target: 'prod', tone: 'success' },
  { at: '08:57:30', actor: 'r.diaz', action: 'task.assign', target: 't6 → rd', tone: 'success' },
  { at: '08:41:02', actor: 'j.chen', action: 'bookmark.create', target: 'EU enterprise funnel', tone: 'warn' },
  { at: '08:22:19', actor: 'system', action: 'alert.ack', target: 'churn σ2.1', tone: 'critical' },
]

export const users2fa = [
  { name: 'Ava Chen', email: 'ava.chen@ideon.co', role: 'Executive', enabled: true },
  { name: 'Marco Vazquez', email: 'm.vazquez@ideon.co', role: 'Sales Manager', enabled: true },
  { name: 'Ria Diaz', email: 'r.diaz@ideon.co', role: 'Ops Manager', enabled: false },
  { name: 'Jonah Kim', email: 'j.kim@ideon.co', role: 'Sales Manager', enabled: true },
  { name: 'Sam Keller', email: 's.keller@ideon.co', role: 'Analyst', enabled: true },
  { name: 'Nina Park', email: 'n.park@ideon.co', role: 'Developer', enabled: false },
  { name: 'Tomas Reyes', email: 't.reyes@ideon.co', role: 'Support', enabled: false },
]

/* ---------------- Notifications pool ---------------- */
export const notificationPool = [
  { title: 'Churn SDK breach', body: 'Retention cohort fell below 96th percentile norm.', tone: 'critical' },
  { title: 'Deploy succeeded', body: 'api-gateway v2.4.1 reached 100% of prod nodes.', tone: 'success' },
  { title: 'SLA risk', body: '"Churn cohort analysis" breaches in 32 minutes.', tone: 'warn' },
  { title: 'Revenue milestone', body: 'ARPU crossed $96 — new company record.', tone: 'info' },
  { title: 'Pipeline idle', body: 'Event pipeline backlog cleared after retry storm.', tone: 'success' },
]

export const TICKER_SEED = [
  'sessions/s 4,182 ▴',
  'p99 latency 214ms ▾',
  'signups +38 ▴',
  'conversion 3.4% ▴',
  'churn 3.6% ▴',
  'ARR $19.8M ▴',
  'jobs running 2',
  'errors/min 6 ▾',
]

/* ---------------- admin universe ---------------- */
export const licenseUsers = [
  { email: 'ava.chen@ideon.co', role: 'Executive', expiry: '2027-03-31', active: true },
  { email: 'm.vazquez@ideon.co', role: 'Sales Manager', expiry: '2026-12-31', active: true },
  { email: 'r.diaz@ideon.co', role: 'Ops Manager', expiry: '2026-12-31', active: true },
  { email: 'j.kim@ideon.co', role: 'Sales Manager', expiry: '2027-01-31', active: true },
  { email: 's.keller@ideon.co', role: 'Analyst', expiry: '2026-10-15', active: true },
  { email: 'n.park@ideon.co', role: 'Developer', expiry: '2027-06-30', active: false },
  { email: 't.reyes@ideon.co', role: 'Support', expiry: '2027-03-31', active: true },
]

export const scheduledJobsSeed = [
  { id: 'j1', name: 'Revenue rollup', cron: '0 6 * * *', last: '06:00:22', next: 'tomorrow 06:00', ok: true },
  { id: 'j2', name: 'Retention cohort', cron: '0 2 * * MON', last: 'Mon 02:00:04', next: 'next Mon 02:00', ok: true },
  { id: 'j3', name: 'Geo sync', cron: '*/15 * * * *', last: '09:45:11', next: '09:45:31', ok: true },
  { id: 'j4', name: 'Digest emails', cron: '30 7 * * 1', last: 'Mon 07:30:00', next: 'next Mon 07:30', ok: false },
]

export const apiKeysSeed = [
  { id: 'k1', name: 'clients.api', prefix: 'ideon_e7b2fa', lastUsed: '2m ago', calls: 12841, revoked: false },
  { id: 'k2', name: 'data-pipeline', prefix: 'ideon_d4a1c9', lastUsed: '14m ago', calls: 94022, revoked: false },
  { id: 'k3', name: 'legacy-sync', prefix: 'ideon_91f3ab', lastUsed: '3d ago', calls: 1782, revoked: true },
]

export const webhooksSeed = [
  { id: 'w1', name: 'Slack #alerts', url: 'https://hooks.slack.com/services/…', secret: '****', ok: true },
  { id: 'w2', name: 'Webhooks.dev', url: 'https://webhooks.dev/prod', secret: '****', ok: true },
]

export const retentionSeed = [
  { id: 'r1', table: 'audit_events', days: 90, pages: 0.4, nextPurge: 'in 41d' },
  { id: 'r2', table: 'api_key_usage', days: 180, pages: 1.2, nextPurge: 'in 132d' },
  { id: 'r3', table: 'sessions', days: 30, pages: 0.1, nextPurge: 'in 12d' },
  { id: 'r4', table: 'temp_views', days: 7, pages: 0.6, nextPurge: 'in 2d' },
]

export const ipSeed = {
  allow: ['10.23.0.0/16', '203.0.113.10'],
  block: ['192.0.2.5', '203.0.113.99'],
  log: [
    { ip: '203.0.113.99', verdict: 'blocked', at: '09:44:18', reason: 'geo-mismatch' },
    { ip: '10.23.4.12', verdict: 'allowed', at: '09:43:02', reason: 'allowlist' },
  ],
}

export const rateSeed = [
  { id: 'rl1', endpoint: '/api/v1/graph', perMin: 120, burst: 240, logs: 22 },
  { id: 'rl2', endpoint: '/api/v1/export', perMin: 30, burst: 60, logs: 4 },
  { id: 'rl3', endpoint: '/api/v1/tasks', perMin: 400, burst: 800, logs: 1 },
]

export const FLAG_GROUPS = ['universal', 'user', 'admin', 'wow']

export const PALETTES = [
  { id: 'default', label: 'Default' },
  { id: 'protanopia', label: 'Protanopia' },
  { id: 'deuteranopia', label: 'Deuteranopia' },
  { id: 'tritanopia', label: 'Tritanopia' },
  { id: 'monochrome', label: 'Monochrome' },
  { id: 'high-contrast', label: 'High contrast' },
]

export const ACH_BADGES = [
  { id: 'saved-view', label: 'First save', hint: 'Saved your first view', icon: 'Bookmark' },
  { id: 'power-user', label: 'Power user', hint: '20+ interactions today', icon: 'Zap' },
  { id: 'macro', label: 'Automator', hint: 'Recorded a macro', icon: 'Workflow' },
  { id: 'explainer', label: 'Explainer', hint: 'Used Help-Me-Understand', icon: 'Sparkles' },
  { id: 'ghostbuster', label: 'Ghostbuster', hint: 'Turned on comparison ghost', icon: 'Ghost' },
]

export const ENV_METRICS = {
  dev: { revenue: 1284, latency: 401, errors: 22, users: 1180 },
  staging: { revenue: 1290, latency: 208, errors: 4, users: 4920 },
  prod: { revenue: 1284000, latency: 214, errors: 6, users: 48213 },
}

export const SELF_HEATMAP_SEED = (() => {
  const out = []
  for (let d = 0; d < 21; d++) {
    const dayKey = new Date(EPOCH + d * day).toISOString().slice(0, 10)
    out.push({ day: dayKey, hours: [] })
    for (let h = 0; h < 24; h++) {
      const v = h < 8 || h > 19 ? 0 : Math.round(mulberry32(d * 31 + h)() * 6)
      out[d].hours.push(v)
    }
  }
  return out
})()

export const SQL_TEMPLATES = [
  { label: 'Top regions by revenue', sql: 'SELECT region, SUM(revenue) FROM metrics GROUP BY region ORDER BY 2 DESC LIMIT 8' },
  { label: 'Slowest endpoints', sql: 'SELECT endpoint, AVG(p99) FROM latencies GROUP BY endpoint ORDER BY 2 DESC LIMIT 5' },
  { label: 'Active seats', sql: 'SELECT role, COUNT(*) FROM users WHERE active = true GROUP BY role' },
]