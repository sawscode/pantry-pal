# Pantry Pal 🥘

A shared household pantry and recipe app for two users. Manage your pantry items in real-time, search for recipes, and see which ingredients you already have at home.

## Features

### Phase 1: Shared Pantry ✅
- **Real-time inventory management** — Add, view, and delete pantry items
- **Shared across devices** — Changes sync instantly between two devices (<1 second)
- **Categories** — Organize items by Produce, Dairy, Pantry, Frozen, Meat, or Other
- **Search & filter** — Find items by name or category
- **PWA installable** — Add to home screen on iOS/Android
- **Toast notifications** — Get feedback on actions (add, delete, save)

### Phase 2: Recipes (Live!) 🎉
- **Recipe search** — Browse recipes from Spoonacular API
- **Recipe details** — View full ingredients and step-by-step instructions
- **Save favorites** — Keep favorite recipes in your household
- **Pantry matching** — See which ingredients you already have for each recipe
- **Bottom navigation** — Easy tab switching between Pantry and Recipes

### Phase 3 (Future)
- Shopping list generation from recipes
- Expiration date tracking
- Barcode scanning
- Meal planning

## Tech Stack

- **Frontend:** React (Vite)
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **Recipes:** Spoonacular API
- **Styling:** Tailwind CSS
- **Notifications:** React Hot Toast
- **Deployment:** Netlify
- **PWA:** Vite PWA plugin

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account (free tier available)
- Spoonacular API key (150 requests/day free)

### Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/YOUR_USERNAME/pantry-pal.git
   cd pantry-pal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env.local`** with your credentials
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open `http://localhost:5173`** in your browser

## Project Structure

```
src/
├── components/
│   ├── AddItemForm.jsx      # Form to add pantry items
│   ├── ItemCard.jsx         # Individual pantry item display
│   ├── PantryList.jsx       # Pantry list with search/filter
│   ├── RecipeSearch.jsx     # Recipe search interface
│   ├── RecipeCard.jsx       # Recipe preview card
│   ├── RecipeDetail.jsx     # Full recipe view with pantry matching
│   ├── LoginForm.jsx        # Authentication form
│   └── BottomNav.jsx        # Navigation between tabs
├── hooks/
│   ├── usePantryItems.js    # Pantry logic & real-time sync
│   ├── useRecipes.js        # Recipe API integration
│   └── useSavedRecipes.js   # Saved recipes management
├── lib/
│   └── supabaseClient.js    # Supabase client initialization
└── App.jsx                  # Main app component
```

## Usage

### Adding Items to Pantry
1. Enter item name (e.g., "Milk")
2. Select category (e.g., "Dairy")
3. Enter quantity and unit
4. Click "Add Item"
5. See it appear instantly on other devices!

### Searching Recipes
1. Go to "Recipes" tab
2. Type ingredient or recipe name
3. Click a recipe to see details
4. Check which ingredients you have (green highlights)
5. Click "Save Recipe" to keep favorite

### Filtering Pantry
- **Search by name** — Type in search box
- **Filter by category** — Click category buttons at top
- **Combine both** — Search + category filter together

## Deployment

### Netlify Auto-Deploy
Every push to `main` triggers auto-deploy:

1. Push to GitHub: `git push origin main`
2. Netlify builds and deploys automatically
3. Check status at netlify.com

## Known Limitations

- Single shared account (no separate user accounts yet)
- No offline queue (changes made offline are lost)
- No edit feature (delete and re-add instead)

## Support

For issues:
1. Check browser console (F12) for error messages
2. Verify Supabase credentials in `.env.local`
3. Check Netlify build logs if deployment fails

---

**Made with ❤️ for household cooking**
