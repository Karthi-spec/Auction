# Walkthrough: Full-Stack IPL Auction System

I have successfully converted the frontend-only codebase into a fully functional full-stack website with a real-time backend.

## Changes Made

### 1. Backend Activation
- Updated `package.json` to include server dependencies (`express`, `socket.io`, `sqlite3`, etc.) and scripts to run both frontend and backend concurrently.
- ensuring `npm run dev` starts the complete system.

### 2. Database Configuration
- Updated `server/database/init.js` to automatically seed a default Auction Session (Session ID 1) on startup. This ensures the application has a valid session to connect to immediately.

### 3. Frontend-Backend Integration
- **Socket Connection**: Created `hooks/useAuctionSocket.ts` to manage the WebSocket connection to `localhost:5000`.
- **Global Provider**: Added `components/SocketProvider.tsx` and integrated it into `app/layout.tsx` so the connection is active on all pages.
- **State Synchronization**: Modified `store/auctionStore.ts` to:
    - Listen for real-time events (`new-bid`, `timer-update`, `player-sold`, etc.).
    - Emit events to the backend when actions are taken (e.g., placing a bid, selling a player as Admin).
    - Sync the local timer with the server timer.

## How to Run

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the "Working Model"**:
   ```bash
   npm run dev
   ```
   This will start:
   - Frontend on `http://localhost:3000`
   - Backend on `http://localhost:5000`

3. **Verify**:
   - Open the website.
   - The connection log in the backend terminal should show `Client connected`.
   - Bids placed in the UI will now be recorded in the SQLite database (`auction.db`).

## Features Enabled
- **Real-Time Bidding**: Bids are synced across multiple open tabs/devices.
- **Admin Control**: Selling a player or marking unsold updates all connected clients.
- **Data Persistence**: Auction progress, sold players, and budgets are saved to the database.
