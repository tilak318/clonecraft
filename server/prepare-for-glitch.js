const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Preparing server files for Glitch deployment...\n');

// Files and directories to remove for clean Glitch deployment
const filesToRemove = [
  'node_modules',
  'package-lock.json',
  'temp_zips',
  '.git',
  'glitch-setup.js',
  'setup.js',
  'README.md',
  'GLITCH_DEPLOYMENT.md'
];

// Files to keep (essential for the server to work)
const essentialFiles = [
  'index.js',
  'package.json',
  '.nvmrc',
  '.glitchrc',
  '.gitignore'
];

// Directories to keep
const essentialDirs = [
  'routes',
  'services', 
  'middleware',
  'utils',
  'config'
];

console.log('📋 Files to be removed:');
filesToRemove.forEach(file => {
  console.log(`  ❌ ${file}`);
});

console.log('\n📋 Essential files to keep:');
essentialFiles.forEach(file => {
  console.log(`  ✅ ${file}`);
});

console.log('\n📋 Essential directories to keep:');
essentialDirs.forEach(dir => {
  console.log(`  ✅ ${dir}/`);
});

// Function to safely remove files/directories
function removeIfExists(target) {
  if (fs.existsSync(target)) {
    try {
      if (fs.lstatSync(target).isDirectory()) {
        fs.rmSync(target, { recursive: true, force: true });
        console.log(`🗑️  Removed directory: ${target}`);
      } else {
        fs.unlinkSync(target);
        console.log(`🗑️  Removed file: ${target}`);
      }
    } catch (error) {
      console.log(`⚠️  Could not remove ${target}: ${error.message}`);
    }
  }
}

// Remove problematic files
console.log('\n🧹 Cleaning up files...');
filesToRemove.forEach(removeIfExists);

// Create a simple README for Glitch
console.log('\n📝 Creating Glitch README...');
const glitchReadme = `# Resources Saver Server

This is the backend server for the Resources Saver website, deployed on Glitch.

## Quick Start

1. The server will automatically start when you save changes
2. Check the logs for any startup issues
3. Test the health endpoint: \`/health\`

## API Endpoints

- \`GET /health\` - Health check
- \`POST /api/scrape\` - Scrape website resources
- \`GET /api/download/:id\` - Download scraped resources

## Configuration

- Node.js version: 18+ (specified in .nvmrc)
- Main file: index.js
- Port: Automatically set by Glitch

## Troubleshooting

If you see Node.js 10.x in logs:
1. Refresh the project
2. Check that .nvmrc file is present
3. Verify package.json has engines field

For more help, check the console logs.
`;

try {
  fs.writeFileSync('README.md', glitchReadme);
  console.log('✅ Created Glitch README.md');
} catch (error) {
  console.log('⚠️  Could not create README.md');
}

// Create a deployment checklist
console.log('\n📋 Creating deployment checklist...');
const checklist = `# Glitch Deployment Checklist

## Before Uploading to Glitch:

✅ Remove node_modules/ directory
✅ Remove package-lock.json
✅ Remove temp_zips/ directory
✅ Remove .git/ directory
✅ Keep essential files and directories

## Essential Files:
- index.js (main server file)
- package.json (dependencies)
- .nvmrc (Node.js version)
- .glitchrc (Glitch config)
- .gitignore (exclude files)

## Essential Directories:
- routes/ (API routes)
- services/ (business logic)
- middleware/ (request processing)
- utils/ (helper functions)
- config/ (configuration)

## After Uploading to Glitch:

1. Check that Node.js 18+ is being used (not 10.x)
2. Verify dependencies install successfully
3. Test health endpoint: /health
4. Check console logs for any errors

## If Issues Persist:

1. Try creating a new Glitch project
2. Upload files one by one
3. Check Glitch community forums
4. Verify all essential files are present
`;

try {
  fs.writeFileSync('DEPLOYMENT_CHECKLIST.md', checklist);
  console.log('✅ Created DEPLOYMENT_CHECKLIST.md');
} catch (error) {
  console.log('⚠️  Could not create DEPLOYMENT_CHECKLIST.md');
}

console.log('\n🎉 Cleanup complete!');
console.log('\n📦 Files ready for Glitch deployment:');
console.log('   - Upload all remaining files to Glitch');
console.log('   - Make sure index.js is in the root');
console.log('   - Set main file to "index.js" in Glitch settings');
console.log('   - Check that Node.js 18+ is used (not 10.x)');

// Show what files remain
console.log('\n📁 Remaining files:');
try {
  const remainingFiles = fs.readdirSync('.');
  remainingFiles.forEach(file => {
    const stats = fs.statSync(file);
    const type = stats.isDirectory() ? '📁' : '📄';
    console.log(`   ${type} ${file}`);
  });
} catch (error) {
  console.log('⚠️  Could not list remaining files');
} 