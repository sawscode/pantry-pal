#!/usr/bin/env node
// Run database migrations
// Usage: node scripts/migrate.js

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function runMigration(name, sql) {
  console.log(`\n▶ Running: ${name}`);
  try {
    const { error } = await supabase.rpc('exec', { sql_string: sql });
    if (error) throw error;
    console.log(`✓ ${name} completed`);
  } catch (err) {
    console.error(`✗ ${name} failed:`, err.message);
  }
}

async function migrate() {
  console.log('🔄 Starting database migrations...\n');

  // Migration 1: Add category to pantry_items
  await runMigration(
    'Add category column to pantry_items',
    `
      ALTER TABLE pantry_items ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Other';
      CREATE INDEX IF NOT EXISTS idx_pantry_category ON pantry_items(household_id, category);
    `
  );

  // Migration 2: Create recipes table
  await runMigration(
    'Create recipes table',
    `
      CREATE TABLE IF NOT EXISTS recipes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
        external_recipe_id TEXT,
        name TEXT NOT NULL,
        image_url TEXT,
        ingredients JSONB,
        instructions TEXT,
        source_url TEXT,
        created_at TIMESTAMP DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS idx_recipes_household ON recipes(household_id);
    `
  );

  console.log('\n✅ All migrations completed!');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
