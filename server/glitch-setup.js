const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Resources Saver Website for Glitch...\n');

// Check if we're on Glitch
const isGlitch = process.env.PROJECT_DOMAIN !== undefined;
if (isGlitch) {
  console.log('✅ Detected Glitch environment');
} else {
  console.log('⚠️  Not on Glitch - this script is optimized for Glitch deployment');
}

// Check if Node.js is installed
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' });
  console.log(`✅ Node.js version: ${nodeVersion.trim()}`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js v16 or higher.');
  process.exit(1);
}

// Clean up any existing node_modules and package-lock.json
console.log('\n🧹 Cleaning up existing dependencies...');
try {
  if (fs.existsSync('node_modules')) {
    execSync('rm -rf node_modules', { stdio: 'inherit' });
    console.log('✅ Removed existing node_modules');
  }
  if (fs.existsSync('package-lock.json')) {
    execSync('rm package-lock.json', { stdio: 'inherit' });
    console.log('✅ Removed existing package-lock.json');
  }
} catch (error) {
  console.log('⚠️  Could not clean up existing files (this is normal on Glitch)');
}

// Install server dependencies
console.log('\n📦 Installing server dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Server dependencies installed');
} catch (error) {
  console.error('❌ Failed to install server dependencies');
  console.error('Error details:', error.message);
  process.exit(1);
}

// Create a simple start script for Glitch
console.log('\n📝 Creating Glitch start script...');
const startScript = `#!/bin/bash
echo "🚀 Starting Resources Saver Server..."
node index.js
`;

try {
  fs.writeFileSync('start.sh', startScript);
  execSync('chmod +x start.sh', { stdio: 'inherit' });
  console.log('✅ Created start.sh script');
} catch (error) {
  console.log('⚠️  Could not create start script (this is normal on Glitch)');
}

// Create a .glitchignore file to optimize deployment
console.log('\n📝 Creating .glitchignore file...');
const glitchIgnore = `# Dependencies (will be installed automatically)
node_modules/

# Logs
*.log
npm-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Temporary folders
tmp/
temp/

# IDE files
.vscode/
.idea/

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Build files (if any)
build/
dist/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
`;

try {
  fs.writeFileSync('.glitchignore', glitchIgnore);
  console.log('✅ Created .glitchignore file');
} catch (error) {
  console.log('⚠️  Could not create .glitchignore file');
}

console.log('\n🎉 Glitch setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Make sure your main file is set to "index.js" in Glitch settings');
console.log('2. The server will automatically start when you save changes');
console.log('3. Check the logs for any startup issues');
console.log('4. Visit your Glitch app URL to test the health endpoint: /health');

if (isGlitch) {
  console.log(`\n🌐 Your Glitch app URL: https://${process.env.PROJECT_DOMAIN}.glitch.me`);
} 