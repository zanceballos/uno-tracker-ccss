<div align="center">

# 🎴 Uno Tracker

**Run a youth-led UNO team tournament: teams, tables, scores and live leaderboards.**

![React](https://img.shields.io/badge/React-0072BC?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-FFDE00?logo=vite&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-00A651?logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-ED1C24?logo=firebase&logoColor=white)
![License](https://img.shields.io/badge/License-TODO-lightgrey)

[![Live Site](https://img.shields.io/badge/Live_Site-Open_App-00A651?style=for-the-badge)](https://uno-tracker-f0143.web.app)
[![Organiser Guide](https://img.shields.io/badge/Organiser_Guide-Read-0072BC?style=for-the-badge)](#-quick-start-for-organisers)
[![Report an Issue](https://img.shields.io/badge/Report_an_Issue-Contact-ED1C24?style=for-the-badge)](#-contact--support)

<!-- TODO: add a screenshot, e.g. ![Uno Tracker screenshot](docs/screenshot.png) -->

</div>

## 📑 Table of Contents

[About](#-about) · [Quick Start](#-quick-start-for-organisers) · [Roles](#-roles) · [Features](#-features) · [Tech Stack](#️-tech-stack-and-architecture) · [Setup](#️-setup-for-maintainers) · [Privacy](#-security-and-privacy) · [Handover](#-handover-checklist) · [Limits](#-known-limitations-and-ideas) · [Team](#-project-team) · [Contact](#-contact--support)

*Last updated: 5 Nov 2026*

## 🎴 About

Uno Tracker helps a community centre run a UNO tournament for teams of youths. Players join a team on their phone. Organisers run the rounds and enter scores, and everyone sees tables and leaderboards live. It was built so youths can organise and keep running the tournament themselves.

[⬆ Back to top](#-uno-tracker)

## 🚀 Quick Start for Organisers

Open the site, tap **I'm an Organiser** and log in. Then follow the big **Next step** panel on the admin page. It shows a checklist and only lets you continue when the checks pass.

1. **Create a session.** Tap **+ New session**. Enter a name, date and number of teams.
2. **Choose the mode.** *Players choose their team* (they pick a team) or *Mixed teams* (they only type their name and you assign teams).
3. **Open registration.** Show the QR code on the home page so players can join.
4. **Close registration.** You need at least 2 teams with players, and every player on a team.
5. **Set the teams.** In *Players and Teams*, move players around. In Mixed mode use **Auto-assign**: preview, **Shuffle again** if you like, then **Lock teams**.
6. **Announce the rules.** Tap **Rules** and read them out loud. Make sure every table has a deck of cards.
7. **Start the round.** Tables are shown on players' phones. Press **Start timer** (15 minutes).
8. **Enter results.** For each table, tick who played, type the cards left for each team, and save. Tick **Went out** only if a team played all its cards.
9. **End the round.** Press **End round early** if a team goes out, or wait for the timer. Every table must have a score.
10. **Next round or finals.** Choose **Play another round** or **Skip to the finals**. A play-off appears only if teams are tied.
11. **Finish the session.** Press **Finish session** to save the results to the leaderboards.

<details>
<summary><b>❓ Troubleshooting FAQ</b></summary>

- **A player is on the wrong team.** Open *Players and Teams*, use **Move…** on their name, and pick the right team (max 4 players).
- **A walk-in arrives.** Type their name under *Add any player* and pick a team (the smallest team is suggested). If you open a new team mid-game, it starts level with the lowest-scoring team.
- **Someone typed the wrong name.** Tap the name in *Players and Teams*, type the new one, press Enter.
- **A whole team leaves.** They disappear from the leaderboard. In the final, the admin page offers **Replace with** the next-ranked team.
- **A score is wrong.** Re-save the table (**Update score**) or press **Undo this score**.
- **Wi-Fi drops.** Organiser changes are saved on the device and sync when it reconnects. Players will not see them until then. Keep the admin page open.
- **I pressed Next too early.** Use **Go back one step**. It works until the round has saved scores.
- **Two teams are tied for a finalist spot.** A yellow box explains it. A play-off only happens if points and cards left are both equal.

</details>

[⬆ Back to top](#-uno-tracker)

## 👥 Roles

| What | Player | Organiser (Game Master) | Maintainer |
|---|---|---|---|
| View live page and leaderboards | ✅ | ✅ | ✅ |
| Register / join a team | ✅ | ✅ (can add walk-ins) | — |
| See my table | ✅ | — | — |
| Rename players | — | ✅ | — |
| Move or remove players | — | ✅ | — |
| Run rounds and enter scores | — | ✅ | — |
| Edit, duplicate or delete a session | — | ✅ | — |
| Auto-assign teams | — | ✅ | — |
| Export CSV | ❌ not built | ❌ not built | ❌ not built |
| Change code, rules or hosting | — | — | ✅ |

[⬆ Back to top](#-uno-tracker)

## ✨ Features

- **Two modes:** *Choose your team* (pick a team or type a code like "Blue 3") and *Mixed teams* (name only, organiser assigns).
- **Auto-assign:** teams of 3, with some of 4 for leftovers (max 4), a preview, shuffle again, and a confirm before replacing teams.
- **Scoring:** a team that goes out first gets 3 points, fewest cards among the rest gets 2, others get 1. If time runs out and nobody went out, fewest cards gets 2 and others 1.
- **Tie-break:** points first, then fewest cards left in the last round. A play-off is used only if both are equal.
- **Tables:** at most 3 tables with up to 3 teams each, never a team alone (an alert helps fix it). More than 9 teams need a casual non-scoring table.
- **Rounds:** 2 rounds by default (an extra round is optional, up to 3), play-off if needed, then a final with the top 3 teams.
- **Walk-ins:** join the smallest team (max 4). A new team mid-game starts level with the lowest team. Anything else is for organisers to judge.
- **Participation tracking:** pick who played at each table, with a suggestion for players who played least. A *Winners and who played* list shows it all.
- **Guided organiser flow:** checklist before each step, **Go back one step**, **Undo this score**, **End round early**.
- **Past leaderboards:** Hall of fame, past sessions and an Overall players ranking.
- **Big-screen friendly:** the live page uses large text for projectors.

[⬆ Back to top](#-uno-tracker)

## 🛠️ Tech Stack and Architecture

| Layer | Tool | Why |
|---|---|---|
| UI | React 19 + React Router | Simple pages and routes |
| Build | Vite | Fast dev server and build |
| Styling | Tailwind CSS 4 | Quick, consistent UNO look |
| Login | Firebase Auth | Email login for organisers, anonymous sign-in for players |
| Database | Cloud Firestore | Live updates on every phone |
| Hosting | Firebase Hosting | Free static hosting |

<details>
<summary><b>📁 Folder tree</b></summary>

```
src/
  pages/        Landing, Welcome (home), Join, Live, Results, Leaderboards...
  admin/        Organiser tools: NextStep, TeamEditor, AutoAssign, SessionTools, Tracking, actions.js
  components/   Shared UI: NavBar, TeamCard, Podium, TableCard, Modal...
  logic/        Pure rules: scoring, tables, ranking, flow, guard, teams, participants
  hooks/        Firestore and auth hooks
  Admin.jsx     Organiser dashboard
firestore.rules Security rules
```

</details>

**Data model (Firestore)**

- `meta/active`: which session is live (`sessionId`).
- `sessions/{id}`: name, date, `status`, `mode` (`choose` or `mixed`), `rounds`, `format`, `seating`, `roundEndsAt`, `deleted`.
  - `teams/{tN}`: name, colour, size, points. `players/{uid}`: name, `teamId` (can be null). `scores/{round_table}`: points, cards, winner, who played.
- `pastSessions/{id}`: saved standings, winners and players for the leaderboards.
- `admins/{uid}`: marks an organiser account.

[⬆ Back to top](#-uno-tracker)

## ⚙️ Setup for Maintainers

**Prerequisites:** Node.js (TODO: confirm version, 20+ likely), npm, the Firebase CLI (`npm i -g firebase-tools`), and access to the Firebase project.

1. `git clone <repo-url>` and `cd uno-tracker`
2. `npm install`
3. `cp .env.example .env` and fill it in (below).
4. `npm run dev` to run locally. `npm run build` makes the `dist/` folder. `npm run lint` checks the code.
5. Deploy the site: `firebase login`, then `firebase deploy --only hosting`.
6. Deploy the rules: `firebase deploy --only firestore:rules`. TODO: confirm. `firebase.json` has no `firestore` section yet. Add `"firestore": { "rules": "firestore.rules" }`, or paste the rules in the Firebase console.

<details>
<summary><b>🔑 Environment variables</b></summary>

Find them in Firebase console → Project settings → Your apps → Web app → SDK config.

| Variable | Value |
|---|---|
| `VITE_FIREBASE_API_KEY` | (empty in the template) |
| `VITE_FIREBASE_AUTH_DOMAIN` | (empty in the template) |
| `VITE_FIREBASE_PROJECT_ID` | (empty in the template) |
| `VITE_FIREBASE_STORAGE_BUCKET` | (empty in the template) |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | (empty in the template) |
| `VITE_FIREBASE_APP_ID` | (empty in the template) |

</details>

> [!WARNING]
> Never commit `.env`. It is listed in `.gitignore`, so keep it that way.

**Create or reset the organiser account**

1. Firebase console → Authentication → Sign-in method: turn on **Email/Password** and **Anonymous**.
2. Authentication → Users → **Add user** (email and password). To reset, use the user's menu → **Reset password**.
3. Copy the user's **UID**.
4. Firestore → create a document `admins/<UID>` (any field, for example `role: "organiser"`). The app only checks that this document exists.
5. To hand over access: repeat steps 2 to 4 for the new person, and delete the old user and `admins/<old UID>`.

[⬆ Back to top](#-uno-tracker)

## 🔒 Security and Privacy

- Anyone can **read** sessions, teams, players and past leaderboards. Nothing private is stored.
- Only **organisers** (a user with an `admins/<UID>` document) can change sessions, teams, scores and leaderboards.
- Players can only create their own player record, and only while registration is open. They can leave while registration is open and change a team's player count by one.
- Public pages show only the first word of each name.

> [!NOTE]
> Only first names or nicknames should be typed in. Never ask for surnames, ages or contact details.

Firebase web keys are not secrets, because the rules protect the data. The `.env` file still should not be committed.

**Deleting old data**
1. In the app, open *Session settings* → *Edit, duplicate or delete this session* → **Delete**. This hides the session and removes it from all leaderboards.
2. The hidden session stays in Firestore. To remove it for good, delete the session document and its `teams`, `players` and `scores` subcollections in the Firebase console.
3. Delete a `pastSessions/<id>` document to remove a session from the leaderboards without deleting the session.

[⬆ Back to top](#-uno-tracker)

## ✅ Handover Checklist

- [ ] Name the owner of the Firebase project and the GitHub repo (TODO: fill in).
- [ ] Add the new owners to Firebase (Project settings → Users and permissions) and to GitHub.
- [ ] Create a new organiser account and remove old ones (see Setup).
- [ ] Change passwords for shared accounts.
- [ ] Check billing, and set a budget alert in Google Cloud.
- [ ] Run one dry-run session: create, join, auto-assign, play a round, finish, then delete it.
- [ ] Confirm the live site URL still works.

[⬆ Back to top](#-uno-tracker)

## 🚧 Known Limitations and Ideas

- No CSV export or automated tests exist.
- Late joiners and the "play at least 2 rounds" idea are not enforced. Organisers decide.
- The tie-break compares cards across different tables, which is not always fair.
- If a team leaves after the final is scored, undo and re-enter that score by hand.
- Players sign in anonymously. Clearing browser data may disconnect them from their team (TODO: confirm).
- Deleted sessions stay in Firestore until removed in the console.

[⬆ Back to top](#-uno-tracker)

## 🙌 Project Team

| Name | Role | GitHub |
|---|---|---|
| Lim Chin Neng | Project member | TODO |
| Gia Bianca Napay Castillo | Project member | TODO |
| Ong Si Qi | Project member | TODO |
| Sun Mohan | Project member | TODO |
| Moh Wen Jun Dominic | Project member | TODO |
| Muhammad Izzan Bin Razak | Main contact and maintainer | [@zanceballos](https://github.com/zanceballos) |

Built for the Care, Serve, Learn (CSL) course in partnership with Care Community Services Society (CCSS), with thanks to the CCSS staff and youths.

**Licence:** TODO: choose a licence and add a `LICENSE` file.

[⬆ Back to top](#-uno-tracker)

## 📬 Contact & Support

[![GitHub](https://img.shields.io/badge/GitHub-zanceballos-181717?style=for-the-badge&logo=github)](https://github.com/zanceballos)
[![Email](https://img.shields.io/badge/Email-muha0325%40e.ntu.edu.sg-ED1C24?style=for-the-badge&logo=gmail&logoColor=white)](mailto:muha0325@e.ntu.edu.sg)

For bugs, open a GitHub Issue. For urgent help during a session, email.

**When to contact us**
- The app is not loading.
- You cannot log in as an organiser.
- The data looks wrong.
- You need admin access transferred.

[⬆ Back to top](#-uno-tracker)
