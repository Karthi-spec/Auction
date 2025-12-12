# Implementation Plan - Standardize Media Assets for Static Deployment

## Goal
Move all media assets (Player Photos, Team Logos, Videos) to the `public/` directory so they can be served statically by Next.js. This ensures compatability with GitHub Pages and removes the dependency on the backend for serving static files.

## Proposed Changes

### 1. Asset Migration
- **Move** contents of `e:/Auction/IPL_Player_Photos` -> `e:/Auction/public/player-photos`
- **Move** contents of `e:/Auction/Logos` -> `e:/Auction/public/logos` (Merge with existing)
- **Move** contents of `e:/Auction/Team videos` -> `e:/Auction/public/team-videos`
- **Move** contents of `e:/Auction/Player Video` -> `e:/Auction/public/player-videos`
- **Clean up** empty root directories after move.

### 2. Code Updates
#### `utils/playerVideo.ts`
- Update `getPlayerVideoUrl` to point to `/player-videos/${filename}`.
- Remove backend URL dependency.
- Add GitHub Pages base path support (`/Auction` prefix).

#### `utils/teamLogos.ts`
- Ensure `getTeamVideoUrl` points to `/team-videos/${filename}`.
- Verify `getTeamLogoUrl` uses `/logos/${filename}` (partially done, will refine).

#### `components/PlayerCard.tsx` (and others)
- Identify where player photos are loaded.
- Update logic to point to `/player-photos/${PlayerName}.jpg`.
- Add GitHub Pages base path support.

## Verification Plan

### Automated Verification
- Verify directories exist in `public/`.
- Verify file counts match.

### Manual Verification
- Check `http://localhost:3000` (or `npm run build && npm run start`).
- Verify Images: Player photos should load (or show placeholders if only txt files exist).
- Verify Videos: Team intro videos should play (if files exist).
- Verify Logos: Team logos should appear.
