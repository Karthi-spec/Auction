# 🖼️ Media Setup Guide (Updated)

This guide helps you manage images and videos for your IPL Auction site.

## 📂 New Folder Structure

I have standardized the project to use the `public` folder. This ensures everything works on GitHub Pages and local builds.

*   `public/Players/` -> Put your **Player Photos** here.
*   `public/logos/` -> Put your **Team Logos** here.
*   `public/team-videos/` -> Put your **Team Intro Videos** here.
*   `public/player-videos/` -> Put your **Player Videos** here.

*(The old folders `IPL_Player_Photos` and `Logos` in the root are no longer used).*

## 1. Adding Images

### Player Photos
1.  Save image as `FirstName LastName.png` (or `.jpg`, `.avif`).
2.  Put it in `public/Players/`.
    *   Example: `public/Players/Virat Kohli.png`

### Team Logos
1.  Save logo as `TeamName.png` or `ShortCode.png`.
2.  Put it in `public/logos/`.
    *   Example: `public/logos/CSK.png` or `public/logos/Chennai Super Kings.png`

## 2. Adding Videos

### Team Intros
1.  Save video as `TeamName.mp4` or `ShortCode.mp4`.
2.  Put it in `public/team-videos/`.
    *   Example: `public/team-videos/MI.mp4`

### Player Videos
1.  Save video as `FirstName-LastName.mp4` (lowercase with dashes).
2.  Put it in `public/player-videos/`.
    *   Example: `public/player-videos/virat-kohli.mp4`

## 3. GitHub Instructions

To satisfy your request "files to commited to the github accordingly", run these commands in your black terminal:

```bash
# 1. Add all the new public files
git add public/

# 2. Add the code changes I made
git add utils/

# 3. Commit everything
git commit -m "Standardize media assets to public folder for GitHub Pages"

# 4. Push to GitHub
git push origin main
```
