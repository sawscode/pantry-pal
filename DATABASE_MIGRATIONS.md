# Database Migrations

All database schema changes are tracked here. Copy-paste the SQL into Supabase > SQL Editor to run.

## Migration 001: Add Categories to Pantry Items

**Status:** ⏳ Pending

Run this in **Supabase > SQL Editor > New Query**:

```sql
-- Add category column to pantry_items
ALTER TABLE pantry_items ADD COLUMN category TEXT DEFAULT 'Other';

-- Create index for faster filtering
CREATE INDEX idx_pantry_category ON pantry_items(household_id, category);
```

**What it does:**
- Adds a `category` column to all pantry items (default: "Other")
- Creates an index for fast category filtering

---

## Migration 002: Create Recipes Table

**Status:** ⏳ Pending (run after Migration 001)

Run this in **Supabase > SQL Editor > New Query**:

```sql
-- Create recipes table
CREATE TABLE recipes (
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

-- Create index for faster lookups
CREATE INDEX idx_recipes_household ON recipes(household_id);

-- Enable RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Manage household recipes"
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
```

**What it does:**
- Creates a `recipes` table to store saved recipes
- Enables RLS so users can only see recipes in their household
- Stores recipe data: name, ingredients, instructions, source URL, and external API ID

---

## How to Run Migrations

1. Go to **Supabase Dashboard > SQL Editor**
2. Click **"New Query"**
3. Copy the SQL from above
4. Click **"RUN"**
5. Wait for "Success" message
6. Check back here and mark as ✅ Complete

---

## Migration Checklist

- [ ] Migration 001: Add categories
- [ ] Migration 002: Create recipes table
