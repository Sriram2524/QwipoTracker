#!/usr/bin/env node

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Setting up production database...');

try {
  // Change to project root directory
  process.chdir(join(__dirname, '..'));
  
  // Push database schema to production database
  console.log('Pushing database schema...');
  execSync('npx drizzle-kit push', { stdio: 'inherit' });
  
  console.log('Database setup completed successfully!');
} catch (error) {
  console.error('Database setup failed:', error.message);
  process.exit(1);
}