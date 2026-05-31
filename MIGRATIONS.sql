-- Pantry Pal V2 Database Migrations
-- Run each query separately in Supabase SQL Editor

-- ============================================
-- MIGRATION 1: Update pantry_items table
-- ============================================

ALTER TABLE pantry_items ADD COLUMN location TEXT DEFAULT 'Pantry';

ALTER TABLE pantry_items ADD COLUMN expiration_date DATE;

ALTER TABLE pantry_items ADD COLUMN notes TEXT;

CREATE INDEX idx_pantry_expiration ON pantry_items(household_id, expiration_date);

CREATE INDEX idx_pantry_location ON pantry_items(household_id, location);


-- ============================================
-- MIGRATION 2: Create user_recipes table
-- ============================================

CREATE TABLE user_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ingredients JSONB DEFAULT '[]'::jsonb,
  instructions TEXT,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  servings INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_user_recipes_household ON user_recipes(household_id);

ALTER TABLE user_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to manage household recipes"
  ON user_recipes
  FOR ALL
  TO authenticated
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

ALTER PUBLICATION supabase_realtime ADD TABLE user_recipes;


-- ============================================
-- MIGRATION 3: Create meal_plans table
-- ============================================

CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES user_recipes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  servings INTEGER DEFAULT 1,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(household_id, date)
);

CREATE INDEX idx_meal_plans_household_date ON meal_plans(household_id, date);

ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to manage household meal plans"
  ON meal_plans
  FOR ALL
  TO authenticated
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


-- ============================================
-- MIGRATION 4: Create shopping_lists table
-- ============================================

CREATE TABLE shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_shopping_lists_household ON shopping_lists(household_id);

ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to manage household shopping lists"
  ON shopping_lists
  FOR ALL
  TO authenticated
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

ALTER PUBLICATION supabase_realtime ADD TABLE shopping_lists;


-- ============================================
-- MIGRATION 5: Create shopping_list_items table
-- ============================================

CREATE TABLE shopping_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC,
  unit TEXT,
  category TEXT,
  is_checked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_shopping_list_items_list ON shopping_list_items(list_id);

ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to manage shopping list items"
  ON shopping_list_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_households
      INNER JOIN shopping_lists ON shopping_lists.household_id = user_households.household_id
      WHERE shopping_lists.id = shopping_list_items.list_id
      AND user_households.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_households
      INNER JOIN shopping_lists ON shopping_lists.household_id = user_households.household_id
      WHERE shopping_lists.id = shopping_list_items.list_id
      AND user_households.user_id = auth.uid()
    )
  );

ALTER PUBLICATION supabase_realtime ADD TABLE shopping_list_items;
