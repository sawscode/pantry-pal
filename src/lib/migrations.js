// Database migrations - run SQL against Supabase
const PROJECT_ID = 'gtnivswvxkkmiendfmar';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bml2c3d2eGtrbWllbmRmbWFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDE3NjYwNiwiZXhwIjoyMDk1NzUyNjA2fQ.Wt4rTHGsFRjQAUEHGvfHzATd4uFqCa0Ytw45pzupT0c';

export async function runMigration(sql) {
  try {
    const response = await fetch(
      `https://${PROJECT_ID}.supabase.co/rest/v1/rpc/sql`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          apikey: SERVICE_ROLE_KEY,
        },
        body: JSON.stringify({ query: sql }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Migration failed');
    }

    const result = await response.json();
    console.log('Migration successful:', result);
    return result;
  } catch (err) {
    console.error('Migration error:', err);
    throw err;
  }
}

export async function addCategoryToPantry() {
  const sql = `
    ALTER TABLE pantry_items ADD COLUMN category TEXT DEFAULT 'Other';
    CREATE INDEX idx_pantry_category ON pantry_items(household_id, category);
  `;
  return runMigration(sql);
}

export async function createRecipesTable() {
  const sql = `
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
    ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

    CREATE POLICY IF NOT EXISTS "Manage household recipes"
      ON recipes FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_households
          WHERE user_households.household_id = recipes.household_id
          AND user_households.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM user_households
          WHERE user_households.household_id = recipes.household_id
          AND user_households.user_id = auth.uid()
        )
      );
  `;
  return runMigration(sql);
}
