import { quarterly, yearly, geoPoints, KPI_DEFS, monthLabels } from './mock'
import { detectChartType } from './utils'

/**
 * The "Brain". Maps a natural-language utterance to either:
 *  - a visual spec (chart/dial/heatmap the UI can render), or
 *  - an action (navigate / toggle / go to route), or
 *  - a rich text answer with citations.
 */
export const resolveQuery = (raw) => {
  const q = raw.trim().toLowerCase()
  if (!q) return { kind: 'empty' }

  /* ---- commands ---- */
  if (q.startsWith('/export')) {
    return { kind: 'action', action: 'export', label: 'Export current view' }
  }
  if (q.startsWith('/bookmark')) {
    return { kind: 'action', action: 'bookmark', label: 'Bookmark current view' }
  }
  if (q.startsWith('/theme')) {
    return { kind: 'action', action: 'theme', label: 'Toggle light/dark theme' }
  }
  if (q.startsWith('/focus')) {
    return { kind: 'action', action: 'focus', label: 'Enter Focus Mode' }
  }
  if (q.startsWith('/env')) {
    const env = q.includes('dev') ? 'dev' : q.includes('staging') ? 'staging' : 'prod'
    return { kind: 'action', action: 'env', env, label: `Switch to ${env}` }
  }
  if (/(go to|navigate|open|show me the) (tasks|task)/.test(q)) {
    return { kind: 'action', action: 'nav', target: 'tasks', label: 'Open Task Workflow' }
  }
  if (/(go to|navigate|open|show me the) (health|system|infra|resources)/.test(q)) {
    return { kind: 'action', action: 'nav', target: 'health', label: 'Open System Health' }
  }
  if (/(go to|navigate|open|show me the) (table|data|orders|records)/.test(q)) {
    return { kind: 'action', action: 'nav', target: 'data', label: 'Open Data Table' }
  }
  if (/(impersonat|sign ?out|logout)/.test(q)) {
    return { kind: 'action', action: 'impersonate', label: 'Enter Impersonation mode' }
  }

  /* ---- geospatial heatmap ---- */
  if (/(map|region|geo|heatmap|where)/.test(q)) {
    return {
      kind: 'visual',
      visual: 'geospatial',
      title: 'Geospatial activity heat',
      query: raw,
      points: geoPoints,
      suggested: true,
    }
  }

  /* ---- KPI focus ---- */
  const kpiMatch = KPI_DEFS.find((k) => q.includes(k.label.toLowerCase()) || (k.id === 'users' && /(user|signup|active)/.test(q)))
  if (/goal|target/.test(q) && kpiMatch) {
    return {
      kind: 'visual',
      visual: 'dial',
      title: `${kpiMatch.label} — goal vs actual`,
      query: raw,
      kpi: kpiMatch,
      suggested: true,
    }
  }

  /* ---- revenue / costs comparison ---- */
  const metrics = []
  if (/revenue|sales|income|total/.test(q)) metrics.push('revenue')
  if (/cost|spend|expense|burn/.test(q)) metrics.push('costs')
  if (/profit|margin|arpu/.test(q)) metrics.push('profit')

  const period = /year|12 month|annual/.test(q)
    ? { labels: yearly.labels, revenue: yearly.revenue, costs: yearly.costs, profit: yearly.profit, scale: 1 }
    : { labels: monthLabels, revenue: quarterly.revenue, costs: quarterly.costs, profit: quarterly.profit, scale: 1000 }

  const keys = metrics.length ? metrics : ['revenue', 'costs']
  const ds = keys
    .filter((k) => period[k])
    .map((k, i) => ({
      name: k === 'revenue' ? 'Revenue' : k === 'costs' ? 'Costs' : 'Profit',
      key: k,
      data: period[k].map((v) => v * period.scale),
      color: i === 0 ? 'var(--green)' : i === 1 ? 'var(--red)' : 'var(--violet)',
    }))

  const type = detectChartType(q, ds[0]?.data, keys)

  if (metrics.length || /chart|graph|plot|trend|show me|visual|compared|over time|vs|versus|last|history|revenue|sales|cost|profit/.test(q)) {
    return {
      kind: 'visual',
      visual: 'chart',
      query: raw,
      type,
      title: `${keys.map((k) => k[0].toUpperCase() + k.slice(1)).join(' vs ')} · ${period.labels[0]}→${period.labels[period.labels.length - 1]}`,
      labels: period.labels,
      datasets: ds,
      suggested: !!metrics.length || /chart|graph|plot|show me/.test(q),
    }
  }

  return {
    kind: 'text',
    answer: aiAnswer(q, { kpiMatch }),
    query: raw,
  }
}

