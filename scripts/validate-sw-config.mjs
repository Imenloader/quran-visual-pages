import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const swPath = path.join(root, 'src/service-worker.ts');
const snapshotPath = path.join(root, 'scripts/sw-cache-keys.snapshot.json');

const swSource = fs.readFileSync(swPath, 'utf8');
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));

const routeRegistrations = (swSource.match(/registerRoute\(/g) || []).length;
const metricsPlugins = (swSource.match(/metricsPlugin\(/g) || []).length;
const cacheNames = Array.from(swSource.matchAll(/cacheName:\s*'([^']+)'/g), (match) => match[1]).sort();
const uniqueCacheNames = Array.from(new Set(cacheNames));

const errors = [];

if (routeRegistrations === 0) {
  errors.push('No registerRoute() entries found in src/service-worker.ts.');
}

if (metricsPlugins !== routeRegistrations) {
  errors.push(
    `Expected one metricsPlugin() per registerRoute(). Found ${metricsPlugins} metricsPlugin() calls and ${routeRegistrations} registerRoute() calls.`
  );
}

if (routeRegistrations !== snapshot.routeRegistrations) {
  errors.push(
    `Service worker route registration count changed from ${snapshot.routeRegistrations} to ${routeRegistrations}. Update scripts/sw-cache-keys.snapshot.json intentionally if this is expected.`
  );
}

if (JSON.stringify(uniqueCacheNames) !== JSON.stringify(snapshot.cacheNames)) {
  errors.push(
    [
      'Cache names changed. Update scripts/sw-cache-keys.snapshot.json intentionally if expected.',
      `Expected: ${JSON.stringify(snapshot.cacheNames)}`,
      `Received: ${JSON.stringify(uniqueCacheNames)}`,
    ].join('\n')
  );
}

if (errors.length > 0) {
  console.error('SW validation failed:\n');
  errors.forEach((error, index) => {
    console.error(`${index + 1}. ${error}`);
  });
  process.exit(1);
}

console.log('SW validation passed.');
console.log(`- Route registrations: ${routeRegistrations}`);
console.log(`- Cache names: ${uniqueCacheNames.join(', ')}`);
