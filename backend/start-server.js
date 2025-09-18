const { spawn } = require('child_process');
const path = require('path');

// Change to backend directory
process.chdir(path.join(__dirname));

console.log('Starting backend server from:', process.cwd());

// Run ts-node directly
const child = spawn('npx', ['--yes', 'ts-node', 'src/index.ts'], {
  stdio: 'inherit',
  shell: true
});

child.on('error', (error) => {
  console.error('Error starting server:', error);
});

child.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
});