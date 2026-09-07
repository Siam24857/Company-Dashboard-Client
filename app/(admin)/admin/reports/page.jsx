'use client';

import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import styles from './page.module.css';

const REPORT_TYPES = [
  { id: 'executive', title: 'Executive Summary', icon: '📊', description: 'High-level overview of all operations and key performance indicators.' },
  { id: 'user', title: 'User Report', icon: '👥', description: 'User registrations, activity, and engagement statistics.' },
  { id: 'employee', title: 'Employee Report', icon: '💼', description: 'Employee roster, attendance, and performance metrics.' },
  { id: 'team', title: 'Team Report', icon: '🤝', description: 'Team composition, collaboration, and productivity analysis.' },
  { id: 'project', title: 'Project Report', icon: '📁', description: 'Project status, timelines, milestones, and completion rates.' },
  { id: 'task', title: 'Task Report', icon: '✅', description: 'Task distribution, completion rates, and backlog analysis.' },
  { id: 'financial', title: 'Financial Report', icon: '💰', description: 'Revenue, expenses, budgets, and financial forecasting.' },
  { id: 'transaction', title: 'Transaction Report', icon: '🔄', description: 'Transaction volumes, processing times, and reconciliation.' },
  { id: 'activity', title: 'Activity Log', icon: '📋', description: 'System-wide activity logs and audit trail summary.' },
  { id: 'security', title: 'Security Report', icon: '🔒', description: 'Security events, login attempts, and threat analysis.' },
  { id: 'performance', title: 'Performance Report', icon: '⚡', description: 'System performance metrics, uptime, and response times.' },
  { id: 'announcement', title: 'Announcement Report', icon: '📢', description: 'Announcement reach, engagement, and distribution stats.' },
];

const DATE_RANGES = [
  { label: 'Today', value: 'today' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
  { label: '6 Months', value: '6m' },
  { label: '1 Year', value: '1y' },
];

function ReportPreview({ report, dateRange }) {
  const now = new Date();
  const rangeLabel = DATE_RANGES.find(d => d.value === dateRange)?.label || dateRange;

  return (
    <div className={styles.preview}>
      <div className={styles.previewContent} id="report-preview">
        <div className={styles.previewHeader}>
          <div className={styles.previewLogo}>
            <span className={styles.logoIcon}>⚡</span>
            <span className={styles.logoText}>IDEONS</span>
          </div>
          <div className={styles.previewTitle}>
            <h2>{report.title}</h2>
            <p>Generated: {now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p>Period: {rangeLabel}</p>
          </div>
        </div>

        <div className={styles.previewDivider} />

        <div className={styles.previewSection}>
          <h3>Executive Summary</h3>
          <div className={styles.statsGrid}>
            <div className={styles.previewStat}>
              <span className={styles.previewStatValue}>1,248</span>
              <span className={styles.previewStatLabel}>Total Records</span>
            </div>
            <div className={styles.previewStat}>
              <span className={styles.previewStatValue}>89%</span>
              <span className={styles.previewStatLabel}>Completion Rate</span>
            </div>
            <div className={styles.previewStat}>
              <span className={styles.previewStatValue}>+12%</span>
              <span className={styles.previewStatLabel}>Growth</span>
            </div>
            <div className={styles.previewStat}>
              <span className={styles.previewStatValue}>4.8</span>
              <span className={styles.previewStatLabel}>Score</span>
            </div>
          </div>
        </div>

        <div className={styles.previewSection}>
          <h3>Performance Overview</h3>
          <div className={styles.chartPlaceholder}>
            <div className={styles.chartBars}>
              {[65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 70, 85].map((h, i) => (
                <div key={i} className={styles.chartBar} style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className={styles.chartLabels}>
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span>
              <span>May</span><span>Jun</span><span>Jul</span><span>Aug</span>
              <span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
            </div>
          </div>
        </div>

        <div className={styles.previewSection}>
          <h3>Key Findings</h3>
          <ul className={styles.findingsList}>
            <li>Overall performance has improved by 12% compared to the previous period.</li>
            <li>User engagement metrics show consistent growth across all segments.</li>
            <li>Operational efficiency targets have been met for the reporting period.</li>
            <li>System uptime maintained at 99.9% with zero critical incidents.</li>
          </ul>
        </div>

        <div className={styles.previewFooter}>
          <div className={styles.footerDivider} />
          <p>Generated by IDEONS Admin &bull; Confidential</p>
          <p>© {now.getFullYear()} IDEONS. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [dateRange, setDateRange] = useState('30d');
  const [generating, setGenerating] = useState(false);
  const printRef = useRef(null);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 1500);
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className={styles.page}>
      {!selectedReport ? (
        <>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Report Generator</h1>
              <p className={styles.subtitle}>Generate comprehensive PDF reports for analysis and sharing.</p>
            </div>
          </div>

          <div className={styles.grid}>
            {REPORT_TYPES.map((report) => (
              <div key={report.id} className={styles.card} onClick={() => setSelectedReport(report)}>
                <div className={styles.cardIcon}>{report.icon}</div>
                <h3 className={styles.cardTitle}>{report.title}</h3>
                <p className={styles.cardDesc}>{report.description}</p>
                <button className={styles.generateBtn}>Generate</button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className={styles.header}>
            <button className={styles.backBtn} onClick={() => setSelectedReport(null)}>
              ← Back to Reports
            </button>
            <h1 className={styles.title}>{selectedReport.icon} {selectedReport.title}</h1>
          </div>

          <div className={styles.configPanel}>
            <div className={styles.configSection}>
              <label className={styles.configLabel}>Date Range</label>
              <div className={styles.dateOptions}>
                {DATE_RANGES.map((range) => (
                  <button
                    key={range.value}
                    className={cn(styles.dateBtn, dateRange === range.value && styles.dateBtnActive)}
                    onClick={() => setDateRange(range.value)}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.configSection}>
              <label className={styles.configLabel}>Format</label>
              <div className={styles.formatBadge}>📄 PDF</div>
            </div>

            <div className={styles.configActions}>
              <button className={styles.genBtn} onClick={handleGenerate} disabled={generating}>
                {generating ? '⏳ Generating...' : '⚡ Generate Report'}
              </button>
              <button className={styles.downloadBtn} onClick={handleDownload}>⬇ Download PDF</button>
            </div>
          </div>

          {generating && (
            <div className={styles.loadingOverlay}>
              <div className={styles.spinner} />
              <p>Generating your report...</p>
            </div>
          )}

          {!generating && (
            <div ref={printRef}>
              <ReportPreview report={selectedReport} dateRange={dateRange} />
            </div>
          )}
        </>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #report-preview, #report-preview * { visibility: visible; }
          #report-preview {
            position: absolute;
            left: 0; top: 0;
            width: 100%;
            background: white;
            color: #1a1a2e;
            padding: 40px;
          }
          #report-preview h2, #report-preview h3 { color: #1a1a2e; }
          #report-preview p, #report-preview span, #report-preview li { color: #333; }
        }
      `}</style>
    </div>
  );
}
