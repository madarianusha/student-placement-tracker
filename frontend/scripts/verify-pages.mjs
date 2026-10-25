import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const base = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const routes = {
  Dashboard: '/', Students: '/students', Applications: '/applications',
  Interviews: '/interviews', Offers: '/offers', Tasks: '/tasks'
};
const app = fs.readFileSync(path.join(base, 'src', 'App.jsx'), 'utf8');
const main = fs.readFileSync(path.join(base, 'src', 'main.jsx'), 'utf8');
let failures = 0;
for (const [page, route] of Object.entries(routes)) {
  const file = path.join(base, 'src', 'pages', `${page}.jsx`);
  const exists = fs.existsSync(file);
  const routed = app.includes(`path="${route}"`);
  console.log(`${exists && routed ? 'PASS' : 'FAIL'} ${route.padEnd(16)} src/pages/${page}.jsx`);
  if (!exists || !routed) failures++;
}
if (!main.includes('<BrowserRouter>')) {
  failures++;
  console.log('FAIL Router wrapper is missing from main.jsx');
}
if (failures) process.exitCode = 1;
else console.log('All six independent page files are routed.');
