'use client'

import { useState, useEffect } from 'react'

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
  const branch = depth === 0 ? '├── ' : (isLast ? '    └── ' : '    ├── ')
  
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

function TicketRow({ ticket }) {
  return (
    <a href={ticket.url} target="_blank" rel="noopener noreferrer" className="ticket-row">
      <span className="ticket-id">{ticket.id}</span>
      <span className="ticket-title">{ticket.title}</span>
      <span className="ticket-assignee">{ticket.assignee}</span>
      <PriorityBadge priority={ticket.priority} />
    </a>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <h1>
            Daily Report
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
          {data.completed && data.completed.length > 0 && (
            <section className="section">
              <div className="section-header">
                <span className="status-dot done"></span>
                <h2>Completed (last 24h)</h2>
                <span className="count">{data.completed.length}</span>
              </div>
              <div className="ticket-list">
                {data.completed.map(ticket => (
                  <TicketRow key={ticket.id} ticket={ticket} />
                ))}
              </div>
            </section>
          )}

          {/* Ready for Release */}
          {data.readyForRelease && data.readyForRelease.length > 0 && (
            <section className="section">
              <div className="section-header">
                <span className="status-dot release"></span>
                <h2>Ready for Release</h2>
                <span className="count">{data.readyForRelease.length}</span>
              </div>
              <div className="ticket-list">
                {data.readyForRelease.map(ticket => (
                  <TicketRow key={ticket.id} ticket={ticket} />
                ))}
              </div>
            </section>
          )}

          {/* Ready for QA */}
          {data.readyForQA && data.readyForQA.length > 0 && (
            <section className="section">
              <div className="section-header">
                <span className="status-dot qa"></span>
                <h2>Ready for QA</h2>
                <span className="count">{data.readyForQA.length}</span>
              </div>
              <div className="ticket-list">
                {data.readyForQA.map(ticket => (
                  <TicketRow key={ticket.id} ticket={ticket} />
                ))}
              </div>
            </section>
          )}

          {/* Ready for Development */}
          {data.readyForDev && data.readyForDev.length > 0 && (
            <section className="section">
              <div className="section-header">
                <span className="status-dot ready"></span>
                <h2>Ready for Development</h2>
                <span className="count">{data.readyForDev.length}</span>
              </div>
              <div className="ticket-list">
                {data.readyForDev.map(ticket => (
                  <TicketRow key={ticket.id} ticket={ticket} />
                ))}
              </div>
            </section>
          )}

          {/* In Development - Detailed */}
          {data.inDevelopment && data.inDevelopment.length > 0 && (
            <section className="section">
              <div className="section-header">
                <span className="status-dot dev"></span>
                <h2>In Development</h2>
                <span className="count">{data.inDevelopment.length}</span>
              </div>
              {data.inDevelopment.map(ticket => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </section>
          )}
        </div>

        {/* Action Items Sidebar */}
        <div>
          {data.actionItems && data.actionItems.length > 0 && (
            <div className="action-items">
              <h2>⚡ Action Items</h2>
              {data.actionItems.map((item, idx) => (
                <div key={idx} className="action-item">
                  <div className={`indicator ${item.priority}`}></div>
                  <div className="content">
                    <div className="item-id">{item.item}</div>
                    <div className="action-text">{item.action}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
