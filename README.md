# ENG Daily Report Dashboard

A daily engineering team status dashboard that displays Linear ticket updates, progress on features, and action items.

## Deployment to Vercel

1. Push this repository to GitHub
2. Import the repo in Vercel
3. Deploy - no configuration needed

## Updating the Report

The dashboard reads from `public/data.json`. To update:

### Option 1: n8n Workflow (Recommended)

Set up an n8n workflow that:
1. Runs daily at 8:00 AM IST
2. Fetches data from Linear API
3. Processes and formats the data
4. Commits updated `data.json` to GitHub
5. Vercel auto-rebuilds on commit
6. Sends Slack notification with summary

### Option 2: Manual Update

Edit `public/data.json` directly and push to trigger rebuild.

## Data Structure

```json
{
  "generatedAt": "2026-01-21T08:00:00.000Z",
  "summary": {
    "completed24h": 3,
    "readyForRelease": 1,
    "readyForQA": 1,
    "inDevelopment": 8,
    "readyForDev": 8,
    "blockers": 0
  },
  "completed": [...],
  "readyForRelease": [...],
  "readyForQA": [...],
  "readyForDev": [...],
  "inDevelopment": [...],
  "actionItems": [...]
}
```

## n8n Workflow Setup

### Required Nodes:

1. **Schedule Trigger** - Daily at 8:00 AM IST
2. **HTTP Request** - Fetch from Linear API (multiple calls)
3. **Code Node** - Process and format data
4. **GitHub Node** - Commit updated data.json
5. **Slack Node** - Send summary notification

### Linear API Queries Needed:

```graphql
# Get team issues by status
query {
  issues(filter: {
    team: { key: { eq: "ENG" } }
    state: { name: { eq: "Done" } }
    updatedAt: { gte: "-P1D" }
  }) {
    nodes {
      identifier
      title
      assignee { name }
      labels { nodes { name } }
      url
    }
  }
}
```

### Slack Message Format:

```
🚀 *ENG Daily Report* — 21 Jan 2026

✅ *Completed:* 3 | 🚀 *Release:* 1 | 🧪 *QA:* 1 | 🔨 *Dev:* 8

*Action Items:*
🔴 ENG-619 — Push to prod
🔴 ENG-161 — Due today
🟡 ENG-339 — Overdue

<https://eng-dashboard.vercel.app|View Full Report>
```

## Local Development

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Tech Stack

- Next.js 14 (App Router)
- React 18
- Vercel (hosting)
- n8n (automation)
- Linear API (data source)
