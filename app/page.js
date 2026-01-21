'use client'

import { useState, useEffect } from 'react'

// Priority order for sorting (lower number = higher priority)
const PRIORITY_ORDER = {
  'Urgent': 1,
  'High': 2,
  'Medium': 3,
  'Low': 4,
  null: 5,
  undefined: 5
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata'
  })
}

function formatReportDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata'
  })
}

function isOverdue(dateString) {
  if (!dateString) return false
  const due = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return due < today
}

function isDueToday(dateString) {
  if (!dateString) return false
  const due = new Date(dateString)
  const today = new Date()
  return due.toDateString() === today.toDateString()
}

function sortByPriority(items) {
  return [...items].sort((a, b) => {
    const priorityA = PRIORITY_ORDER[a.priority] || 5
    const priorityB = PRIORITY_ORDER[b.priority] || 5
    return priorityA - priorityB
  })
}

function StatusBadge({ status }) {
  const statusClass = status.toLowerCase().replace(/ /g, '-')
  return <span className={`status-badge ${statusClass}`}>{status}</span>
}

function PriorityBadge({ priority }) {
  if (!priority) return null
  const priorityClass = priority.toLowerCase().replace(/ /g, '-')
  return <span className={`ticket-priority ${priorityClass}`}>{priority}</span>
}

function TreeItem({ item, depth = 0, isLast = false }) {
  const branch = depth === 0 ? '├── ' : (isLast ? ' └── ' : ' ├── ')

  return (
    <>
      <div className="tree-item" style={{ paddingLeft: depth * 16 }}>
        <span className="branch">{branch}</span>
        <span style={{ color: '#f59e0b' }}>{item.id}</span>
        <span>—</span>
        <span>{item.title}</span>
        <StatusBadge status={item.status} />
        {item.assignee && <span className="assignee">({item.assignee})</span>}
        {item.team && <span className="team-tag">{item.team}</span>}
        {item.estimate && <span className="team-tag">{item.estimate}</span>}
      </div>
      {item.subIssues && item.subIssues.map((sub, idx) => (
        <TreeItem
          key={sub.id}
          item={sub}
          depth={depth + 1}
          isLast={idx === item.subIssues.length - 1}
        />
      ))}
    </>
  )
}

function CollapsibleSection({ title, count, children, icon, colorClass, defaultExpanded = false, summary }) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const displayCount = expanded ? count : Math.min(count, 5)

  return (
    <section className={`section section-${colorClass}`}>
      <div className="section-header" onClick={() => setExpanded(!expanded)}>
        <div className="section-header-left">
          <span className={`status-dot ${colorClass}`}></span>
          <h2>{icon} {title}</h2>
          <span className="count">{count}</span>
        </div>
        <button className="expand-btn">
          {expanded ? '▼ Collapse' : '▶ Expand'}
        </button>
      </div>
      {summary && (
        <div className="section-summary">
          {summary}
        </div>
      )}
      <div className="section-content">
        {children}
      </div>
      {!expanded && count > 5 && (
        <div className="show-more" onClick={() => setExpanded(true)}>
          + {count - 5} more items
        </div>
      )}
    </section>
  )
}

