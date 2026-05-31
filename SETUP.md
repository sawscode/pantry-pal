# Pantry Pal — Setup Guide

## Project Structure

```
pantry-pal/
├── src/
│   ├── components/
│   │   ├── LoginForm.jsx
│   │   ├── AddItemForm.jsx
│   │   ├── ItemCard.jsx
│   │   └── PantryList.jsx
│   ├── hooks/
│   │   └── usePantryItems.js      # Real-time pantry logic
│   ├── lib/
│   │   └── supabaseClient.js      # Supabase client
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.local                       # Add your Supabase credentials here
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Step 1: Create Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose a name (e.g., "pantry-pal") and region (closest to you)
5. Create the project
6. Go to **Settings > API** and copy:
   - **Project URL** → Copy to `.env.local` as `VITE_SUPABASE_URL`
   - **Anon Key** → Copy to `.env.local` as `VITE_SUPABASE_ANON_KEY`

Your `.env.local` should now look like:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

## Step 2: Create Database Schema

In Supabase, go to **SQL Editor** and run this:

```sql
-- Create households table
CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'My Household',
  created_at TIMESTAMP DEFAULT now()
);

-- Create user_households junction table
CREATE TABLE user_households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, household_id)
);

-- Create pantry_items table
CREATE TABLE pantry_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_households ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow authenticated users to view households they're linked to
CREATE POLICY "View own households"
  ON households
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_households
      WHERE user_households.household_id = households.id
      AND user_households.user_id = auth.uid()
    )
  );

-- Allow authenticated users to manage pantry items in their households
CREATE POLICY "Manage household pantry"
  ON pantry_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_households
      WHERE user_households.household_id = pantry_items.household_id
      AND user_households.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_households
      WHERE user_households.household_id = pantry_items.household_id
      AND user_households.user_id = auth.uid()
    )
  );

-- Allow user_households queries
CREATE POLICY "View own user_households"
  ON user_households
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Insert own user_households"
  ON user_households
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Enable Realtime on pantry_items
ALTER PUBLICATION supabase_realtime ADD TABLE pantry_items;
```

## Step 3: Run the Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## Step 4: Create a Test Account

1. In the app login form, click "Sign Up"
2. Enter an email and password
3. The account will be created in Supabase
4. You'll be able to log in and start using the app

## Features (Phase 1)

✅ **Authentication:** Sign up and sign in with email/password  
✅ **Add Items:** Add items with name, quantity, and unit  
✅ **Unique Items:** Adding the same item twice increments the quantity  
✅ **Delete Items:** Delete with confirmation dialog  
✅ **Real-Time Sync:** Changes sync across devices in <1 second  
✅ **Offline Detection:** Shows "No connection" message if network drops  
✅ **Dark Mode:** Supports light/dark theme  

## Testing Real-Time Sync

1. Open the app in **two browser tabs/windows** (logged in to the same account)
2. Add an item in one tab → See it appear in the other tab within ~1 second
3. Delete an item in one tab → See it disappear in the other tab immediately
4. Try on **two different devices** (phone + laptop) for a more realistic test

## Known Limitations (Phase 1)

- No offline queue; changes made offline are lost
- No edit feature; delete and re-add instead
- No categories or search
- No recipe integration (Phase 2+)
- One shared account per household (Phase 2 adds separate user accounts)

## Next Steps

Once testing is complete:
1. Set up PWA (vite-plugin-pwa)
2. Deploy to Netlify
3. Test on iOS/Android home screens

See `../SETUP_PLAN.md` for the full roadmap.
