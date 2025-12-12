const fs = require('fs');

console.log('🚀 Checking IPL Auction System Backend Setup...\n');

// Since we merged dependencies into root package.json, we just need to ensure server dir exists
// Create server directory if it doesn't exist
if (!fs.existsSync('server')) {
  fs.mkdirSync('server');
}

console.log('✅ Server dependencies are now managed by root package.json');
console.log('✅ Setup verification complete!');