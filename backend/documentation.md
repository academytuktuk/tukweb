# TukTuk & Dinda Academy - Project Documentation

## 1. Overview & Architecture

The "TukTuk & Dinda Academy" is a satirical cricket statistics web application focusing on the slowest batters and most expensive bowlers of IPL 2026. The platform consists of two main components:
- **Frontend (Next.js 14):** A highly responsive, dynamic React application that displays the leaderboards, Player of the Day cards, and live tree-planting metrics.
- **Backend (Node.js & Express):** A REST API backed by a Prisma SQLite database (`dev.db`). It features background cron jobs to automatically fetch and synchronize match data from two reliable sources: Cricbuzz and Cricsheet.

---

## 2. How Everything Works

### The Leaderboard Algorithms
1. **TukTuk Academy (Batters):** Ranks the slowest players.
   - **Strike Rate Penalty:** Heavily penalizes a low strike rate compared to an expected 140 SR.
   - **Volume Penalty:** Compares the runs scored against an expected benchmark based on the batting position (e.g., an opener is expected to score more runs; scoring very few runs at a top position adds to the TukTuk score).
   - **Filter:** Only players with a minimum of 5 innings qualify. Ties are broken by the highest number of innings played.

2. **Dinda Academy (Bowlers):** Ranks the most expensive/ineffective bowlers.
   - **Economy Penalty:** Penalizes bowlers who concede more than 8.5 runs per over.
   - **Wicket Drought:** Severely penalizes bowlers who fail to take wickets (less than 1 wicket every 4 overs).

### The Synchronization Jobs (How Data is Fetched)
The backend runs automated scripts (cron jobs) to keep the data fresh:
1. **Cricbuzz Sync (`src/jobs/cricbuzzSync.ts`):** 
   - Runs every 5 minutes.
   - Connects to the RapidAPI Cricbuzz endpoint using the `RAPIDAPI_KEY`.
   - Fetches live match statuses, scorecards, and player profiles.
   - Automatically updates runs, balls, overs, maidens, and wickets for all players.

2. **Cricsheet Sync (`src/jobs/cricsheetSync.ts`):**
   - Runs every 6 hours.
   - Downloads the official, exact ball-by-ball JSON data directly from Cricsheet.
   - Accurately parses dot balls (legal deliveries where 0 runs were scored) to power the "TukTukForNature" Tree Meter.

---

## 3. Admin Guide: Checking API and Sync Status

As an admin, you do not need to manually trigger data updates. However, to monitor the health of the system:

1. **Check Backend Terminal Logs:**
   - Keep the backend terminal (`npm run dev` or production server) open or check its log files.
   - You will periodically see tags like `[CRICBUZZ SYNC] Starting sync...` or `[CRICSHEET SYNC] Fetched dot balls...`.
   - If an API key expires or the network fails, an `[ERROR]` log will clearly state the issue.

2. **Verify RapidAPI Keys:**
   - In your backend `.env` file, ensure `RAPIDAPI_KEY` is valid. If Cricbuzz stops updating, check your RapidAPI dashboard to ensure you haven't exceeded your monthly quota.

3. **Generating Player of the Day:**
   - Navigate to `/admin` on the website.
   - Enter your `ADMIN_PASSWORD` (set to `tuktuk2026` in `.env`).
   - Use the **Publish Directly** feature or the **Manual Upload** fallback if the layout glitches on a specific browser.

---

## 4. How to Make the Website Live

To move from localhost to the public internet, follow these deployment steps:

### A. Deploying the Backend (Database & Sync Jobs)
1. Use a service like **Railway.app** or **Render.com**.
2. Upload the `backend` folder to a GitHub repository and link it to the service.
3. **Environment Variables:** Add `DATABASE_URL="file:./dev.db"`, `PORT=4000`, `RAPIDAPI_KEY`, and `ADMIN_PASSWORD`.
4. **Persistent Storage:** Because SQLite uses a local `.db` file, ensure your hosting provider gives you a **Persistent Disk/Volume** so the database isn't deleted when the server restarts.
5. Set the Start Command to: `npm run build` followed by `npm start`.

### B. Deploying the Frontend
1. Use **Vercel** (the creators of Next.js).
2. Upload the `frontend` folder to GitHub and link it to Vercel.
3. **Environment Variables:** Add `NEXT_PUBLIC_API_URL` and point it to your live Backend URL (e.g., `https://your-backend-url.onrender.com`).
4. Vercel will automatically build and deploy the website.

---

## 5. Suggested Domain Names

Here are some creative, catchy, and highly brandable domain names for the website:

1. **tuktukacademy.com** / **tuktukacademy.in**
2. **theleakyend.com** (A great cricket pun for expensive bowling)
3. **pavilionofpatience.com**
4. **cricketroast.com**
5. **dindaacademy.com** / **dindaacademy.in**
6. **slowandsteadyxi.com**
7. **statire.com** (Stats + Satire)
8. **tuktukdinda.com**
