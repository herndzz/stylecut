import { spawn } from 'child_process';

// Iniciar o servidor API
const server = spawn('node', ['server/index.js'], {
  stdio: 'inherit',
  shell: true
});

// Iniciar o Vite (frontend)
const vite = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// Lidar com encerramento
process.on('SIGINT', () => {
  server.kill();
  vite.kill();
  process.exit();
});
