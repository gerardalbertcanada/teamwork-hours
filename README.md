# Weekly Hours Dashboard

A single-purpose dashboard showing hours logged **last week** (Monday–Sunday) for a fixed roster of 11 staff members. Built the same way as the main Teamwork dashboard — React + Recharts frontend, Vercel serverless proxy to the Teamwork API.

## 📁 Project Structure

```
weekly-hours-dashboard/
├── index.html        ← Main dashboard
├── api/
│   └── teamwork.js   ← Serverless API proxy
├── vercel.json       ← Vercel config
└── README.md
```

## How the week is calculated

The dashboard always shows the **most recently completed Monday–Sunday week**, calculated automatically from today's date — no manual date picking needed.

Example: if today is Monday 9/14, it shows **9/7 – 9/13**. Load it again next Monday and it automatically shows the new prior week. It fetches `time_entries.json` from Teamwork with `fromdate`/`todate` set to that range.

## Staff roster

The 11 people shown are hardcoded in `index.html` (search for `const STAFF`). Everyone on the list appears on the chart even if they logged 0 hours that week — nobody silently disappears. To add, remove, or rename someone, edit that array:

```javascript
const STAFF = [
  { id: 90852,  label: 'Mary Lynn' },
  { id: 109919, label: 'Salim' },
  // ...
];
```

## 🚀 Deploy to Vercel

1. Push all files (at the **root** of the repo — not in a subfolder) to a new GitHub repo.
2. Go to [vercel.com](https://vercel.com) → **Add New...** → **Project** → select the repo → **Deploy**.
3. Your dashboard is live.

## 🔐 Security (recommended)

The API key is currently inlined as a fallback in `api/teamwork.js` (same key used by the main dashboard). To avoid shipping it in source control:

1. In Vercel: **Settings** → **Environment Variables**
2. Add `TEAMWORK_API_KEY` = `twp_kouI7Vd8IetzZ1b88Y7L8vf6Xm0K`
3. Redeploy — the code already checks for the env var first.

## ⚠️ Troubleshooting

**No data / all zeros?**
- Confirm the staff IDs in `STAFF` match Teamwork's `person-id` values.
- Confirm entries actually exist in that date range — visit `your-site.vercel.app/api/teamwork?endpoint=time_entries.json&fromdate=YYYYMMDD&todate=YYYYMMDD` to test directly.

**404 Error?**
- Files must be at the ROOT of the repo (`repo/index.html`, not `repo/folder/index.html`).
