const fs = require('fs');
const path = require('path');

// Create server package.json for production
const serverPackage = {
  "name": "ipl-auction-server",
  "version": "1.0.0",
  "description": "IPL Auction System Backend Server",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.4",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "express-rate-limit": "^7.1.5",
    "sqlite3": "^5.1.6",
    "uuid": "^9.0.1",
    "joi": "^17.11.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
};

// Write server package.json
fs.writeFileSync(
  path.join(__dirname, 'package.json'),
  JSON.stringify(serverPackage, null, 2)
);

console.log('✅ Server package.json created');

// Copy necessary files for production
const filesToCopy = [
  '../players.json',
  '../teams.json',
  '../data/playerRatings.json'
];

filesToCopy.forEach(file => {
  const srcPath = path.join(__dirname, file);
  const destPath = path.join(__dirname, path.basename(file));
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ Copied ${path.basename(file)}`);
  }
});

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Copy playerRatings.json to server/data/
const ratingsPath = path.join(__dirname, '../data/playerRatings.json');
const serverRatingsPath = path.join(__dirname, 'data/playerRatings.json');

if (fs.existsSync(ratingsPath)) {
  fs.copyFileSync(ratingsPath, serverRatingsPath);
  console.log('✅ Copied playerRatings.json to server/data/');
}

console.log('🚀 Server build completed successfully!');