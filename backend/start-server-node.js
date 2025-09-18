const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting E-commerce Backend Server...');
console.log('Current directory:', process.cwd());
console.log('Node version:', process.version);
console.log('');

// Start the server
const serverProcess = spawn('node', ['-r', 'ts-node/register', 'src/index.ts'], {
  stdio: 'inherit',
  cwd: __dirname
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
  
  console.log('\n🔧 Trying alternative method...');
  // Try with npx ts-node
  const altProcess = spawn('npx', ['ts-node', 'src/index.ts'], {
    stdio: 'inherit',
    cwd: __dirname,
    shell: true
  });
  
  altProcess.on('error', (altError) => {
    console.error('❌ Alternative method also failed:', altError.message);
    console.log('\n📋 Manual instructions:');
    console.log('1. Open a new terminal');
    console.log('2. cd "d:\\my stuff\\mypj\\ecommerce\\backend"');
    console.log('3. npm install ts-node');
    console.log('4. npx ts-node src/index.ts');
  });
});

serverProcess.on('exit', (code) => {
  if (code !== 0) {
    console.log(`\n⚠️  Server process exited with code ${code}`);
  }
});