const aiAnswer = (q, { kpiMatch }) => {
  const base =
    'Revenue is tracking 12.4% above forecast for this quarter, churn is the only metric red-flagging (2.1σ deviation).'
  if (kpiMatch) return `${base} For ${kpiMatch.label}: actual ${kpiMatch.value}, target ${kpiMatch.goal} — forecast projects hitting target in ~3 days.`
  if (/churn/.test(q)) return 'Churn rose 0.9pt this week, correlated with the day-3 activation cliff after the billing migration. Recommend triaging that cohort before the weekly rollup.'
  if (/customers?|who|sentiment/.test(q)) return 'Feedback sentiment is 72% positive (+8pt vs last week). Top driver: self-serve portal. Top detractors: billing portal timeouts around noon.'
  return base
}

export const QUICK_SUGGESTIONS = [
  'Show me revenue vs costs for the last 6 months',
  'Why is churn trending up?',
  'Map geographical activity',
  'What is NPS vs target?',
  '/export current view',
  'open tasks',
]

/* ---------------- smart alias search ---------------- */
export const ALIASES = [
  { match: /last quarter|past quarter|q4|previous 3 months/, mods: { timeWindow: 2160, label: 'time → last quarter' } },
  { match: /last (week|7 days)/, mods: { timeWindow: 168, label: 'time → last week' } },
  { match: /last month|past month/, mods: { timeWindow: 720, label: 'time → last month' } },
  { match: /last 6 months|six months/, mods: { timeWindow: 2160, label: 'time → last 6 months' } },
  { match: /last (year|12 months|annual)/, mods: { timeWindow: 8760, label: 'time → last year' } },
  { match: /(ghost|overlay) (prev|previous|last month)/, mods: { ghost: true, ghostDays: 30, label: 'ghost → prev month vs now' } },
  { match: /(ghost|overlay) (previous quarter)/, mods: { ghost: true, ghostDays: 90, label: 'ghost → prev quarter' } },
  { match: /dark mode|theme toggle/, mods: { action: 'theme', label: 'toggle theme' } },
  { match: /presentation|slideshow|story ,?mode/, mods: { action: 'story', label: 'enter Story Mode' } },
  { match: /scrub|anonymi[sz]e|hide pii/, mods: { action: 'scrub', label: 'toggle PII scrub' } },
  { match: /focus ?mode/, mods: { action: 'focus', label: 'enter Focus Mode' } },
  { match: /explain (?!churn)/, mods: { action: 'explain', label: 'explain current metric' } },
  { match: /admin|permissions|access/, mods: { action: 'admin', label: 'open Admin Cockpit' } },
]

export const resolveAlias = (raw) => {
  const q = raw.toLowerCase()
  const hit = ALIASES.find((a) => a.match.test(q))
  return hit || null
}

/* ---------------- help me understand ---------------- */
export const explainKpi = (kpi) => {
  const status =
    kpi.value >= kpi.goal
      ? `already ${kpi.goal ? Math.round((kpi.value / kpi.goal) * 100) : 100}% of the ${kpi.goal?.toLocaleString?.() || 'target'} goal — ahead of schedule`
      : `tracking at ${Math.round((kpi.value / kpi.goal) * 100)}% of the ${kpi.goal?.toLocaleString?.() || 'target'} goal`
  const tone = kpi.tone === 'critical' ? 'a red flag' : kpi.tone === 'warn' ? 'worth watching' : 'healthy'
  const verdict =
    kpi.change > 0 && kpi.trend === 'up'
      ? `, up ${kpi.change.toFixed(1)}% vs last period, which is ${tone}`
      : kpi.change > 0
        ? `, moving ${kpi.change.toFixed(1)}% — treat as a deviation`
        : `, down ${Math.abs(kpi.change).toFixed(1)}% — generally considered positive here`
  const note = kpi.anomaly ? ` Anomaly flagged: ${kpi.anomaly.msg}.` : ''
  return `${kpi.label} currently shows ${kpi.value.toLocaleString()}${kpi.unit === 'percent' ? '%' : kpi.unit === 'currency' ? ' USD' : ''} and is ${status}${verdict}. It means the business moved ${kpi.unit === 'percent' ? 'in customer retention terms' : kpi.unit === 'currency' ? 'in cash terms' : 'in platform adoption terms'} compared to expectations.${note} Benchmark: ${kpi.benchmark?.label || 'n/a'} ${kpi.benchmark?.value || '—'}.`
}

/* ---------------- threshold whisperer phrase parsing ---------------- */
export const parseThreshold = (raw) => {
  const q = raw
  const ops = []
  if (/below|under|drops? below|less than/.test(q)) ops.push('below')
  if (/above|over|exceeds|greater than|more than/.test(q)) ops.push('above')
  if (/around|hits|equals|at /.test(q)) ops.push('equals')
  const metric = q.match(/revenue|sales|users|churn|latency|errors?|nps/i)?.[0]?.toLowerCase() || 'revenue'
  const num = q.match(/\d[\d,.]*/)?.[0]?.replace(/,/g, '')
  if (!num) return null
  return { metric, op: ops[0] || 'equals', value: Number(num) }
}