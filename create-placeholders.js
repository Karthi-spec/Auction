const fs = require('fs');
const path = require('path');

// Create placeholder images directory if it doesn't exist
const playersDir = path.join(__dirname, 'IPL_Player_Photos');
if (!fs.existsSync(playersDir)) {
  fs.mkdirSync(playersDir, { recursive: true });
}

// Read players data to get player names
const playersData = JSON.parse(fs.readFileSync('players.json', 'utf8'));
const players = playersData.players || playersData;

console.log('Creating placeholder files for player photos...');

// Create placeholder text files (you can replace these with actual images)
players.slice(0, 20).forEach((player, index) => {
  const playerName = player.fullName || player.name || `${player.firstName} ${player.surname}`;
  const cleanName = playerName.replace(/\s+/g, '_');
  
  // Create a simple text placeholder (in real scenario, you'd have actual images)
  const placeholderContent = `Placeholder for ${playerName}`;
  const filePath = path.join(playersDir, `${cleanName}.txt`);
  
  fs.writeFileSync(filePath, placeholderContent);
  console.log(`Created placeholder for: ${playerName}`);
});

console.log('✅ Placeholder files created!');
console.log('📝 Note: Replace .txt files with actual .jpg/.png images for production');
console.log('🎯 Expected format: PlayerName.jpg (e.g., Virat_Kohli.jpg)');