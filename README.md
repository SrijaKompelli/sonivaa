# MERN Music App (server + client)

This workspace contains a full-stack MERN music app scaffold: backend in `/server` and frontend in `/client`.

Server env sample: see `/server/.env.sample`.

Basic steps (PowerShell):

```powershell
# server
cd server
npm install
# set up .env from .env.sample
npm run dev

# client
cd ../client
npm install
npm start
```

The backend exposes endpoints under `/api/*` for auth, playlists, tracks (FMA proxy), diary entries and admin.