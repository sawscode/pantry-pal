import { useState, useEffect } from 'react';
import { useRecipes } from '../hooks/useRecipes';
import { RecipeCard } from './RecipeCard';
import { RecipeDetail } from './RecipeDetail';

export function RecipeSearch({ householdId, pantryItems }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const { recipes, loading, error, searchRecipes } = useRecipes();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchRecipes(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, searchRecipes]);

  if (selectedRecipe) {
    return (
      <RecipeDetail
        recipe={selectedRecipe}
        onBack={() => setSelectedRecipe(null)}
        householdId={householdId}
        pantryItems={pantryItems}
      />
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Search Recipes</h2>

      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, ingredient, cuisine..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Searching recipes...</p>
        </div>
      )}

      {/* No Results */}
      {!loading && searchQuery && recipes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No recipes found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Try a different search term
          </p>
        </div>
      )}

      {/* Recipes Grid */}
      {recipes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onSelect={setSelectedRecipe}
            />
          ))}
        </div>
      )}

      {/* Initial State */}
      {!loading && !searchQuery && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            Start typing to search for recipes
          </p>
        </div>
      )}
    </div>
  );
}
