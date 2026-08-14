# Expense Splitter

A tiny, self-hosted expense splitter. Add people, put them into
groups with **weights**, log expenses and payments, and it works out who owes whom
— with the full calculation shown. Everyone who opens the URL sees the same live data.

- **No accounts, no paywalls, no limits.**
- **Zero dependencies** — just Node's built-ins, so it deploys in seconds.
- Data is stored in a simple `data.json` file on the server.

## What "weights" are for

Each group is split by *shares*. A normal person has weight **1**. A couple who
share one wallet but are two people can be added as a single entry (e.g.
"Joe & Jane") with weight **2** in the groups they're part of — so they pay two
people's worth while settling as one. Set any weight you like per person, per group.

---

## Deploy on Railway (free) — no command line needed

1. Put these files in a new **GitHub repo** (upload the whole folder).
2. Go to <https://railway.app> → **New Project** → **Deploy from GitHub repo** → pick the repo.
3. Railway auto-detects Node and runs `npm start`. When it finishes, open
   **Settings → Networking → Generate Domain** to get your public URL.
4. Share that URL. Done.

### Alternative: Railway CLI

```bash
npm i -g @railway/cli
railway login
railway init      # create a project
railway up        # deploy this folder
railway domain    # get a public URL
```

### Keeping data across redeploys (recommended)

Railway's normal filesystem resets when you redeploy. To keep your expenses
permanently, attach a **Volume**:

1. In your Railway service: **Variables** → add `DATA_FILE` = `/data/data.json`
2. **Settings → Volumes** → add a volume mounted at `/data`.

Now the data lives on the volume and survives redeploys. (Skip this if you don't
mind re-entering data after an update.)

---

## Run it on your own computer

```bash
node server.js
# then open http://localhost:3000
```

(Optional: set a port or data location — `PORT=8080 DATA_FILE=./mydata.json node server.js`)

## Works offline too

If you just open `public/index.html` directly in a browser (no server), it still
works and saves to that browser's local storage — but it can't be shared that way.
To share a single live link, run it on a server (Railway, above).

---

## Files

- `server.js` — the whole server (static hosting + `/api/state` read/write). No dependencies.
- `public/index.html` — the entire app (UI + logic).
- `package.json` — tells the host to run `node server.js`.
- `data.json` — created automatically to store your data.
