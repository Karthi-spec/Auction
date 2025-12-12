const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Installing IPL Auction System Backend...\n');

// Read package.json to get server dependencies
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const serverDeps = packageJson.serverDependencies;

if (!serverDeps) {
  console.error('❌ No server dependencies found in package.json');
  process.exit(1);
}

// Create server directory if it doesn't exist
if (!fs.existsSync('server')) {
  fs.mkdirSync('server');
}

// Install server dependencies
console.log('📦 Installing server dependencies...');
const deps = Object.entries(serverDeps).map(([name, version]) => `${name}@${version}`);

try {
  execSync(`npm install ${deps.join(' ')}`, { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('\n✅ Server dependencies installed successfully!');
  
  // Install development dependencies
  console.log('\n📦 Installing development dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('\n✅ All dependencies installed!');
  console.log('\n🎯 Setup complete! You can now run:');
  console.log('   npm run dev     - Start both frontend and backend');
  console.log('   npm run client:dev - Start only frontend');
  console.log('   npm run server:dev - Start only backend');
  
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}