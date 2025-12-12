# 🖼️ How to Add Images Manualy

This guide will help you fix the missing images by adding them to the correct folders.

## 1. Player Photos

The system expects player photos to be in the `IPL_Player_Photos` folder.

**Steps:**
1.  Find a photo of the player (e.g., Virat Kohli) on Google.
2.  Save the image as a **JPG** or **PNG** file.
3.  **Rename the file** using the player's full name with underscores instead of spaces.
    *   Example: `Virat Kohli` -> `Virat_Kohli.jpg`
    *   Example: `Rohit Sharma` -> `Rohit_Sharma.jpg`
4.  Move this file into the `IPL_Player_Photos` folder in your project.
    *   Path: `e:\Auction\IPL_Player_Photos\`

## 2. Team Logos

The system expects team logos in the `Logos` folder.

**Steps:**
1.  Find the team logo (e.g., MI logo).
2.  Save the image as a **PNG** (transparent background looks best).
3.  **Rename the file** using the team's short name (abbreviation).
    *   Mumbai Indians -> `MI.png`
    *   Chennai Super Kings -> `CSK.png`
    *   Royal Challengers Bangalore -> `RCB.png`
    *   Kolkata Knight Riders -> `KKR.png`
    *   Delhi Capitals -> `DC.png`
    *   Punjab Kings -> `PBKS.png`
    *   Rajasthan Royals -> `RR.png`
    *   Sunrisers Hyderabad -> `SRH.png`
    *   Gujarat Titans -> `GT.png`
    *   Lucknow Super Giants -> `LSG.png`
4.  Move this file into the `Logos` folder.
    *   Path: `e:\Auction\Logos\`

## 3. Verify

1.  After adding a few images, refresh your website (`http://localhost:3000`).
2.  The images should appear automatically!

## 💡 Troubleshooting
*   **Case Sensitive**: On some systems, `virat_kohli.jpg` is different from `Virat_Kohli.jpg`. Stick to the capitalized format just to be safe.
*   **File Extension**: Make sure the extension matches. The code usually checks for `.jpg` first. If you have `.png`, it might work but `.jpg` is safer for photos.
