const { compile } = require('nexe');

const inputAppName = './server.js';
const outputAppName = './build/Backend';

compile({
  input: inputAppName,
  output: outputAppName,
  build: true,
  targets: 'windows',
  resources: './public',
  ico: './public/assets/locker.ico',
  verbose: true,
}).then((err) => {
  if (err) throw err;
  console.log('success');
});