function TicketCard({ ticket }) {
  const overdue = isOverdue(ticket.dueDate)
  const dueToday = isDueToday(ticket.dueDate)

  return (
    <div className="ticket-card">
      <div className="ticket-card-header">
        <div className="ticket-card-title">
          <span className="id">{ticket.id}</span>
          <h3>
            <a href={ticket.url} target="_blank" rel="noopener noreferrer">
              {ticket.title}
            </a>
          </h3>
        </div>
        <PriorityBadge priority={ticket.priority} />
      </div>

      <div className="ticket-card-meta">
        <span><strong>Assignee:</strong> {ticket.assignee}</span>
        {ticket.dueDate && (
          <span className={`due-date ${overdue ? 'overdue' : ''}`}>
            <strong>Due:</strong> {ticket.dueDate}
            {overdue && ' ⚠️ OVERDUE'}
            {dueToday && ' (TODAY)'}
          </span>
        )}
        {ticket.progress && <span><strong>Progress:</strong> {ticket.progress}</span>}
      </div>

      {ticket.description && (
        <p className="ticket-card-description">{ticket.description}</p>
      )}

      {ticket.latestUpdate && (
        <div className="ticket-card-update">
          <strong>Latest:</strong> {ticket.latestUpdate}
        </div>
      )}

      {ticket.labels && ticket.labels.length > 0 && (
        <div className="labels">
          {ticket.labels.map(label => (
            <span key={label} className="label-tag">{label}</span>
          ))}
        </div>
      )}

      {ticket.subIssues && ticket.subIssues.length > 0 && (
        <div className="sub-issues">
          <div className="sub-issues-header">
            <span>Sub-issues</span>
            {ticket.progress && <span className="progress">{ticket.progress}</span>}
          </div>
          <div className="tree">
            {ticket.subIssues.map((sub, idx) => (
              <TreeItem
                key={sub.id}
                item={sub}
                isLast={idx === ticket.subIssues.length - 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TicketRow({ ticket, showContext = false }) {
  return (
    <a href={ticket.url} target="_blank" rel="noopener noreferrer" className="ticket-row">
      <span className="ticket-id">{ticket.id}</span>
      <div className="ticket-info">
        <span className="ticket-title">{ticket.title}</span>
        {showContext && ticket.description && (
          <span className="ticket-context">{ticket.description.substring(0, 100)}...</span>
        )}
      </div>
      <span className="ticket-assignee">{ticket.assignee}</span>
      <PriorityBadge priority={ticket.priority} />
    </a>
  )
}

function OverviewSummary({ data }) {
  const totalActive = data.summary.inDevelopment + data.summary.readyForQA + data.summary.readyForRelease
  const completionRate = data.summary.completed24h > 0 ?
    Math.round((data.summary.completed24h / (data.summary.completed24h + totalActive)) * 100) : 0

  // Count urgent/high priority items
  const urgentItems = [
    ...(data.inDevelopment || []),
    ...(data.readyForQA || []),
    ...(data.readyForRelease || []),
    ...(data.readyForDev || [])
  ].filter(t => t.priority === 'Urgent' || t.priority === 'High').length

  // Count overdue items
  const overdueItems = (data.actionItems || []).filter(i => i.action.includes('Overdue')).length

  return (
    <div className="overview-summary">
      <h2>📊 Daily Overview</h2>
      <div className="overview-content">
        <div className="overview-stat">
          <span className="stat-value highlight-green">{data.summary.completed24h}</span>
          <span className="stat-label">Completed Today</span>
        </div>
        <div className="overview-stat">
          <span className="stat-value highlight-blue">{totalActive}</span>
          <span className="stat-label">In Pipeline</span>
        </div>
        <div className="overview-stat">
          <span className="stat-value highlight-orange">{urgentItems}</span>
          <span className="stat-label">High Priority</span>
        </div>
        <div className="overview-stat">
          <span className="stat-value highlight-red">{overdueItems}</span>
          <span className="stat-label">Overdue</span>
        </div>
      </div>
      <div className="overview-narrative">
        <p>
          <strong>Summary:</strong> The team completed <strong>{data.summary.completed24h} tickets</strong> in the last 24 hours.
          Currently, <strong>{data.summary.readyForRelease} ticket(s)</strong> are ready for production release,
          <strong> {data.summary.readyForQA}</strong> awaiting QA, and <strong>{data.summary.inDevelopment}</strong> actively in development.
          {overdueItems > 0 && <span className="alert-text"> ⚠️ {overdueItems} item(s) are overdue and need immediate attention.</span>}
          {data.summary.blockers > 0 && <span className="alert-text"> 🚫 {data.summary.blockers} blocker(s) identified.</span>}
        </p>
      </div>
    </div>
  )
}

function ActionItem({ item }) {
  return (
    <div className="action-item">
      <div className={`indicator ${item.priority}`}></div>
      <div className="content">
        <div className="item-header">
          <span className="item-id">{item.item}</span>
        </div>
        <div className="item-title">{item.title}</div>
        <div className="action-text">{item.action}</div>
        {item.assignee && (
          <div className="item-assignee">👤 {item.assignee}</div>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState({})

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/data.json?' + Date.now())
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error('Failed to fetch data:', err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">
          <div className="loading-spinner"></div>
          Loading report...
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="dashboard">
        <div className="empty-state">
          Failed to load report data.
        </div>
      </div>
    )
  }

  // Sort all lists by priority
  const sortedCompleted = sortByPriority(data.completed || [])
  const sortedReadyForRelease = sortByPriority(data.readyForRelease || [])
  const sortedReadyForQA = sortByPriority(data.readyForQA || [])
  const sortedInDevelopment = sortByPriority(data.inDevelopment || [])
  const sortedReadyForDev = sortByPriority(data.readyForDev || [])

  // Enrich action items with assignee info
  const enrichedActionItems = (data.actionItems || []).map(item => {
    const allTickets = [
      ...(data.completed || []),
      ...(data.readyForRelease || []),
      ...(data.readyForQA || []),
      ...(data.inDevelopment || []),
      ...(data.readyForDev || [])
    ]
    const ticket = allTickets.find(t => t.id === item.item)
    return {
      ...item,
      title: item.title || ticket?.title || 'Unknown',
      assignee: ticket?.assignee || 'Unassigned'
    }
  })

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <h1>
            Daily Report - {formatReportDate(data.generatedAt)}
            <span className="team-badge">ENG</span>
          </h1>
          <div className="timestamp">
            Generated: {formatDate(data.generatedAt)}
          </div>
        </div>
        <div className="header-right">
          <button className="refresh-btn" onClick={fetchData}>
            ↻ Refresh
          </button>
        </div>
      </header>

      {/* Overview Summary */}
      <OverviewSummary data={data} />

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card completed">
          <div className="label">Completed (24h)</div>
          <div className="value">{data.summary.completed24h}</div>
        </div>
        <div className="summary-card release">
          <div className="label">Ready for Release</div>
          <div className="value">{data.summary.readyForRelease}</div>
        </div>
        <div className="summary-card qa">
          <div className="label">Ready for QA</div>
          <div className="value">{data.summary.readyForQA}</div>
        </div>
        <div className="summary-card dev">
          <div className="label">In Development</div>
          <div className="value">{data.summary.inDevelopment}</div>
        </div>
        <div className="summary-card ready">
          <div className="label">Ready for Dev</div>
          <div className="value">{data.summary.readyForDev}</div>
        </div>
        <div className="summary-card blockers">
          <div className="label">Blockers</div>
          <div className="value">{data.summary.blockers}</div>
        </div>
      </div>

      <div className="two-column">
        <div>
          {/* Completed Section */}
          {sortedCompleted.length > 0 && (
            <CollapsibleSection
              title="Completed (last 24h)"
              count={sortedCompleted.length}
              icon="✅"
              colorClass="done"
              defaultExpanded={sortedCompleted.length <= 5}
              summary={`${sortedCompleted.length} ticket(s) were resolved in the last 24 hours. Great progress by the team!`}
            >
              <div className="ticket-list">
                {sortedCompleted.map((ticket, idx) => (
                  <TicketRow key={ticket.id} ticket={ticket} />
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Ready for Release */}
          {sortedReadyForRelease.length > 0 && (
            <CollapsibleSection
              title="Ready for Release"
              count={sortedReadyForRelease.length}
              icon="🚀"
              colorClass="release"
              defaultExpanded={true}
              summary={`${sortedReadyForRelease.length} ticket(s) have passed QA and are ready to be deployed to production.`}
            >
              <div className="ticket-list detailed">
                {sortedReadyForRelease.map(ticket => (
                  <TicketRow key={ticket.id} ticket={ticket} showContext={true} />
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Ready for QA */}
          {sortedReadyForQA.length > 0 && (
            <CollapsibleSection
              title="Ready for QA"
              count={sortedReadyForQA.length}
              icon="🧪"
              colorClass="qa"
              defaultExpanded={true}
              summary={`${sortedReadyForQA.length} ticket(s) have been developed and are awaiting quality assurance testing.`}
            >
              <div className="ticket-list detailed">
                {sortedReadyForQA.map(ticket => (
                  <TicketRow key={ticket.id} ticket={ticket} showContext={true} />
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* In Development - Now after Ready for QA */}
          {sortedInDevelopment.length > 0 && (
            <CollapsibleSection
              title="In Development"
              count={sortedInDevelopment.length}
              icon="💻"
              colorClass="dev"
              defaultExpanded={sortedInDevelopment.length <= 5}
              summary={`${sortedInDevelopment.length} ticket(s) are currently being worked on by the engineering team.`}
            >
              {sortedInDevelopment.map(ticket => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </CollapsibleSection>
          )}

          {/* Ready for Development */}
          {sortedReadyForDev.length > 0 && (
            <CollapsibleSection
              title="Ready for Development"
              count={sortedReadyForDev.length}
              icon="📋"
              colorClass="ready"
              defaultExpanded={false}
              summary={`${sortedReadyForDev.length} ticket(s) are prioritized and ready to be picked up for development.`}
            >
              <div className="ticket-list">
                {sortedReadyForDev.map(ticket => (
                  <TicketRow key={ticket.id} ticket={ticket} />
                ))}
              </div>
            </CollapsibleSection>
          )}
        </div>

        {/* Action Items Sidebar */}
        <div>
          {enrichedActionItems.length > 0 && (
            <div className="action-items">
              <h2>⚡ Action Items</h2>
              <div className="action-items-summary">
                {enrichedActionItems.length} items requiring attention
              </div>
              {enrichedActionItems.map((item, idx) => (
                <ActionItem key={idx} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
