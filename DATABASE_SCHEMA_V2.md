# Pantry Pal — Database Schema V2 (Run in Supabase SQL Editor)

## Migration: Add Locations, Expiration, and Recipe Tables

Copy and run each query below in Supabase > SQL Editor

---

## Query 1: Update Inventory Items Table

```sql
-- Add new columns to pantry_items
ALTER TABLE pantry_items 
ADD COLUMN location TEXT DEFAULT 'Pantry',
ADD COLUMN expiration_date DATE,
ADD COLUMN notes TEXT;

-- Create index for faster expiration queries
CREATE INDEX idx_expiration ON pantry_items(household_id, expiration_date);
CREATE INDEX idx_location ON pantry_items(household_id, location);
```

---

## Query 2: Create User Recipes Table

```sql
CREATE TABLE user_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ingredients JSONB DEFAULT '[]'::jsonb,  -- [{name, quantity, unit}, ...]
  instructions TEXT,
  prep_time_minutes INT,
  cook_time_minutes INT,
  servings INT DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_recipes_household ON user_recipes(household_id);
ALTER TABLE user_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manage household recipes"
  ON user_recipes FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_households
      WHERE user_households.household_id = user_recipes.household_id
      AND user_households.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_households
      WHERE user_households.household_id = user_recipes.household_id
      AND user_households.user_id = auth.uid()
    )
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE user_recipes;
```

---

## Query 3: Create Meal Plans Table

```sql
CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES user_recipes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  servings INT DEFAULT 1,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(household_id, date)  -- One meal per date
);

CREATE INDEX idx_meal_plans_date ON meal_plans(household_id, date);
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manage household meal plans"
  ON meal_plans FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_households
      WHERE user_households.household_id = meal_plans.household_id
      AND user_households.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_households
      WHERE user_households.household_id = meal_plans.household_id
      AND user_households.user_id = auth.uid()
    )
  );

ALTER PUBLICATION supabase_realtime ADD TABLE meal_plans;
```

---

## Query 4: Create Shopping Lists Table

```sql
CREATE TABLE shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP
);

CREATE TABLE shopping_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC,
  unit TEXT,
  category TEXT,
  is_checked BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_shopping_lists_household ON shopping_lists(household_id);
CREATE INDEX idx_shopping_list_items ON shopping_list_items(list_id);

ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manage household shopping lists"
  ON shopping_lists FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_households
      WHERE user_households.household_id = shopping_lists.household_id
      AND user_households.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_households
      WHERE user_households.household_id = shopping_lists.household_id
      AND user_households.user_id = auth.uid()
    )
  );

CREATE POLICY "Manage household shopping list items"
  ON shopping_list_items FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_households
      WHERE user_households.household_id = (
        SELECT household_id FROM shopping_lists 
        WHERE id = shopping_list_items.list_id
      )
      AND user_households.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_households
      WHERE user_households.household_id = (
        SELECT household_id FROM shopping_lists 
        WHERE id = shopping_list_items.list_id
      )
      AND user_households.user_id = auth.uid()
    )
  );

ALTER PUBLICATION supabase_realtime ADD TABLE shopping_lists;
ALTER PUBLICATION supabase_realtime ADD TABLE shopping_list_items;
```

---

## Summary

Run all 4 queries in order. They add:

✅ Locations (Pantry, Fridge, Freezer) to inventory  
✅ Expiration dates for waste tracking  
✅ User recipes table (for custom recipes)  
✅ Meal plans (date + recipe)  
✅ Shopping lists (with items)  
✅ Real-time enabled on all new tables  

Once done, reply with "Done" and I'll start rebuilding the app!
